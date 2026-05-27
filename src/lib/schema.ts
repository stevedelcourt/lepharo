import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  floor: integer("floor"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  role: text("role").notNull().default("resident"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const forumTopics = sqliteTable("forum_topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  rubrique: text("rubrique").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const forumReplies = sqliteTable("forum_replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const entraideListings = sqliteTable("entraide_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  pages: integer("pages").notNull().default(1),
  date: text("date").notNull(),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const alerts = sqliteTable("alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});
