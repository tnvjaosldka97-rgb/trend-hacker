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
