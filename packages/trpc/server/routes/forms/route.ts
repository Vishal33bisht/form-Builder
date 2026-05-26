import { z, zodUndefinedModel } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { FormService } from "@repo/services";
import { TRPCError } from "@trpc/server";

const formService = new FormService();

const formSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  visibility: z.enum(["public", "unlisted"]),
  theme: z.any().nullable(),
  settings: z.any().nullable(),
  isPasswordProtected: z.boolean().nullable(),
  responseLimit: z.number().nullable(),
  expiresAt: z.date().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

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

export const formsRouter = router({
  create: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms",
        tags: ["Forms"],
        summary: "Create a new form",
        protect: true,
      },
    })
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        slug: z.string().max(100).optional(),
        visibility: z.enum(["public", "unlisted"]).optional(),
        themeId: z.string().optional(),
      })
    )
    .output(formSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.createForm({
        ...input,
        userId: ctx.user.id,
      });
      return form as any;
    }),

  update: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/forms/{formId}",
        tags: ["Forms"],
        summary: "Update a form",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        slug: z.string().max(100).optional(),
        visibility: z.enum(["public", "unlisted"]).optional(),
        theme: z.any().optional(),
        settings: z.any().optional(),
        isPasswordProtected: z.boolean().optional(),
        responseLimit: z.number().optional(),
        expiresAt: z.date().nullable().optional(),
      })
    )
    .output(formSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.updateForm({
        ...input,
        userId: ctx.user.id,
      });
      return form as any;
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/forms/{formId}",
        tags: ["Forms"],
        summary: "Delete a form (soft delete)",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await formService.deleteForm(input.formId, ctx.user.id);
      return { success: true };
    }),

  publish: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{formId}/publish",
        tags: ["Forms"],
        summary: "Publish a form",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .output(formSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.publishForm(input.formId, ctx.user.id);
      return form as any;
    }),

  unpublish: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{formId}/unpublish",
        tags: ["Forms"],
        summary: "Unpublish a form",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .output(formSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.unpublishForm(input.formId, ctx.user.id);
      return form as any;
    }),

  list: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms",
        tags: ["Forms"],
        summary: "Get all forms for current user",
        protect: true,
      },
    })
    .input(zodUndefinedModel)
    .output(z.array(formSchema))
    .query(async ({ ctx }) => {
      const forms = await formService.getFormsByUserId(ctx.user.id);
      return forms as any;
    }),

  getById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/{formId}",
        tags: ["Forms"],
        summary: "Get form by ID with fields",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .output(
      z.object({
        form: formSchema,
        fields: z.array(formFieldSchema),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await formService.getFormWithFields(input.formId);
      
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Verify ownership
      if (result.form.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this form",
        });
      }

      return result as any;
    }),

  getBySlug: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/slug/{slug}",
        tags: ["Forms"],
        summary: "Get published form by slug (public)",
      },
    })
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .output(
      z.object({
        form: formSchema,
        fields: z.array(formFieldSchema),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await formService.getFormBySlug(input.slug);

        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Form not found",
          });
        }

        return result as any;
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to fetch form",
        });
      }
    }),

  getPublicForms: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/forms/public",
        tags: ["Forms"],
        summary: "Get all published public forms",
      },
    })
    .input(
      z.object({
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
        category: z.string().optional(),
      })
    )
    .output(
      z.object({
        forms: z.array(formSchema),
        total: z.number(),
      })
    )
    .query(async ({ input }) => {
      const result = await formService.getPublicForms(input);
      return result as any;
    }),

  clone: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/forms/{formId}/clone",
        tags: ["Forms"],
        summary: "Clone a form",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .output(formSchema)
    .mutation(async ({ input, ctx }) => {
      const form = await formService.cloneForm(input.formId, ctx.user.id);
      return form as any;
    }),
});
