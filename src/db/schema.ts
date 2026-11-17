import {
  boolean,
  customType,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

/** Single admin account (username + bcrypt hash). */
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 120 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/** Key/value store for every editable site setting, page body and ad code. */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 120 }).primaryKey(),
  value: text("value").notNull().default(""),
});

/** Blogs and Articles share one table, separated by `type`. */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: varchar("slug", { length: 300 }).notNull().unique(),
    type: varchar("type", { length: 20 }).notNull().default("blog"), // blog | article
    status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | published
    category: varchar("category", { length: 120 }).notNull().default("General"),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull().default(""), // unlimited length
    coverImage: text("cover_image").notNull().default(""),
    metaTitle: text("meta_title").notNull().default(""),
    metaDescription: text("meta_description").notNull().default(""),
    featured: boolean("featured").notNull().default(false),
    views: integer("views").notNull().default(0),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("posts_type_status_idx").on(t.type, t.status, t.publishedAt),
    index("posts_category_idx").on(t.category),
  ],
);

/** Contact form submissions. */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Uploaded images / videos, stored in the database so they work on any host. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: varchar("mime", { length: 120 }).notNull(),
  size: integer("size").notNull().default(0),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type Message = typeof messages.$inferSelect;
