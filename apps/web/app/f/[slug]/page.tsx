"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { trpc } from "~/trpc/client";
import { FormRenderer } from "~/components/forms/form-renderer";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [respondentEmail, setRespondentEmail] = useState("");

  const { data: formData, isLoading, error } = trpc.forms.getBySlug.useQuery({ slug });

  const submitResponseMutation = trpc.responses.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Response submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit response");
    },
  });

  const handleSubmit = async (answers: Array<{ fieldId: string; value: any }>) => {
    if (!formData?.form) return;

    await submitResponseMutation.mutateAsync({
      formId: formData.form.id,
      answers,
      respondentEmail: respondentEmail || undefined,
    });
  };

  // Apply theme if available
  const theme = formData?.form.theme as any;
  const themeConfig = theme?.themeId ? {} : theme?.config || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="space-y-6">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center">Form Not Found</CardTitle>
            <CardDescription className="text-center">
              {error?.message || "This form doesn't exist or is not available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/explore">
              <Button className="w-full">Explore Other Forms</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { form, fields } = formData;

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your response has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              We appreciate you taking the time to fill out{" "}
              <strong>{form.title}</strong>.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsSubmitted(false);
                  setRespondentEmail("");
                }}
              >
                Submit Another Response
              </Button>
              <Link href="/explore" className="flex-1">
                <Button className="w-full">Explore More Forms</Button>
              </Link>
            </div>
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Powered by{" "}
                <Link href="/" className="text-primary hover:underline">
                  FormCraft
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main form view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormCraft</span>
          </Link>
        </div>
      </header>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Form Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="text-lg text-muted-foreground">{form.description}</p>
          )}
        </div>

        {/* Optional email input */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="respondentEmail">
                Email (optional)
              </Label>
              <Input
                id="respondentEmail"
                type="email"
                placeholder="your@email.com"
                value={respondentEmail}
                onChange={(e) => setRespondentEmail(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a confirmation and updates if provided.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Warning if expired or limit reached */}
        {form.expiresAt && new Date(form.expiresAt) < new Date() && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Form Expired</AlertTitle>
            <AlertDescription>
              This form is no longer accepting responses.
            </AlertDescription>
          </Alert>
        )}

        {/* Form Fields */}
        <FormRenderer
          fields={fields}
          onSubmit={handleSubmit}
          isSubmitting={submitResponseMutation.isPending}
          theme={themeConfig}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            This form is powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              FormCraft
            </Link>
            . Create your own beautiful forms for free.
          </p>
        </div>
      </main>
    </div>
  );
}
