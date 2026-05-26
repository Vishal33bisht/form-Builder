import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formResponsesTable = pgTable("form_responses", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  respondentEmail: varchar("respondent_email", { length: 255 }),
  respondentIp: varchar("respondent_ip", { length: 45 }),
  userAgent: text("user_agent"),

  answers: jsonb("answers").notNull(),

  submittedAt: timestamp("submitted_at").defaultNow(),
  metadata: jsonb("metadata"),
});

export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
export type InsertFormResponse = typeof formResponsesTable.$inferInsert;