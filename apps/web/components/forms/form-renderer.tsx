"use client";

import { useState } from "react";
import { FormField } from "./form-field";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Loader2 } from "lucide-react";

interface Field {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  description: string | null;
  required: boolean | null;
  order: number;
  options: any;
  validations: any;
}

interface FormRendererProps {
  fields: Field[];
  onSubmit: (answers: Array<{ fieldId: string; value: any }>) => Promise<void>;
  isSubmitting: boolean;
  theme?: any;
}

export function FormRenderer({
  fields,
  onSubmit,
  isSubmitting,
  theme,
}: FormRendererProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const handleFieldChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    sortedFields.forEach((field) => {
      const value = answers[field.id];

      // Check required fields
      if (field.required) {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      // Type-specific validations
      if (value !== undefined && value !== null && value !== "") {
        if (field.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors[field.id] = "Invalid email address";
          }
        }

        if (field.type === "short_text" || field.type === "long_text") {
          const validations = field.validations || {};
          if (validations.minLength && value.length < validations.minLength) {
            newErrors[field.id] = `Minimum ${validations.minLength} characters required`;
          }
          if (validations.maxLength && value.length > validations.maxLength) {
            newErrors[field.id] = `Maximum ${validations.maxLength} characters allowed`;
          }
        }

        if (field.type === "number" || field.type === "rating") {
          const validations = field.validations || {};
          const numValue = Number(value);
          if (validations.min !== undefined && numValue < validations.min) {
            newErrors[field.id] = `Minimum value is ${validations.min}`;
          }
          if (validations.max !== undefined && numValue > validations.max) {
            newErrors[field.id] = `Maximum value is ${validations.max}`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = sortedFields.find((f) => errors[f.id]);
      if (firstErrorField) {
        document.getElementById(`field-${firstErrorField.id}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    const formattedAnswers = sortedFields.map((field) => ({
      fieldId: field.id,
      value: answers[field.id] ?? null,
    }));

    await onSubmit(formattedAnswers);
  };

  const progress = sortedFields.length
    ? (Object.keys(answers).length / sortedFields.length) * 100
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      {sortedFields.length > 3 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>
      )}

      {/* Fields */}
      {sortedFields.map((field, index) => (
        <Card
          key={field.id}
          id={`field-${field.id}`}
          className="scroll-mt-8 transition-all hover:shadow-md"
        >
          <CardContent className="pt-6">
            <div className="space-y-1 mb-4">
              <span className="text-xs text-muted-foreground">
                Question {index + 1} of {sortedFields.length}
              </span>
            </div>
            <FormField
              field={field}
              value={answers[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              error={errors[field.id]}
            />
          </CardContent>
        </Card>
      ))}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Response"
          )}
        </Button>
      </div>
    </form>
  );
}