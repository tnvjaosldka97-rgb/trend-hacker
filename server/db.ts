import { eq, gte, desc, and, like, sql, or, isNull, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, influencers, contents, InsertContent, Influencer, Content, stockTweets, stocks, Stock, InsertStock, etfHoldings, EtfHolding, InsertEtfHolding, subscriptions, Subscription, InsertSubscription, freeTrialTracking } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Influencer queries
export async function getAllInfluencers(): Promise<Influencer[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(influencers).where(eq(influencers.isActive, 1)).orderBy(influencers.followerCount);
}

export async function getInfluencersByPlatform(platform: "youtube" | "twitter"): Promise<Influencer[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(influencers)
    .where(and(eq(influencers.platform, platform), eq(influencers.isActive, 1)))
    .orderBy(desc(influencers.followerCount));
}

export async function getInfluencerById(id: number): Promise<Influencer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(influencers).where(eq(influencers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Content queries - Only return contents from the last 7 days
export async function getAllContents(limit: number = 50): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get all contents (7-day filter already applied during collection)
  return await db.select().from(contents)
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

export async function getContentsByInfluencer(influencerId: number, limit: number = 20): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contents)
    .where(eq(contents.influencerId, influencerId))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

export async function getContentsByPlatform(platform: "youtube" | "twitter", limit: number = 50): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contents)
    .where(eq(contents.platform, platform))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

export async function searchContents(keyword: string, limit: number = 50): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return await db.select().from(contents)
    .where(and(
      sql`(${contents.title} LIKE ${`%${keyword}%`} OR ${contents.description} LIKE ${`%${keyword}%`})`,
      gte(contents.publishedAt, sevenDaysAgo)
    ))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

export async function getContentsWithInfluencer(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const result = await db
    .select({
      content: contents,
      influencer: influencers,
    })
    .from(contents)
    .leftJoin(influencers, eq(contents.influencerId, influencers.id))
    .where(gte(contents.publishedAt, sevenDaysAgo))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
  
  return result;
}

// Get contents without transcripts (for caption extraction)
export async function getContentsWithoutTranscripts(limit: number = 100): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contents)
    .where(and(
      eq(contents.platform, 'youtube'),
      isNull(contents.transcript)
    ))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

// Update content transcript
export async function updateContentTranscript(contentId: number, transcript: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update transcript: database not available");
    return;
  }
  
  await db.update(contents)
    .set({ transcript })
    .where(eq(contents.id, contentId));
}

// ============================================
// Expert Accuracy & Prediction Tracking
// ============================================

import { expertAccuracy, predictions, predictionResults, InsertExpertAccuracy, InsertPrediction, InsertPredictionResult } from "../drizzle/schema";

/**
 * Get expert accuracy by influencer ID
 */
export async function getExpertAccuracy(influencerId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(expertAccuracy)
    .where(eq(expertAccuracy.influencerId, influencerId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Upsert expert accuracy
 */
export async function upsertExpertAccuracy(data: InsertExpertAccuracy) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(expertAccuracy).values(data).onDuplicateKeyUpdate({
    set: {
      totalPredictions: data.totalPredictions,
      correctPredictions: data.correctPredictions,
      accuracyRate: data.accuracyRate,
      grade: data.grade,
      weight: data.weight,
      last30DaysAccuracy: data.last30DaysAccuracy,
      last90DaysAccuracy: data.last90DaysAccuracy,
      updatedAt: new Date(),
    },
  });
}

/**
 * Create prediction record
 */
export async function createPrediction(data: InsertPrediction) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(predictions).values(data);
}

/**
 * Get unverified predictions (7 days old)
 */
export async function getUnverifiedPredictions() {
  const db = await getDb();
  if (!db) return [];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return await db.select().from(predictions)
    .where(and(
      eq(predictions.isVerified, 0),
      sql`${predictions.predictedDate} <= ${sevenDaysAgo}`
    ))
    .limit(1000);
}

/**
 * Create prediction result
 */
export async function createPredictionResult(data: InsertPredictionResult) {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(predictionResults).values(data);
}

/**
 * Mark prediction as verified
 */
export async function markPredictionVerified(predictionId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(predictions)
    .set({ isVerified: 1, verificationDate: new Date() })
    .where(eq(predictions.id, predictionId));
}

/**
 * Calculate expert accuracy and update grade
 */
export async function calculateExpertAccuracy(influencerId: number) {
  const db = await getDb();
  if (!db) return;
  
  // Get all verified predictions for this expert
  const expertPredictions = await db.select({
    prediction: predictions,
    result: predictionResults,
  })
  .from(predictions)
  .leftJoin(predictionResults, eq(predictions.id, predictionResults.predictionId))
  .where(and(
    eq(predictions.influencerId, influencerId),
    eq(predictions.isVerified, 1)
  ));
  
  if (expertPredictions.length === 0) return;
  
  const total = expertPredictions.length;
  const correct = expertPredictions.filter(p => p.result?.isCorrect === 1).length;
  const accuracyRate = Math.round((correct / total) * 100);
  
  // Calculate last 30 days accuracy
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30Days = expertPredictions.filter(p => 
    p.prediction.predictedDate && new Date(p.prediction.predictedDate) >= thirtyDaysAgo
  );
  const last30DaysAccuracy = last30Days.length > 0
    ? Math.round((last30Days.filter(p => p.result?.isCorrect === 1).length / last30Days.length) * 100)
    : 0;
  
  // Calculate last 90 days accuracy
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const last90Days = expertPredictions.filter(p => 
    p.prediction.predictedDate && new Date(p.prediction.predictedDate) >= ninetyDaysAgo
  );
  const last90DaysAccuracy = last90Days.length > 0
    ? Math.round((last90Days.filter(p => p.result?.isCorrect === 1).length / last90Days.length) * 100)
    : 0;
  
  // Determine grade
  let grade: "S" | "A" | "B" | "C" | "D" = "C";
  let weight = 100; // 1.0x
  
  if (accuracyRate >= 90) {
    grade = "S";
    weight = 200; // 2.0x
  } else if (accuracyRate >= 80) {
    grade = "A";
    weight = 150; // 1.5x
  } else if (accuracyRate >= 70) {
    grade = "B";
    weight = 120; // 1.2x
  } else if (accuracyRate >= 60) {
    grade = "C";
    weight = 100; // 1.0x
  } else {
    grade = "D";
    weight = 50; // 0.5x
  }
  
  // Upsert accuracy record
  await upsertExpertAccuracy({
    influencerId,
    totalPredictions: total,
    correctPredictions: correct,
    accuracyRate,
    grade,
    weight,
    last30DaysAccuracy,
    last90DaysAccuracy,
  });
}

/**
 * Get top experts by accuracy
 */
export async function getTopExperts(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    accuracy: expertAccuracy,
    influencer: influencers,
  })
  .from(expertAccuracy)
  .leftJoin(influencers, eq(expertAccuracy.influencerId, influencers.id))
  .where(sql`${expertAccuracy.totalPredictions} >= 10`) // At least 10 predictions
  .orderBy(desc(expertAccuracy.accuracyRate))
  .limit(limit);
}

/**
 * Get predictions by influencer ID with results
 */
export async function getPredictionsByInfluencer(influencerId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    prediction: predictions,
    result: predictionResults,
  })
  .from(predictions)
  .leftJoin(predictionResults, eq(predictions.id, predictionResults.predictionId))
  .where(eq(predictions.influencerId, influencerId))
  .orderBy(sql`${predictions.predictedDate} DESC`)
  .limit(limit);
}


/**
 * Get top mentioned stocks with sentiment breakdown
 */
export async function getTopStocks(timeWindow: '15min' | '24h' | '7d', limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Calculate time threshold
  const now = new Date();
  let timeThreshold = new Date();
  if (timeWindow === '15min') {
    timeThreshold = new Date(now.getTime() - 15 * 60 * 1000);
  } else if (timeWindow === '24h') {
    timeThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeWindow === '7d') {
    timeThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get all tweets within time window from stockTweets table
  const tweets = await db.select().from(stockTweets)
    .where(gte(stockTweets.createdAt, timeThreshold));

  // Process in memory to group by ticker
  const stockMap = new Map<string, {
    ticker: string;
    mentionCount: number;
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
  }>();

  for (const tweet of tweets) {
    const ticker = tweet.ticker;
    if (!ticker) continue;

    const existing = stockMap.get(ticker) || {
      ticker,
      mentionCount: 0,
      bullishCount: 0,
      bearishCount: 0,
      neutralCount: 0,
    };

    existing.mentionCount++;
    if (tweet.sentiment === 'bullish') existing.bullishCount++;
    else if (tweet.sentiment === 'bearish') existing.bearishCount++;
    else existing.neutralCount++;

    stockMap.set(ticker, existing);
  }

  // Convert to array and sort by mention count
  return Array.from(stockMap.values())
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, limit);
}

// ============================================
// System Metadata Functions
// ============================================

/**
 * Get system metadata by key
 */
export async function getSystemMetadata(key: string) {
  const db = await getDb();
  if (!db) return null;

  const { systemMetadata } = await import('../drizzle/schema');
  const result = await db.select().from(systemMetadata).where(eq(systemMetadata.key, key)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Set system metadata
 */
export async function setSystemMetadata(key: string, value: string) {
  const db = await getDb();
  if (!db) return;

  const { systemMetadata } = await import('../drizzle/schema');
  
  await db.insert(systemMetadata)
    .values({ key, value })
    .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
}

// ============================================
// Stock Tweets Functions
// ============================================

/**
 * Get all tweets for a specific ticker (for detailed view)
 */
export async function getTweetsByTicker(ticker: string, timeRange: '24h' | '7d' = '24h', limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const timeAgo = timeRange === '24h' 
    ? new Date(Date.now() - 24 * 60 * 60 * 1000)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const tweets = await db.select().from(stockTweets)
    .where(
      and(
        eq(stockTweets.ticker, ticker),
        gte(stockTweets.createdAt, timeAgo)
      )
    )
    .orderBy(desc(stockTweets.createdAt))
    .limit(limit);

  return tweets;
}


// ============================================
// Stocks Functions
// ============================================

/**
 * Get stock information by ticker
 */
export async function getStockByTicker(ticker: string): Promise<Stock | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(stocks).where(eq(stocks.ticker, ticker.toUpperCase())).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Upsert stock information
 */
export async function upsertStock(stock: InsertStock) {
  const db = await getDb();
  if (!db) return;

  await db.insert(stocks)
    .values(stock)
    .onDuplicateKeyUpdate({
      set: {
        name: stock.name,
        logoUrl: stock.logoUrl,
        category: stock.category,
        exchange: stock.exchange,
        description: stock.description,
        updatedAt: new Date()
      }
    });
}

/**
 * Get all stocks
 */
export async function getAllStocks(limit: number = 100): Promise<Stock[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(stocks).limit(limit);
}

// ============================================
// ETF Holdings Functions
// ============================================

/**
 * Get ETF holdings by ETF ticker
 */
export async function getEtfHoldings(etfTicker: string): Promise<EtfHolding[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(etfHoldings)
    .where(eq(etfHoldings.etfTicker, etfTicker.toUpperCase()))
    .orderBy(desc(etfHoldings.weight));
}

/**
 * Upsert ETF holding
 */
export async function upsertEtfHolding(holding: InsertEtfHolding) {
  const db = await getDb();
  if (!db) return;

  await db.insert(etfHoldings)
    .values(holding)
    .onDuplicateKeyUpdate({
      set: {
        weight: holding.weight,
        shares: holding.shares,
        marketValue: holding.marketValue,
        updatedAt: new Date()
      }
    });
}


// ============================================
// Subscription Functions
// ============================================

/**
 * Get user subscription
 */
export async function getUserSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Upsert subscription
 */
export async function upsertSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) return;

  await db.insert(subscriptions)
    .values(subscription)
    .onDuplicateKeyUpdate({
      set: {
        plan: subscription.plan,
        status: subscription.status,
        expiresAt: subscription.expiresAt,
        updatedAt: new Date()
      }
    });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(subscriptions)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(eq(subscriptions.userId, userId));
}

/**
 * Create free trial subscription (7 days)
 */
export async function createFreeTrialSubscription(userId: number): Promise<Subscription | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if user already has a subscription
  const existing = await getUserSubscription(userId);
  if (existing) return existing;

  // Create free trial (7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(subscriptions).values({
    userId,
    plan: 'free',
    status: 'active',
    expiresAt,
  });

  return await getUserSubscription(userId);
}

/**
 * Check and expire free trial subscriptions
 */
export async function expireFreeTrials() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  
  await db.update(subscriptions)
    .set({ status: 'expired', updatedAt: now })
    .where(
      and(
        eq(subscriptions.plan, 'free'),
        eq(subscriptions.status, 'active'),
        lt(subscriptions.expiresAt, now)
      )
    );
}

/**
 * Increment on-demand usage counter
 */
export async function incrementOnDemandUsage(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(subscriptions)
    .set({ 
      onDemandUsed: sql`${subscriptions.onDemandUsed} + 1`,
      updatedAt: new Date()
    })
    .where(eq(subscriptions.userId, userId));
}

/**
 * Reset on-demand usage counter (monthly)
 */
export async function resetOnDemandUsage(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(subscriptions)
    .set({ 
      onDemandUsed: 0,
      onDemandResetAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(subscriptions.userId, userId));
}

// ==================== Subscription Management ====================

export async function getAllSubscriptionsWithUsers() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      subscription: subscriptions,
      user: users,
    })
    .from(subscriptions)
    .leftJoin(users, eq(users.id, subscriptions.userId));

  return result.map((row) => ({
    ...row.subscription,
    user: row.user || { id: 0, name: null, email: null, openId: "", role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), loginMethod: null },
  }));
}

export async function updateSubscriptionByUserId(
  userId: number,
  updates: Partial<{
    plan: "free" | "pro" | "premium";
    status: "active" | "cancelled" | "expired";
    expiresAt: Date | null;
    onDemandUsed: number;
  }>
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(subscriptions)
    .set(updates)
    .where(eq(subscriptions.userId, userId));

  return true;
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(subscriptions).values(subscription);
  return true;
}

// ==================== Free Trial Tracking ====================

export async function trackFreeTrial(data: {
  userId: number | null;
  ipAddress: string;
  deviceFingerprint: string;
  userAgent: string;
  trialExpiresAt: Date;
}) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(freeTrialTracking).values({
    ...data,
    trialStartedAt: new Date(),
    isBlocked: 0,
    createdAt: new Date(),
  });

  return true;
}

export async function getTrialByIpOrFingerprint(ipAddress: string, fingerprint: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(freeTrialTracking)
    .where(or(eq(freeTrialTracking.ipAddress, ipAddress), eq(freeTrialTracking.deviceFingerprint, fingerprint)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


// ==================== Super Admin - User Management ====================

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: users.id,
      openId: users.openId,
      name: users.name,
      email: users.email,
      loginMethod: users.loginMethod,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
      // Subscription info
      subscriptionPlan: subscriptions.plan,
      subscriptionStatus: subscriptions.status,
      subscriptionExpiresAt: subscriptions.expiresAt,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .orderBy(desc(users.createdAt));

  return result;
}

export async function updateUserRole(userId: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ role }).where(eq(users.id, userId));
}
