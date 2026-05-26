"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Users, Clock, Activity } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { trpc } from "~/trpc/client";
import { StatsCard } from "~/components/dashboard/stats-card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#4F46E5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export default function FormAnalyticsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const router = useRouter();

  // Get form details
  const { data: formData, isLoading: formLoading } =
    trpc.forms.getById.useQuery({ formId });

  // Get form stats
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.getFormStats.useQuery({ formId });

  // Get field stats
  const { data: fieldStats, isLoading: fieldStatsLoading } =
    trpc.analytics.getFieldStats.useQuery({ formId });

  if (formLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <Link href="/dashboard/forms">
          <Button className="mt-4">Back to Forms</Button>
        </Link>
      </div>
    );
  }

  const { form } = formData;

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
          <p className="text-muted-foreground">Analytics & Insights</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Responses"
          value={stats?.totalResponses || 0}
          icon={Users}
          description="All time"
        />
        <StatsCard
          title="Today"
          value={stats?.todayResponses || 0}
          icon={TrendingUp}
          description="Responses today"
        />
        <StatsCard
          title="This Week"
          value={stats?.weekResponses || 0}
          icon={Activity}
          description="Last 7 days"
        />
        <StatsCard
          title="Avg. Daily"
          value={
            stats?.responsesOverTime?.length
              ? Math.round(
                  (stats.totalResponses || 0) / stats.responsesOverTime.length
                )
              : 0
          }
          icon={Clock}
          description="Average per day"
        />
      </div>

      {/* Responses Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Responses Over Time</CardTitle>
          <CardDescription>
            Daily response trend for the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.responsesOverTime && stats.responsesOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.responsesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  name="Responses"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No response data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Field-by-Field Analysis</CardTitle>
          <CardDescription>
            Detailed breakdown of responses per field
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fieldStatsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : !fieldStats || fieldStats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No field data available yet
            </div>
          ) : (
            <div className="space-y-8">
              {fieldStats.map((field) => (
                <div key={field.fieldId} className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{field.fieldLabel}</h4>
                    <p className="text-sm text-muted-foreground">
                      Type: {field.fieldType} • {field.stats.totalResponses}{" "}
                      responses
                    </p>
                  </div>

                  {/* Render different visualizations based on field type */}
                  {(field.fieldType === "single_select" ||
                    field.fieldType === "dropdown") &&
                    field.stats.distribution && (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={field.stats.distribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="value" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4F46E5" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                  {field.fieldType === "multi_select" &&
                    field.stats.distribution && (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={field.stats.distribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="value" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4F46E5" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                  {(field.fieldType === "rating" ||
                    field.fieldType === "number") && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-2xl font-bold">
                          {field.stats.average?.toFixed(2) || "—"}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Minimum</p>
                        <p className="text-2xl font-bold">
                          {field.stats.min || "—"}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Maximum</p>
                        <p className="text-2xl font-bold">
                          {field.stats.max || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {field.fieldType === "checkbox" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">Yes</p>
                        <p className="text-2xl font-bold">
                          {field.stats.trueCount || 0}
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">No</p>
                        <p className="text-2xl font-bold">
                          {field.stats.falseCount || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {(field.fieldType === "short_text" ||
                    field.fieldType === "long_text" ||
                    field.fieldType === "email") &&
                    field.stats.sampleAnswers && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Sample Answers:</p>
                        <div className="space-y-1">
                          {field.stats.sampleAnswers.map(
                            (answer: string, index: number) => (
                              <p
                                key={index}
                                className="text-sm text-muted-foreground bg-muted p-2 rounded"
                              >
                                {answer}
                              </p>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}