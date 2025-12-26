import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// Blog categories
export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // Hex color for UI
  order: integer("order").default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Content
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(), // Markdown
  coverImageUrl: text("cover_image_url"),

  // Author
  authorId: uuid("author_id").notNull().references(() => users.id),

  // Categorization
  categoryId: uuid("category_id").references(() => blogCategories.id, { onDelete: "set null" }),
  tags: varchar("tags", { length: 50 }).array(),

  // SEO
  metaTitle: varchar("meta_title", { length: 70 }),
  metaDescription: text("meta_description"),
  metaKeywords: varchar("meta_keywords", { length: 255 }).array(),

  // Publishing
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, archived
  publishedAt: timestamp("published_at"),
  scheduledFor: timestamp("scheduled_for"),

  // Engagement
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),

  // Reading time estimate (auto-calculated from content length)
  readingTimeMinutes: integer("reading_time_minutes"),

  // Featured post flag
  isFeatured: boolean("is_featured").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Blog comments
export const blogComments = pgTable("blog_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),

  // Content
  authorName: varchar("author_name", { length: 100 }), // For non-logged-in users
  authorEmail: varchar("author_email", { length: 255 }),
  content: text("content").notNull(),

  // Moderation
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, spam, rejected

  // Thread support
  parentCommentId: uuid("parent_comment_id"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Relations
export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  comments: many(blogComments),
}));

export const blogCommentsRelations = relations(blogComments, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [blogComments.userId],
    references: [users.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentCommentId],
    references: [blogComments.id],
  }),
}));
