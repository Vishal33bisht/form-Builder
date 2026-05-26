"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { FormCard } from "~/components/forms/form-card";
import { Skeleton } from "~/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const createFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  visibility: z.enum(["public", "unlisted"]).default("unlisted"),
});

type CreateFormData = z.infer<typeof createFormSchema>;

export default function FormsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const utils = trpc.useUtils();

  const { data: forms, isLoading } = trpc.forms.list.useQuery();

  const createFormMutation = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created successfully!");
      setIsCreateDialogOpen(false);
      utils.forms.list.invalidate();
      router.push(`/dashboard/forms/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
    },
  });

  const deleteFormMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted successfully!");
      utils.forms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete form");
    },
  });

  const cloneFormMutation = trpc.forms.clone.useMutation({
    onSuccess: (data) => {
      toast.success("Form cloned successfully!");
      utils.forms.list.invalidate();
      router.push(`/dashboard/forms/${data.id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to clone form");
    },
  });

  const publishFormMutation = trpc.forms.publish.useMutation({
    onSuccess: () => {
      toast.success("Form published!");
      utils.forms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish form");
    },
  });

  const unpublishFormMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      toast.success("Form unpublished!");
      utils.forms.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unpublish form");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateFormData>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      visibility: "unlisted",
    },
  });

  const onCreateForm = (data: CreateFormData) => {
    createFormMutation.mutate(data);
  };

  const handleDelete = (formId: string) => {
    if (confirm("Are you sure you want to delete this form?")) {
      deleteFormMutation.mutate({ formId });
    }
  };

  const handleClone = (formId: string) => {
    cloneFormMutation.mutate({ formId });
  };

  const handleTogglePublish = (formId: string, currentStatus: string) => {
    if (currentStatus === "published") {
      unpublishFormMutation.mutate({ formId });
    } else {
      publishFormMutation.mutate({ formId });
    }
  };

  // Filter forms
  const filteredForms = forms?.filter((form) => {
    const matchesSearch = form.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forms</h1>
          <p className="text-muted-foreground">
            Manage and create your forms
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Forms</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forms Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredForms && filteredForms.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              responseCount={0} // We'll add this count later via analytics
              onEdit={(formId) =>
                router.push(`/dashboard/forms/${formId}/edit`)
              }
              onDelete={handleDelete}
              onClone={handleClone}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No forms found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first form"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Form
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Give your form a title to get started. You can customize it later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateForm)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title *</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Form"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of your form"
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  defaultValue="unlisted"
                  onValueChange={(value: "public" | "unlisted") =>
                    register("visibility").onChange({
                      target: { value, name: "visibility" },
                    })
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createFormMutation.isPending}>
                {createFormMutation.isPending ? "Creating..." : "Create Form"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}