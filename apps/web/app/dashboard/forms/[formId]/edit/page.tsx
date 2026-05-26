"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Palette,
  ExternalLink,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { Skeleton } from "~/components/ui/skeleton";
import { FieldTypeSelector } from "~/components/form-builder/field-type-selector";
import { FieldCard } from "~/components/form-builder/field-card";
import { FieldEditor } from "~/components/form-builder/field-editor";
import { FormPreview } from "~/components/form-builder/form-preview";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function FormBuilderPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "preview">("build");

  // Form data
  const { data: formData, isLoading } = trpc.forms.getById.useQuery({ formId });

  // Themes
  const { data: themes } = trpc.themes.list.useQuery();

  // Form update
  const updateFormMutation = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success("Form updated!");
      utils.forms.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update form");
    },
  });

  // Field mutations
  const createFieldMutation = trpc.fields.create.useMutation({
    onSuccess: () => {
      toast.success("Field added!");
      utils.forms.getById.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add field");
    },
  });

  const updateFieldMutation = trpc.fields.update.useMutation({
    onSuccess: () => {
      toast.success("Field updated!");
      utils.forms.getById.invalidate();
      setSelectedFieldId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update field");
    },
  });

  const deleteFieldMutation = trpc.fields.delete.useMutation({
    onSuccess: () => {
      toast.success("Field deleted!");
      utils.forms.getById.invalidate();
      setSelectedFieldId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete field");
    },
  });

  const reorderFieldsMutation = trpc.fields.reorder.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate();
    },
  });

  // Publish/Unpublish
  const publishMutation = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published!");
      utils.forms.getById.invalidate();
    },
  });

  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished!");
      utils.forms.getById.invalidate();
    },
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && formData?.fields) {
      const oldIndex = formData.fields.findIndex((f) => f.id === active.id);
      const newIndex = formData.fields.findIndex((f) => f.id === over.id);

      const newOrder = arrayMove(formData.fields, oldIndex, newIndex);
      reorderFieldsMutation.mutate({
        formId,
        fieldIds: newOrder.map((f) => f.id),
      });
    }
  };

  const handleAddField = (type: string) => {
    const order = formData?.fields.length || 0;
    createFieldMutation.mutate({
      formId,
      type: type as any,
      label: `New ${type.replace(/_/g, " ")} field`,
      required: false,
      order,
    });
  };

  const handleUpdateField = (data: any) => {
    if (selectedFieldId) {
      updateFieldMutation.mutate({
        fieldId: selectedFieldId,
        ...data,
      });
    }
  };

  const handleDeleteField = (fieldId: string) => {
    if (confirm("Are you sure you want to delete this field?")) {
      deleteFieldMutation.mutate({ fieldId });
    }
  };

  const handleUpdateFormSettings = (data: any) => {
    updateFormMutation.mutate({
      formId,
      ...data,
    });
  };

  const handleTogglePublish = () => {
    if (formData?.form.status === "published") {
      unpublishMutation.mutate({ formId });
    } else {
      publishMutation.mutate({ formId });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Form not found</h2>
        <Link href="/dashboard/forms">
          <Button className="mt-4">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  const { form, fields } = formData;
  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/forms")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <Input
            value={form.title}
            onChange={(e) =>
              handleUpdateFormSettings({ title: e.target.value })
            }
            className="text-2xl font-bold border-none shadow-none px-0 h-auto"
            placeholder="Untitled Form"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

          <Button
            variant={form.status === "published" ? "secondary" : "default"}
            size="sm"
            onClick={handleTogglePublish}
          >
            {form.status === "published" ? "Unpublish" : "Publish"}
          </Button>

          {form.status === "published" && (
            <Link href={`/f/${form.slug}`} target="_blank">
              <Button size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="build">Build</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Build Tab */}
        <TabsContent value="build" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Panel - Fields List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Form Fields</h3>
                <FieldTypeSelector onSelectType={handleAddField} />
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fields.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          <p>No fields yet</p>
                          <p className="text-sm mt-2">
                            Click "Add Field" to get started
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      fields.map((field) => (
                        <FieldCard
                          key={field.id}
                          field={field}
                          isActive={selectedFieldId === field.id}
                          onClick={() => setSelectedFieldId(field.id)}
                          onDelete={() => handleDeleteField(field.id)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Right Panel - Field Editor */}
            <div className="lg:col-span-2">
              <FieldEditor
                field={selectedField}
                onSave={handleUpdateField}
                onClose={() => setSelectedFieldId(null)}
              />
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <FormPreview form={form} fields={fields} />
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Settings</DialogTitle>
            <DialogDescription>
              Configure your form settings and options
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold">Basic Information</h4>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description || ""}
                  onChange={(e) =>
                    handleUpdateFormSettings({ description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Custom URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/f/</span>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) =>
                      handleUpdateFormSettings({
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-"),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={form.visibility}
                  onValueChange={(value: "public" | "unlisted") =>
                    handleUpdateFormSettings({ visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlisted">
                      Unlisted - Only people with link
                    </SelectItem>
                    <SelectItem value="public">
                      Public - Visible in explore page
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Response Limits */}
            <div className="space-y-4">
              <h4 className="font-semibold">Response Settings</h4>
              
              <div className="space-y-2">
                <Label htmlFor="responseLimit">Response Limit</Label>
                <Input
                  id="responseLimit"
                  type="number"
                  placeholder="Unlimited"
                  value={form.responseLimit || ""}
                  onChange={(e) =>
                    handleUpdateFormSettings({
                      responseLimit: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty for unlimited responses
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiry Date</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={
                    form.expiresAt
                      ? new Date(form.expiresAt).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    handleUpdateFormSettings({
                      expiresAt: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <h4 className="font-semibold">Theme</h4>
              <div className="grid grid-cols-2 gap-3">
                {themes?.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() =>
                      handleUpdateFormSettings({
                        theme: { themeId: theme.id },
                      })
                    }
                    className="p-4 border rounded-lg text-left hover:bg-muted transition-colors"
                  >
                    <p className="font-medium">{theme.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {theme.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsSettingsOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}