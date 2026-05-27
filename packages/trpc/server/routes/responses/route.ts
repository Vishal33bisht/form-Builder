import { z } from "../../schema";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import {
  ResponseService,
  FormService,
  RateLimitService,
  EmailService,
} from "@repo/services";
import { TRPCError } from "@trpc/server";
import {
  db,
  formsTable,
  formResponsesTable,
  usersTable,
  eq,
  sql,
} from "@repo/database";

const responseService = new ResponseService();
const formService = new FormService();
const rateLimitService = new RateLimitService();
const emailService = new EmailService();

const formResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  respondentEmail: z.string().nullable(),
  respondentIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  answers: z.any(),
  submittedAt: z.date().nullable(),
  metadata: z.any().nullable(),
});

export const responsesRouter = router({
  submit: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/responses",
        tags: ["Responses"],
        summary: "Submit a form response",
      },
    })
    .input(
      z.object({
        formId: z.string(),
        answers: z.array(
          z.object({
            fieldId: z.string(),
            value: z.any(),
          })
        ),
        respondentEmail: z.string().email().optional(),
        metadata: z.any().optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        responseId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting
      try {
        rateLimitService.checkLimit(ctx.ip);
      } catch (error: any) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: error.message,
        });
      }

      // Get form with fields
      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, input.formId),
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      if (form.status !== "published") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Form is not published",
        });
      }

      if (form.isPasswordProtected) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Password-protected forms are not available",
        });
      }

      if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Form expired",
        });
      }

      if (form.responseLimit !== null && form.responseLimit !== undefined) {
        const responseCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(formResponsesTable)
          .where(eq(formResponsesTable.formId, form.id));

        if (Number(responseCount[0]?.count ?? 0) >= form.responseLimit) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Form response limit reached",
          });
        }
      }

      const formData = await formService.getFormWithFields(input.formId);

      if (!formData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found",
        });
      }

      // Validate answers
      const validation = formService.validateResponse(
        formData.fields,
        input.answers
      );

      if (!validation.isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Validation failed",
          cause: validation.errors,
        });
      }

      // Submit response
      const response = await responseService.submitResponse({
        formId: input.formId,
        answers: input.answers,
        respondentEmail: input.respondentEmail,
        respondentIp: ctx.ip,
        userAgent: ctx.userAgent,
        metadata: input.metadata,
      });

      const creator = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, form.userId),
      });

      await emailService
        .sendResponseNotifications({
          formTitle: form.title,
          formSlug: form.slug,
          creatorEmail: creator?.email,
          respondentEmail: input.respondentEmail,
        })
        .catch(() => undefined);

      return {
        success: true,
        responseId: response.id,
      };
    }),

  list: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/responses/{formId}",
        tags: ["Responses"],
        summary: "Get all responses for a form",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .output(
      z.object({
        responses: z.array(formResponseSchema),
        total: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const result = await responseService.getResponses({
        ...input,
        userId: ctx.user.id,
      });
      return result as any;
    }),

  getById: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/responses/single/{responseId}",
        tags: ["Responses"],
        summary: "Get a single response by ID",
        protect: true,
      },
    })
    .input(
      z.object({
        responseId: z.string(),
      })
    )
    .output(formResponseSchema)
    .query(async ({ input, ctx }) => {
      const response = await responseService.getResponseById(
        input.responseId,
        ctx.user.id
      );

      if (!response) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Response not found",
        });
      }

      return response as any;
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/responses/{responseId}",
        tags: ["Responses"],
        summary: "Delete a response",
        protect: true,
      },
    })
    .input(
      z.object({
        responseId: z.string(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await responseService.deleteResponse(input.responseId, ctx.user.id);
      return { success: true };
    }),

  exportCsv: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/responses/{formId}/export",
        tags: ["Responses"],
        summary: "Export responses as CSV",
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
        csv: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const csv = await responseService.exportToCsv(input.formId, ctx.user.id);
      return { csv };
    }),
});
