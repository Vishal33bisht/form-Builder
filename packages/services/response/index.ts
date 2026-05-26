import { db } from "@repo/database";
import {
  formResponsesTable,
  formsTable,
  formFieldsTable,
  usersTable,
  type InsertFormResponse,
  type SelectFormResponse,
} from "@repo/database/schema";
import { eq, desc, sql, and, gte, lte } from "@repo/database";

interface SubmitResponseInput {
  formId: string;
  answers: Array<{ fieldId: string; value: any }>;
  respondentEmail?: string;
  respondentIp?: string;
  userAgent?: string;
  metadata?: any;
}

interface GetResponsesInput {
  formId: string;
  userId: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

interface ResponseStats {
  totalResponses: number;
  todayResponses: number;
  weekResponses: number;
  responsesOverTime: Array<{ date: string; count: number }>;
}

class ResponseService {
  public async submitResponse(input: SubmitResponseInput): Promise<SelectFormResponse> {
    const {
      formId,
      answers,
      respondentEmail,
      respondentIp,
      userAgent,
      metadata,
    } = input;

    const [response] = await db
      .insert(formResponsesTable)
      .values({
        formId,
        answers,
        respondentEmail,
        respondentIp,
        userAgent,
        metadata,
      })
      .returning();

    return response;
  }

  public async getResponses(input: GetResponsesInput): Promise<{
    responses: SelectFormResponse[];
    total: number;
  }> {
    const { formId, userId, page = 1, limit = 20, startDate, endDate } = input;

    // Verify form ownership
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });

    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("Unauthorized to view responses for this form");
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(formResponsesTable.formId, formId)];
    
    if (startDate) {
      conditions.push(gte(formResponsesTable.submittedAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(formResponsesTable.submittedAt, endDate));
    }

    const responses = await db.query.formResponsesTable.findMany({
      where: and(...conditions),
      orderBy: [desc(formResponsesTable.submittedAt)],
      limit,
      offset,
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(formResponsesTable)
      .where(and(...conditions));

    return {
      responses,
      total: Number(totalResult[0].count),
    };
  }

  public async getResponseById(
    responseId: string,
    userId: string
  ): Promise<SelectFormResponse | null> {
    const response = await db.query.formResponsesTable.findFirst({
      where: eq(formResponsesTable.id, responseId),
    });

    if (!response) {
      return null;
    }

    // Verify ownership through form
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, response.formId),
    });

    if (!form || form.userId !== userId) {
      throw new Error("Unauthorized to view this response");
    }

    return response;
  }

  public async deleteResponse(responseId: string, userId: string): Promise<void> {
    const response = await db.query.formResponsesTable.findFirst({
      where: eq(formResponsesTable.id, responseId),
    });

    if (!response) {
      throw new Error("Response not found");
    }

    // Verify ownership through form
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, response.formId),
    });

    if (!form || form.userId !== userId) {
      throw new Error("Unauthorized to delete this response");
    }

    await db
      .delete(formResponsesTable)
      .where(eq(formResponsesTable.id, responseId));
  }

  public async exportToCsv(formId: string, userId: string): Promise<string> {
    // Verify ownership
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });

    if (!form || form.userId !== userId) {
      throw new Error("Unauthorized to export responses");
    }

    // Get all responses
    const responses = await db.query.formResponsesTable.findMany({
      where: eq(formResponsesTable.formId, formId),
      orderBy: [desc(formResponsesTable.submittedAt)],
    });

    // Get form fields for headers
    const fields = await db.query.formFieldsTable.findMany({
      where: eq(formFieldsTable.formId, formId),
      orderBy: [sql`${formFieldsTable.order} ASC`],
    });

    if (responses.length === 0) {
      return "No responses to export";
    }

    // Build CSV headers
    const headers = [
      "Response ID",
      "Submitted At",
      "Respondent Email",
      ...fields.map((f) => f.label),
    ];

    // Build CSV rows
    const rows = responses.map((response) => {
      const answers = response.answers as Array<{ fieldId: string; value: any }>;
      const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));

      return [
        response.id,
        response.submittedAt?.toISOString() || "",
        response.respondentEmail || "",
        ...fields.map((field) => {
          const value = answerMap.get(field.id);
          if (Array.isArray(value)) {
            return value.join("; ");
          }
          return value?.toString() || "";
        }),
      ];
    });

    // Convert to CSV string
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  public async getFormStats(formId: string, userId: string): Promise<ResponseStats> {
    // Verify ownership
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });

    if (!form || form.userId !== userId) {
      throw new Error("Unauthorized to view stats");
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total responses
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));

    // Today's responses
    const todayResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          gte(formResponsesTable.submittedAt, todayStart)
        )
      );

    // Week's responses
    const weekResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          gte(formResponsesTable.submittedAt, weekStart)
        )
      );

    // Responses over time (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const responsesOverTime = await db
      .select({
        date: sql<string>`DATE(${formResponsesTable.submittedAt})`,
        count: sql<number>`count(*)`,
      })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          gte(formResponsesTable.submittedAt, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${formResponsesTable.submittedAt})`)
      .orderBy(sql`DATE(${formResponsesTable.submittedAt}) ASC`);

    return {
      totalResponses: Number(totalResult[0].count),
      todayResponses: Number(todayResult[0].count),
      weekResponses: Number(weekResult[0].count),
      responsesOverTime: responsesOverTime.map((r) => ({
        date: r.date,
        count: Number(r.count),
      })),
    };
  }
}

export default ResponseService;