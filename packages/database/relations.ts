import { relations } from "drizzle-orm";
import { usersTable } from "./models/user";
import { formsTable } from "./models/form";
import { formFieldsTable } from "./models/field";
import { formResponsesTable } from "./models/response";

export const usersRelations = relations(usersTable, ({ many }) => ({
  forms: many(formsTable),
}));

export const formsRelations = relations(formsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [formsTable.userId],
    references: [usersTable.id],
  }),
  fields: many(formFieldsTable),
  responses: many(formResponsesTable),
}));

export const formFieldsRelations = relations(formFieldsTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [formFieldsTable.formId],
    references: [formsTable.id],
  }),
}));

export const formResponsesRelations = relations(formResponsesTable, ({ one }) => ({
  form: one(formsTable, {
    fields: [formResponsesTable.formId],
    references: [formsTable.id],
  }),
}));