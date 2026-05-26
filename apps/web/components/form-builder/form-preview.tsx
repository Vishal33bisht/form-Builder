"use client";

import { Card, CardContent } from "~/components/ui/card";
import { FormField } from "~/components/forms/form-field";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface FormPreviewProps {
  form: {
    title: string;
    description: string | null;
    status: string;
  };
  fields: Array<{
    id: string;
    type: string;
    label: string;
    placeholder: string | null;
    description: string | null;
    required: boolean | null;
    order: number;
    options?: any;
    validations?: any;
  }>;
}

export function FormPreview({ form, fields }: FormPreviewProps) {
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold">{form.title || "Untitled Form"}</h2>
          <Badge variant={form.status === "published" ? "default" : "secondary"}>
            {form.status}
          </Badge>
        </div>
        {form.description && (
          <p className="text-muted-foreground">{form.description}</p>
        )}
      </div>

      {/* Preview Badge */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary text-center">
        Preview Mode - This is how your form will appear to respondents
      </div>

      {/* Fields */}
      {sortedFields.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <p>No fields yet</p>
            <p className="text-sm mt-2">
              Add fields to see them appear in the preview
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="space-y-1 mb-4">
                  <span className="text-xs text-muted-foreground">
                    Question {index + 1} of {sortedFields.length}
                  </span>
                </div>
                <FormField
                  field={field}
                  value={null}
                  onChange={() => {}}
                  error={undefined}
                />
              </CardContent>
            </Card>
          ))}

          {/* Submit Button Preview */}
          <div className="flex justify-end">
            <Button size="lg" disabled>
              Submit Response
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
