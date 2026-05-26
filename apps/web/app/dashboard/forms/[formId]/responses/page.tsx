"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Trash2, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { ResponseTable } from "~/components/dashboard/response-table";
import { Skeleton } from "~/components/ui/skeleton";
import { StatsCard } from "~/components/dashboard/stats-card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState } from "react";

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Get form details
  const { data: formData, isLoading: formLoading } =
    trpc.forms.getById.useQuery({ formId });

  // Get responses
  const { data: responsesData, isLoading: responsesLoading } =
    trpc.responses.list.useQuery({
      formId,
      page,
      limit: 20,
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
    });

  // Get form stats
  const { data: stats } = trpc.analytics.getFormStats.useQuery({ formId });

  // Delete mutation
  const deleteResponseMutation = trpc.responses.delete.useMutation({
    onSuccess: () => {
      toast.success("Response deleted successfully");
      utils.responses.list.invalidate();
      utils.analytics.getFormStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete response");
    },
  });

  const handleDelete = (responseId: string) => {
    if (confirm("Are you sure you want to delete this response?")) {
      deleteResponseMutation.mutate({ responseId });
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const data = await utils.responses.exportCsv.fetch({ formId });
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData?.form.slug || "form"}-responses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV exported successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  if (formLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Form not found</h2>
        <p className="text-muted-foreground mt-2">
          This form doesn't exist or you don't have access to it.
        </p>
        <Link href="/dashboard/forms">
          <Button className="mt-4">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  const { form, fields } = formData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/forms")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{form.title}</h1>
          <p className="text-muted-foreground">Form Responses</p>
        </div>
        <Button
          onClick={handleExportCsv}
          disabled={
            isExporting || !responsesData?.responses.length
          }
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Responses"
          value={stats?.totalResponses || 0}
          icon={Trash2}
          description="All time"
        />
        <StatsCard
          title="Today"
          value={stats?.todayResponses || 0}
          icon={Calendar}
          description="Responses today"
        />
        <StatsCard
          title="This Week"
          value={stats?.weekResponses || 0}
          icon={Calendar}
          description="Last 7 days"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Responses</CardTitle>
          <CardDescription>Filter by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Responses ({responsesData?.total || 0})
          </CardTitle>
          <CardDescription>
            All responses submitted to this form
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responsesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              <ResponseTable
                responses={responsesData?.responses || []}
                fields={fields}
                onDelete={handleDelete}
                isDeleting={deleteResponseMutation.isPending}
              />

              {/* Pagination */}
              {responsesData && responsesData.total > 20 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(responsesData.total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(responsesData.total / 20)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
