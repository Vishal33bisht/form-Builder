"use client";
import { BarChart3, Compass } from "lucide-react";
import { FileText, MessageSquare, CheckCircle, FileEdit } from "lucide-react";
import { StatsCard } from "~/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { trpc } from "~/trpc/client";
import Link from "next/link";
import { formatDate } from "~/lib/utils";
import { Skeleton } from "~/components/ui/skeleton";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } =
    trpc.analytics.getOverallStats.useQuery({});
  const { data: forms, isLoading: formsLoading } = trpc.forms.list.useQuery();

  const recentForms = forms?.slice(0, 5) || [];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your forms.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your forms.
          </p>
        </div>
        <Link href="/dashboard/forms">
          <Button>Create New Form</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Forms"
          value={stats?.totalForms || 0}
          icon={FileText}
          description="All your forms"
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
          icon={CheckCircle}
          description="Live and accepting responses"
        />
        <StatsCard
          title="Draft Forms"
          value={stats?.draftForms || 0}
          icon={FileEdit}
          description="Work in progress"
        />
      </div>

      {/* Recent Forms */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Forms</CardTitle>
            <CardDescription>Your most recently created forms</CardDescription>
          </CardHeader>
          <CardContent>
            {formsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No forms yet</p>
                <Link href="/dashboard/forms">
                  <Button variant="link" className="mt-2">
                    Create your first form
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentForms.map((form) => (
                  <div
                    key={form.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/forms/${form.id}/edit`}
                          className="font-medium hover:text-primary"
                        >
                          {form.title}
                        </Link>
                        <Badge
                          variant={
                            form.status === "published"
                              ? "default"
                              : form.status === "draft"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {form.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDate(form.createdAt)}
                      </p>
                    </div>
                    <Link href={`/dashboard/forms/${form.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Forms</CardTitle>
            <CardDescription>Forms with the most responses</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !stats?.topForms || stats.topForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No responses yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topForms.map((form, index) => (
                  <div
                    key={form.formId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{form.formTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {form.responseCount} responses
                        </p>
                      </div>
                    </div>
                    <Link href={`/dashboard/forms/${form.formId}/responses`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/forms" className="block">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Create New Form
            </Button>
          </Link>
          <Link href="/explore" className="block">
            <Button variant="outline" className="w-full justify-start">
              <Compass className="mr-2 h-4 w-4" />
              Explore Public Forms
            </Button>
          </Link>
          <Link href="/dashboard/analytics" className="block">
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}