"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { X, Plus } from "lucide-react";

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean(),
});

interface FieldEditorProps {
  field: {
    id: string;
    type: string;
    label: string;
    placeholder: string | null;
    description: string | null;
    required: boolean | null;
    options: any;
    validations: any;
  } | null;
  onSave: (data: any) => void;
  onClose: () => void;
}

export function FieldEditor({ field, onSave, onClose }: FieldEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: field?.label || "",
      placeholder: field?.placeholder || "",
      description: field?.description || "",
      required: field?.required || false,
    },
  });

  useEffect(() => {
    if (field) {
      reset({
        label: field.label,
        placeholder: field.placeholder || "",
        description: field.description || "",
        required: field.required || false,
      });
    }
  }, [field, reset]);

  const [options, setOptions] = useState<Array<{ label: string; value: string }>>(
    field?.options || []
  );

  const [validations, setValidations] = useState(field?.validations || {});

  const fieldType = field?.type || "";
  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(
    fieldType
  );
  const hasValidations = ["short_text", "long_text", "number", "rating"].includes(
    fieldType
  );

  const onSubmit = (data: any) => {
    onSave({
      ...data,
      ...(hasOptions && { options }),
      ...(hasValidations && { validations }),
    });
  };

  const addOption = () => {
    setOptions([...options, { label: "", value: "" }]);
  };

  const updateOption = (index: number, key: "label" | "value", value: string) => {
    const newOptions = [...options];
    newOptions[index][key] = value;
    // Auto-generate value from label if value is empty
    if (key === "label" && !newOptions[index].value) {
      newOptions[index].value = value.toLowerCase().replace(/\s+/g, "_");
    }
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  if (!field) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Select a field to edit its properties
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Field Settings</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Field Label *</Label>
            <Input id="label" {...register("label")} />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          {/* Placeholder */}
          {!hasOptions && (
            <div className="space-y-2">
              <Label htmlFor="placeholder">Placeholder Text</Label>
              <Input id="placeholder" {...register("placeholder")} />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Help Text</Label>
            <Textarea id="description" {...register("description")} rows={2} />
          </div>

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Required Field</Label>
              <p className="text-sm text-muted-foreground">
                User must answer this question
              </p>
            </div>
            <Switch
              checked={watch("required")}
              onCheckedChange={(checked) => setValue("required", checked)}
            />
          </div>

          {/* Options for select fields */}
          {hasOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button type="button" size="sm" variant="outline" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Option label"
                      value={option.label}
                      onChange={(e) => updateOption(index, "label", e.target.value)}
                    />
                    <Input
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) => updateOption(index, "value", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {options.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No options yet. Click "Add Option" to create one.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Validations */}
          {hasValidations && (
            <div className="space-y-4">
              <Label>Validations</Label>
              <div className="grid grid-cols-2 gap-4">
                {(fieldType === "short_text" || fieldType === "long_text") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="minLength">Min Length</Label>
                      <Input
                        id="minLength"
                        type="number"
                        value={validations.minLength || ""}
                        onChange={(e) =>
                          setValidations({
                            ...validations,
                            minLength: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxLength">Max Length</Label>
                      <Input
                        id="maxLength"
                        type="number"
                        value={validations.maxLength || ""}
                        onChange={(e) =>
                          setValidations({
                            ...validations,
                            maxLength: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </>
                )}
                {(fieldType === "number" || fieldType === "rating") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="min">Min Value</Label>
                      <Input
                        id="min"
                        type="number"
                        value={validations.min || ""}
                        onChange={(e) =>
                          setValidations({
                            ...validations,
                            min: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max">Max Value</Label>
                      <Input
                        id="max"
                        type="number"
                        value={validations.max || (fieldType === "rating" ? 5 : "")}
                        onChange={(e) =>
                          setValidations({
                            ...validations,
                            max: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Save Button */}
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Add missing import
import { useState } from "react";