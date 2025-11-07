import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * System metadata table - stores system-wide settings and timestamps
 */
export const systemMetadata = mysqlTable("systemMetadata", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemMetadata = typeof systemMetadata.$inferSelect;
export type InsertSystemMetadata = typeof systemMetadata.$inferInsert;

/**
 * AI Reports table - stores generated AI reports for users
 */
export const aiReports = mysqlTable("aiReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["pro", "premium"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  reportDate: timestamp("reportDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiReport = typeof aiReports.$inferSelect;
export type InsertAiReport = typeof aiReports.$inferInsert;

/**
 * Influencers table - stores information about tracked influencers
 */
export const influencers = mysqlTable("influencers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["youtube", "twitter"]).notNull(),
  handle: varchar("handle", { length: 255 }).notNull(),
  platformUserId: varchar("platformUserId", { length: 255 }),
  avatarUrl: text("avatarUrl"),
  bio: text("bio"),
  followerCount: int("followerCount"),
  specialty: varchar("specialty", { length: 255 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Influencer = typeof influencers.$inferSelect;
export type InsertInfluencer = typeof influencers.$inferInsert;

/**
 * Stock Tweets table - stores tweets mentioning stocks
 */
export const stockTweets = mysqlTable("stockTweets", {
  id: int("id").autoincrement().primaryKey(),
  tweetId: varchar("tweetId", { length: 255 }).notNull().unique(),
  authorUsername: varchar("authorUsername", { length: 255 }).notNull(),
  authorName: varchar("authorName", { length: 255 }),
  text: text("text").notNull(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  sentiment: mysqlEnum("sentiment", ["bullish", "bearish", "neutral"]).notNull(),
  url: text("url"),
  likeCount: int("likeCount").default(0),
  retweetCount: int("retweetCount").default(0),
  createdAt: timestamp("createdAt").notNull(),
  collectedAt: timestamp("collectedAt").defaultNow().notNull(),
});

export type StockTweet = typeof stockTweets.$inferSelect;
export type InsertStockTweet = typeof stockTweets.$inferInsert;

/**
 * Contents table - stores collected content from influencers
 */
export const contents = mysqlTable("contents", {
  id: int("id").autoincrement().primaryKey(),
  influencerId: int("influencerId").notNull(),
  platform: mysqlEnum("platform", ["youtube", "twitter"]).notNull(),
  contentType: mysqlEnum("contentType", ["video", "tweet"]).notNull(),
  title: text("title"),
  description: text("description"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  platformContentId: varchar("platformContentId", { length: 255 }).notNull(),
  publishedAt: timestamp("publishedAt").notNull(),
  viewCount: int("viewCount"),
  likeCount: int("likeCount"),
  commentCount: int("commentCount"),
  transcript: text("transcript"),
  aiSummary: text("aiSummary"),
  aiStocks: text("aiStocks"),
  aiSentiment: varchar("aiSentiment", { length: 20 }),
  aiKeyPoints: text("aiKeyPoints"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Content = typeof contents.$inferSelect;
export type InsertContent = typeof contents.$inferInsert;

/**
 * Expert Accuracy table - tracks expert prediction accuracy
 */
export const expertAccuracy = mysqlTable("expertAccuracy", {
  id: int("id").autoincrement().primaryKey(),
  influencerId: int("influencerId").notNull(),
  totalPredictions: int("totalPredictions").default(0).notNull(),
  correctPredictions: int("correctPredictions").default(0).notNull(),
  accuracyRate: int("accuracyRate").default(0).notNull(), // 0-100
  grade: mysqlEnum("grade", ["S", "A", "B", "C", "D"]).default("C").notNull(),
  weight: int("weight").default(100).notNull(), // 100 = 1.0x, 200 = 2.0x
  last30DaysAccuracy: int("last30DaysAccuracy").default(0).notNull(),
  last90DaysAccuracy: int("last90DaysAccuracy").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpertAccuracy = typeof expertAccuracy.$inferSelect;
export type InsertExpertAccuracy = typeof expertAccuracy.$inferInsert;

/**
 * Predictions table - stores all expert predictions
 */
export const predictions = mysqlTable("predictions", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  influencerId: int("influencerId").notNull(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  sentiment: mysqlEnum("sentiment", ["bullish", "bearish", "neutral"]).notNull(),
  priceAtPrediction: int("priceAtPrediction"), // in cents
  predictedDate: timestamp("predictedDate").notNull(),
  verificationDate: timestamp("verificationDate"), // 7 days later
  isVerified: int("isVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

/**
 * Prediction Results table - stores verification results
 */
export const predictionResults = mysqlTable("predictionResults", {
  id: int("id").autoincrement().primaryKey(),
  predictionId: int("predictionId").notNull(),
  priceAfter7Days: int("priceAfter7Days"), // in cents
  priceChange: int("priceChange"), // percentage * 100 (850 = 8.5%)
  isCorrect: int("isCorrect").notNull(), // 1 = correct, 0 = incorrect
  verifiedAt: timestamp("verifiedAt").defaultNow().notNull(),
});

export type PredictionResult = typeof predictionResults.$inferSelect;
export type InsertPredictionResult = typeof predictionResults.$inferInsert;

/**
 * Stocks table - stores stock master data
 */
export const stocks = mysqlTable("stocks", {
  ticker: varchar("ticker", { length: 10 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"),
  category: varchar("category", { length: 50 }), // Tech, Finance, Healthcare, etc.
  exchange: varchar("exchange", { length: 20 }), // NASDAQ, NYSE, etc.
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = typeof stocks.$inferInsert;

/**
 * ETF Holdings table - stores ETF portfolio composition
 */
export const etfHoldings = mysqlTable("etfHoldings", {
  id: int("id").autoincrement().primaryKey(),
  etfTicker: varchar("etfTicker", { length: 10 }).notNull(),
  stockTicker: varchar("stockTicker", { length: 10 }).notNull(),
  weight: int("weight").notNull(), // percentage * 100 (850 = 8.5%)
  shares: int("shares"), // number of shares
  marketValue: int("marketValue"), // in cents
  marketCap: varchar("marketCap", { length: 20 }), // market cap as string to avoid overflow
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EtfHolding = typeof etfHoldings.$inferSelect;
export type InsertEtfHolding = typeof etfHoldings.$inferInsert;

/**
 * User Portfolios table - stores user's stock/ETF holdings
 */
export const userPortfolios = mysqlTable("userPortfolios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  shares: int("shares"), // number of shares
  isEtf: int("isEtf").default(0).notNull(), // 1 = ETF, 0 = individual stock
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPortfolio = typeof userPortfolios.$inferSelect;
export type InsertUserPortfolio = typeof userPortfolios.$inferInsert;

/**
 * Watchlists table - stores user's watchlist
 */
export const watchlists = mysqlTable("watchlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticker: varchar("ticker", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = typeof watchlists.$inferInsert;

/**
 * Subscriptions table - stores user subscription plans
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "premium"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  onDemandUsed: int("onDemandUsed").default(0).notNull(), // Pro: 3/month, Premium: unlimited
  onDemandResetAt: timestamp("onDemandResetAt").defaultNow().notNull(), // Reset monthly
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
