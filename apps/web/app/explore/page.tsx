"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Sparkles, Search, ExternalLink, TrendingUp } from "lucide-react";
import { trpc } from "~/trpc/client";
import { Skeleton } from "~/components/ui/skeleton";
import { formatDate } from "~/lib/utils";
import { apiDocsUrl } from "~/lib/links";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = trpc.forms.getPublicForms.useQuery({
    page,
    limit: 12,
  });

  const filteredForms = data?.forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormCraft</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm hover:text-primary">
              Pricing
            </Link>
            <Link
              href={apiDocsUrl}
              target="_blank"
              className="text-sm hover:text-primary"
            >
              API Docs
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Start Free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Explore Public Forms
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover amazing forms created by the FormCraft community
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto pt-4">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">
              {data?.total || 0}
            </div>
            <div className="text-sm text-muted-foreground">Public Forms</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <div className="text-3xl font-bold text-primary">8</div>
            <div className="text-sm text-muted-foreground">Themes</div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <div className="text-3xl font-bold text-primary">
              <TrendingUp className="h-8 w-8 mx-auto" />
            </div>
            <div className="text-sm text-muted-foreground">Growing Daily</div>
          </div>
        </div>
      </section>

      {/* Forms Grid */}
      <section className="container mx-auto px-4 pb-20">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredForms && filteredForms.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className="hover:shadow-lg transition-shadow group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {form.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {form.description || "No description provided"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {form.visibility}
                      </Badge>
                      <Badge>
                        {form.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {formatDate(form.createdAt)}</span>
                    </div>

                    <Link href={`/f/${form.slug}`} target="_blank">
                      <Button className="w-full" variant="outline">
                        View Form
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data && data.total > 12 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(data.total / 12)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / 12)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md space-y-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No forms found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No public forms available yet"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="text-center space-y-4 py-12">
            <CardTitle className="text-3xl">
              Want to Create Your Own?
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join FormCraft and start building beautiful forms today
            </CardDescription>
            <div className="pt-4">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 FormCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
