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
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
