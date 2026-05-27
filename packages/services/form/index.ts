import { db } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  type InsertForm,
  type SelectForm,
  type SelectFormField,
} from "@repo/database/schema";
import { eq, and, sql, desc, asc } from "@repo/database";
import { z } from "zod";

interface CreateFormInput {
  userId: string;
  title: string;
  description?: string;
  slug?: string;
  visibility?: "public" | "unlisted";
  themeId?: string;
}

interface UpdateFormInput {
  formId: string;
  userId: string;
  title?: string;
  description?: string;
  slug?: string;
  visibility?: "public" | "unlisted";
  theme?: any;
  settings?: any;
  isPasswordProtected?: boolean;
  responseLimit?: number;
  expiresAt?: Date | null;
}

interface GetPublicFormsInput {
  page?: number;
  limit?: number;
  category?: string;
}

class FormService {
  public async createForm(input: CreateFormInput): Promise<SelectForm> {
    const { userId, title, description, slug, visibility, themeId } = input;

    // Generate slug if not provided
    const formSlug =
      slug || this.generateSlug(title) + "-" + Date.now().toString(36);

    // Check if slug already exists
    const existingForm = await db.query.formsTable.findFirst({
      where: eq(formsTable.slug, formSlug),
    });

    if (existingForm) {
      throw new Error("A form with this slug already exists");
    }

    const [newForm] = await db
      .insert(formsTable)
      .values({
        userId,
        title,
        description,
        slug: formSlug,
        visibility: visibility || "unlisted",
        status: "draft",
        theme: themeId ? { themeId } : null,
      })
      .returning();

    if (!newForm) {
      throw new Error("Failed to create form");
    }

    return newForm;
  }

  public async updateForm(input: UpdateFormInput): Promise<SelectForm> {
    const { formId, userId, ...updates } = input;

    // Verify ownership
    const form = await this.getFormById(formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("Unauthorized to update this form");
    }

    // Check slug uniqueness if updating
    if (updates.slug && updates.slug !== form.slug) {
      const existingForm = await db.query.formsTable.findFirst({
        where: eq(formsTable.slug, updates.slug),
      });

      if (existingForm) {
        throw new Error("A form with this slug already exists");
      }
    }

    const [updatedForm] = await db
      .update(formsTable)
      .set(updates)
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to update form");
    }

    return updatedForm;
  }

  public async deleteForm(formId: string, userId: string): Promise<void> {
    // Verify ownership
    const form = await this.getFormById(formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("Unauthorized to delete this form");
    }

    // Soft delete by archiving
    await db
      .update(formsTable)
      .set({ status: "archived" })
      .where(eq(formsTable.id, formId));
  }

  public async publishForm(formId: string, userId: string): Promise<SelectForm> {
    const form = await this.getFormById(formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("Unauthorized to publish this form");
    }

    const [updatedForm] = await db
      .update(formsTable)
      .set({ status: "published" })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to publish form");
    }

    return updatedForm;
  }

  public async unpublishForm(formId: string, userId: string): Promise<SelectForm> {
    const form = await this.getFormById(formId);
    if (!form) {
      throw new Error("Form not found");
    }

    if (form.userId !== userId) {
      throw new Error("Unauthorized to unpublish this form");
    }

    const [updatedForm] = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updatedForm) {
      throw new Error("Failed to unpublish form");
    }

    return updatedForm;
  }

  public async getFormsByUserId(userId: string): Promise<SelectForm[]> {
    const forms = await db.query.formsTable.findMany({
      where: eq(formsTable.userId, userId),
      orderBy: [desc(formsTable.createdAt)],
    });

    return forms;
  }

  public async getFormById(formId: string): Promise<SelectForm | undefined> {
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
    });

    return form;
  }

  public async getFormWithFields(formId: string): Promise<{
    form: SelectForm;
    fields: SelectFormField[];
  } | null> {
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, formId),
      with: {
        fields: {
          orderBy: [asc(formFieldsTable.order)],
        },
      },
    });

    if (!form) {
      return null;
    }

    return {
      form,
      fields: form.fields || [],
    };
  }

  public async getFormBySlug(slug: string): Promise<{
    form: SelectForm;
    fields: SelectFormField[];
  } | null> {
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.slug, slug),
    });

    if (!form) {
      return null;
    }

    // Check if form is published
    if (form.status !== "published") {
      throw new Error("This form is not published");
    }

    if (form.isPasswordProtected) {
      throw new Error("Password-protected forms are not available");
    }

    // Check expiry
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      throw new Error("This form has expired");
    }

    // Check response limit
    if (form.responseLimit) {
      const responseCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(formResponsesTable)
        .where(eq(formResponsesTable.formId, form.id));

      if (Number(responseCount[0]?.count ?? 0) >= form.responseLimit) {
        throw new Error("This form has reached its response limit");
      }
    }

    // Get fields
    const fields = await db.query.formFieldsTable.findMany({
      where: eq(formFieldsTable.formId, form.id),
      orderBy: [asc(formFieldsTable.order)],
    });

    return {
      form,
      fields,
    };
  }

  public async getPublicForms(input: GetPublicFormsInput = {}): Promise<{
    forms: SelectForm[];
    total: number;
  }> {
    const { page = 1, limit = 12 } = input;
    const offset = (page - 1) * limit;

    const forms = await db.query.formsTable.findMany({
      where: and(
        eq(formsTable.status, "published"),
        eq(formsTable.visibility, "public")
      ),
      orderBy: [desc(formsTable.createdAt)],
      limit,
      offset,
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public")
        )
      );

    return {
      forms,
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  public async cloneForm(formId: string, userId: string): Promise<SelectForm> {
    // Get original form with fields
    const formWithFields = await this.getFormWithFields(formId);

    if (!formWithFields) {
      throw new Error("Form not found");
    }

    const { form, fields } = formWithFields;

    // Create new form (copy)
    const newSlug = `${form.slug}-copy-${Date.now().toString(36)}`;

    const [clonedForm] = await db
      .insert(formsTable)
      .values({
        userId,
        title: `${form.title} (Copy)`,
        description: form.description,
        slug: newSlug,
        visibility: form.visibility,
        status: "draft",
        theme: form.theme,
        settings: form.settings,
      })
      .returning();

    if (!clonedForm) {
      throw new Error("Failed to clone form");
    }

    // Clone fields
    if (fields.length > 0) {
      await db.insert(formFieldsTable).values(
        fields.map((field) => ({
          formId: clonedForm.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          description: field.description,
          required: field.required,
          order: field.order,
          options: field.options,
          validations: field.validations,
        }))
      );
    }

    return clonedForm;
  }

  public validateResponse(
    fields: SelectFormField[],
    answers: Array<{ fieldId: string; value: any }>
  ): { isValid: boolean; errors: Record<string, string> } {
    const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));
    const answerValues = Object.fromEntries(answerMap);
    const responseShape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
      const fieldSchema = this.buildResponseFieldSchema(field);
      responseShape[field.id] = field.required
        ? z
            .any()
            .superRefine((value, ctx) => {
              if (
                value === undefined ||
                value === null ||
                value === "" ||
                (Array.isArray(value) && value.length === 0)
              ) {
                ctx.addIssue({
                  code: "custom",
                  message: `${field.label} is required`,
                });
              }
            })
            .pipe(fieldSchema)
        : z
            .union([fieldSchema, z.literal(""), z.null(), z.undefined()])
            .optional();
    }

    const result = z.object(responseShape).safeParse(answerValues);

    if (result.success) {
      return {
        isValid: true,
        errors: {},
      };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const fieldId = issue.path[0]?.toString();
      if (fieldId && !errors[fieldId]) {
        errors[fieldId] = issue.message || "Invalid answer";
      }
    }

    return {
      isValid: false,
      errors,
    };
  }

  private buildResponseFieldSchema(field: SelectFormField): z.ZodTypeAny {
    const validations = (field.validations || {}) as Record<string, any>;
    const optionValues = Array.isArray(field.options)
      ? field.options.map((option: any) => option.value)
      : [];

    switch (field.type) {
      case "email":
        return z.string().trim().email();
      case "number": {
        let schema = z.coerce.number();
        if (validations.min !== undefined) {
          schema = schema.min(validations.min);
        }
        if (validations.max !== undefined) {
          schema = schema.max(validations.max);
        }
        return schema;
      }
      case "rating": {
        const max = validations.max || 5;
        return z.coerce.number().int().min(1).max(max);
      }
      case "short_text":
      case "long_text": {
        let schema = z.string();
        if (validations.minLength) {
          schema = schema.min(validations.minLength);
        }
        if (validations.maxLength) {
          schema = schema.max(validations.maxLength);
        }
        return schema;
      }
      case "single_select":
      case "dropdown":
        return optionValues.length > 0
          ? z.string().refine((value) => optionValues.includes(value), {
              message: "Invalid option selected",
            })
          : z.string();
      case "multi_select":
        return optionValues.length > 0
          ? z.array(z.string()).refine(
              (values) => values.every((value) => optionValues.includes(value)),
              { message: "Invalid option selected" }
            )
          : z.array(z.string());
      case "checkbox":
        return z.boolean();
      case "date":
        return z.string().date();
      default:
        return z.any();
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

export default FormService;
