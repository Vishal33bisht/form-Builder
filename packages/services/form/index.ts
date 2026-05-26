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
    const errors: Record<string, string> = {};

    // Create a map of answers for easy lookup
    const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));

    for (const field of fields) {
      const answer = answerMap.get(field.id);

      // Check required fields
      if (field.required && (answer === undefined || answer === null || answer === "")) {
        errors[field.id] = `${field.label} is required`;
        continue;
      }

      // Skip validation if field is not required and no answer provided
      if (!answer && !field.required) {
        continue;
      }

      // Type-specific validation
      try {
        switch (field.type) {
          case "email":
            z.string().email().parse(answer);
            break;
          case "number":
            const numSchema = z.number();
            const validations = field.validations as any;
            if (validations?.min !== undefined) {
              numSchema.min(validations.min);
            }
            if (validations?.max !== undefined) {
              numSchema.max(validations.max);
            }
            numSchema.parse(Number(answer));
            break;
          case "rating":
            const ratingValidations = field.validations as any;
            const max = ratingValidations?.max || 5;
            z.number().min(1).max(max).parse(Number(answer));
            break;
          case "short_text":
          case "long_text":
            const textValidations = field.validations as any;
            let textSchema = z.string();
            if (textValidations?.minLength) {
              textSchema = textSchema.min(textValidations.minLength);
            }
            if (textValidations?.maxLength) {
              textSchema = textSchema.max(textValidations.maxLength);
            }
            textSchema.parse(answer);
            break;
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors[field.id] = error.issues[0]?.message || "Invalid answer";
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

export default FormService;
