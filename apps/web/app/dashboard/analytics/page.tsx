"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { StatsCard } from "~/components/dashboard/stats-card";
import {
  FileText,
  MessageSquare,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { trpc } from "~/trpc/client";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function AnalyticsPage() {
  const { data: stats, isLoading } = trpc.analytics.getOverallStats.useQuery({});

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Overview of all your forms' performance
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Overview of all your forms' performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Forms"
          value={stats?.totalForms || 0}
          icon={FileText}
          description="All forms created"
        />
        <StatsCard
          title="Total Responses"
          value={stats?.totalResponses || 0}
          icon={MessageSquare}
          description="Across all forms"
        />
        <StatsCard
          title="Published Forms"
          value={stats?.publishedForms || 0}
          icon={TrendingUp}
          description="Live and accepting responses"
        />
        <StatsCard
          title="Avg. per Form"
          value={
            stats?.totalForms
              ? Math.round((stats?.totalResponses || 0) / stats.totalForms)
              : 0
          }
          icon={BarChart3}
          description="Average responses"
        />
      </div>

      {/* Top Performing Forms */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Forms</CardTitle>
          <CardDescription>
            Forms with the highest number of responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.topForms || stats.topForms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No data available yet</p>
              <p className="text-sm mt-1">
                Start collecting responses to see analytics
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Form Name</TableHead>
                  <TableHead className="text-right">Responses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topForms.map((form, index) => (
                  <TableRow key={form.formId}>
                    <TableCell>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {form.formTitle}
                    </TableCell>
                    <TableCell className="text-right">
                      {form.responseCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/forms/${form.formId}/analytics`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Response Rate</p>
              <p className="text-sm text-muted-foreground">
                Average responses per published form
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats?.publishedForms
                ? Math.round(
                    (stats?.totalResponses || 0) / stats.publishedForms
                  )
                : 0}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Completion Rate</p>
              <p className="text-sm text-muted-foreground">
                Forms with at least one response
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {stats?.totalForms
                ? Math.round(
                    ((stats.topForms?.filter((f) => f.responseCount > 0)
                      .length || 0) /
                      stats.totalForms) *
                      100
                  )
                : 0}
              %
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}