import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  pgEnum,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const themeCategoryEnum = pgEnum("theme_category", [
  "movie",
  "anime",
  "game",
  "startup",
  "tech",
  "os",
  "event",
  "community",
]);

export const themesTable = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),

  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),

  category: themeCategoryEnum("category").notNull(),

  config: jsonb("config").notNull(),
    
  previewImageUrl: text("preview_image_url"),
  isDefault: boolean("is_default").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectTheme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;