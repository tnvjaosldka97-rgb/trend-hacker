import { eq, gte, desc, and, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, influencers, contents, InsertContent, Influencer, Content } from "../drizzle/schema";
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
  
  // Only get contents from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return await db.select().from(contents)
    .where(gte(contents.publishedAt, sevenDaysAgo))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

export async function getContentsByInfluencer(influencerId: number, limit: number = 20): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return await db.select().from(contents)
    .where(and(
      eq(contents.influencerId, influencerId),
      gte(contents.publishedAt, sevenDaysAgo)
    ))
    .orderBy(desc(contents.publishedAt))
    .limit(limit);
}

export async function getContentsByPlatform(platform: "youtube" | "twitter", limit: number = 50): Promise<Content[]> {
  const db = await getDb();
  if (!db) return [];
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return await db.select().from(contents)
    .where(and(
      eq(contents.platform, platform),
      gte(contents.publishedAt, sevenDaysAgo)
    ))
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
