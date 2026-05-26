import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  pgEnum,
  jsonb,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",
  "archived",
]);
export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
]);
export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  slug: varchar("slug", { length: 100 }).notNull().unique(),

  status: formStatusEnum("status").default("draft").notNull(),
  visibility: formVisibilityEnum("visibility").default("unlisted").notNull(),

  theme: jsonb("theme"),
  settings: jsonb("settings"),

  isPasswordProtected: boolean("is_password_protected").default(false),
  responseLimit: integer("response_limit"),
  expiresAt: timestamp("expires_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;