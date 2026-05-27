import { z } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { db, formFieldsTable, formsTable, eq } from "@repo/database";
import { TRPCError } from "@trpc/server";

const formFieldSchema = z.object({
  id: z.string(),
  formId: z.string(),
  type: z.enum([
    "short_text",
    "long_text",
    "email",
    "number",
    "single_select",
    "multi_select",
    "checkbox",
    "rating",
    "date",
    "dropdown",
  ]),
  label: z.string(),
  placeholder: z.string().nullable(),
  description: z.string().nullable(),
  required: z.boolean().nullable(),
  order: z.number(),
  options: z.any().nullable(),
  validations: z.any().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

const fieldOptionSchema = z.object({
  label: z.string().min(1).max(255),
  value: z.string().min(1).max(255),
});

const fieldValidationsSchema = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
  })
  .refine(
    (value) =>
      value.min === undefined ||
      value.max === undefined ||
      value.min <= value.max,
    { message: "min must be less than or equal to max" }
  )
  .refine(
    (value) =>
      value.minLength === undefined ||
      value.maxLength === undefined ||
      value.minLength <= value.maxLength,
    { message: "minLength must be less than or equal to maxLength" }
  );

const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "rating",
  "date",
  "dropdown",
]);

export const fieldsRouter = router({
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/fields",
        tags: ["Fields"],
        summary: "Create a new form field",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        type: fieldTypeSchema,
        label: z.string().min(1).max(500),
        placeholder: z.string().max(255).optional(),
        description: z.string().optional(),
        required: z.boolean().optional(),
        order: z.number(),
        options: z.array(fieldOptionSchema).optional(),
        validations: fieldValidationsSchema.optional(),
      })
    )
    .output(formFieldSchema)
    .mutation(async ({ input, ctx }) => {
      // Verify form ownership
      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, input.formId),
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this form",
        });
      }

      const [field] = await db
        .insert(formFieldsTable)
        .values({
          formId: input.formId,
          type: input.type,
          label: input.label,
          placeholder: input.placeholder,
          description: input.description,
          required: input.required ?? false,
          order: input.order,
          options: input.options,
          validations: input.validations,
        })
        .returning();

      if (!field) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create field",
        });
      }

      return field as any;
    }),

  update: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/fields/{fieldId}",
        tags: ["Fields"],
        summary: "Update a form field",
        protect: true,
      },
    })
    .input(
      z.object({
        fieldId: z.string(),
        label: z.string().min(1).max(500).optional(),
        placeholder: z.string().max(255).optional(),
        description: z.string().optional(),
        required: z.boolean().optional(),
        order: z.number().optional(),
        options: z.array(fieldOptionSchema).optional(),
        validations: fieldValidationsSchema.optional(),
      })
    )
    .output(formFieldSchema)
    .mutation(async ({ input, ctx }) => {
      const { fieldId, ...updates } = input;

      // Get field and verify ownership through form
      const field = await db.query.formFieldsTable.findFirst({
        where: eq(formFieldsTable.id, fieldId),
      });

      if (!field) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Field not found",
        });
      }

      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, field.formId),
      });

      if (!form || form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this field",
        });
      }

      const [updatedField] = await db
        .update(formFieldsTable)
        .set(updates)
        .where(eq(formFieldsTable.id, fieldId))
        .returning();

      if (!updatedField) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update field",
        });
      }

      return updatedField as any;
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/fields/{fieldId}",
        tags: ["Fields"],
        summary: "Delete a form field",
        protect: true,
      },
    })
    .input(
      z.object({
        fieldId: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get field and verify ownership through form
      const field = await db.query.formFieldsTable.findFirst({
        where: eq(formFieldsTable.id, input.fieldId),
      });

      if (!field) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Field not found",
        });
      }

      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, field.formId),
      });

      if (!form || form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this field",
        });
      }

      await db.delete(formFieldsTable).where(eq(formFieldsTable.id, input.fieldId));

      return { success: true };
    }),

  reorder: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/fields/reorder",
        tags: ["Fields"],
        summary: "Reorder form fields",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        fieldIds: z.array(z.string()),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify form ownership
      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, input.formId),
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this form",
        });
      }

      // Update order for each field
      for (let i = 0; i < input.fieldIds.length; i++) {
        const fieldId = input.fieldIds[i];
        if (!fieldId) continue;

        await db
          .update(formFieldsTable)
          .set({ order: i })
          .where(eq(formFieldsTable.id, fieldId));
      }

      return { success: true };
    }),
});
