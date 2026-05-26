import { z } from "../../schema";
import { protectedProcedure, router } from "../../trpc";
import { ResponseService } from "@repo/services";
import { db, formResponsesTable, formsTable, formFieldsTable, eq, sql, desc } from "@repo/database";

const responseService = new ResponseService();

export const analyticsRouter = router({
  getFormStats: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/analytics/forms/{formId}",
        tags: ["Analytics"],
        summary: "Get analytics for a specific form",
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
        totalResponses: z.number(),
        todayResponses: z.number(),
        weekResponses: z.number(),
        responsesOverTime: z.array(
          z.object({
            date: z.string(),
            count: z.number(),
          })
        ),
      })
    )
    .query(async ({ input, ctx }) => {
      const stats = await responseService.getFormStats(input.formId, ctx.user.id);
      return stats;
    }),

  getFieldStats: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/analytics/forms/{formId}/fields",
        tags: ["Analytics"],
        summary: "Get per-field analytics",
        protect: true,
      },
    })
    .input(
      z.object({
        formId: z.string(),
      })
    )
    .output(
      z.array(
        z.object({
          fieldId: z.string(),
          fieldLabel: z.string(),
          fieldType: z.string(),
          stats: z.any(),
        })
      )
    )
    .query(async ({ input, ctx }) => {
      // Verify form ownership
      const form = await db.query.formsTable.findFirst({
        where: eq(formsTable.id, input.formId),
      });

      if (!form || form.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Get all fields
      const fields = await db.query.formFieldsTable.findMany({
        where: eq(formFieldsTable.formId, input.formId),
      });

      // Get all responses
      const responses = await db.query.formResponsesTable.findMany({
        where: eq(formResponsesTable.formId, input.formId),
      });

      // Calculate stats per field
      const fieldStats = fields.map((field) => {
        const answers = responses
          .map((r) => {
            const answerArray = r.answers as Array<{ fieldId: string; value: any }>;
            const answer = answerArray.find((a) => a.fieldId === field.id);
            return answer?.value;
          })
          .filter((v) => v !== undefined && v !== null && v !== "");

        let stats: any = {};

        switch (field.type) {
          case "rating":
          case "number":
            const numbers = answers.map(Number).filter((n) => !isNaN(n));
            stats = {
              average: numbers.length > 0
                ? numbers.reduce((a, b) => a + b, 0) / numbers.length
                : 0,
              min: numbers.length > 0 ? Math.min(...numbers) : 0,
              max: numbers.length > 0 ? Math.max(...numbers) : 0,
              totalResponses: numbers.length,
            };
            break;

          case "single_select":
          case "dropdown":
            const counts: Record<string, number> = {};
            answers.forEach((answer) => {
              counts[answer] = (counts[answer] || 0) + 1;
            });
            stats = {
              distribution: Object.entries(counts).map(([value, count]) => ({
                value,
                count,
                percentage: (count / answers.length) * 100,
              })),
              totalResponses: answers.length,
            };
            break;

          case "multi_select":
            const multiCounts: Record<string, number> = {};
            answers.forEach((answer) => {
              if (Array.isArray(answer)) {
                answer.forEach((val) => {
                  multiCounts[val] = (multiCounts[val] || 0) + 1;
                });
              }
            });
            stats = {
              distribution: Object.entries(multiCounts).map(([value, count]) => ({
                value,
                count,
              })),
              totalResponses: answers.length,
            };
            break;

          case "checkbox":
            const trueCount = answers.filter((a) => a === true).length;
            stats = {
              trueCount,
              falseCount: answers.length - trueCount,
              totalResponses: answers.length,
            };
            break;

          default:
            stats = {
              totalResponses: answers.length,
              sampleAnswers: answers.slice(0, 5),
            };
        }

        return {
          fieldId: field.id,
          fieldLabel: field.label,
          fieldType: field.type,
          stats,
        };
      });

      return fieldStats;
    }),

  getOverallStats: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/analytics/overall",
        tags: ["Analytics"],
        summary: "Get overall analytics across all user forms",
        protect: true,
      },
    })
    .input(z.object({}))
    .output(
      z.object({
        totalForms: z.number(),
        totalResponses: z.number(),
        publishedForms: z.number(),
        draftForms: z.number(),
        topForms: z.array(
          z.object({
            formId: z.string(),
            formTitle: z.string(),
            responseCount: z.number(),
          })
        ),
      })
    )
    .query(async ({ ctx }) => {
      // Get all user's forms
      const forms = await db.query.formsTable.findMany({
        where: eq(formsTable.userId, ctx.user.id),
      });

      const totalForms = forms.length;
      const publishedForms = forms.filter((f) => f.status === "published").length;
      const draftForms = forms.filter((f) => f.status === "draft").length;

      // Get response counts per form
      const formResponseCounts = await Promise.all(
        forms.map(async (form) => {
          const count = await db
            .select({ count: sql<number>`count(*)` })
            .from(formResponsesTable)
            .where(eq(formResponsesTable.formId, form.id));

          return {
            formId: form.id,
            formTitle: form.title,
            responseCount: Number(count[0].count),
          };
        })
      );

      const totalResponses = formResponseCounts.reduce(
        (sum, f) => sum + f.responseCount,
        0
      );

      const topForms = formResponseCounts
        .sort((a, b) => b.responseCount - a.responseCount)
        .slice(0, 5);

      return {
        totalForms,
        totalResponses,
        publishedForms,
        draftForms,
        topForms,
      };
    }),
});