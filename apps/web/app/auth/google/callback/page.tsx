"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { setAuthToken } from "~/lib/auth";
import { trpc } from "~/trpc/client";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasExchangedCode = useRef(false);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const googleCallbackMutation = trpc.auth.googleCallback.useMutation({
    onSuccess: (data) => {
      setAuthToken(data.token);
      toast.success("Signed in with Google");
      router.replace("/dashboard");
    },
    onError: (mutationError) => {
      toast.error(mutationError.message || "Google sign-in failed");
    },
  });

  useEffect(() => {
    if (error) {
      toast.error("Google sign-in was cancelled");
      return;
    }

    if (!code || hasExchangedCode.current) {
      return;
    }

    hasExchangedCode.current = true;
    googleCallbackMutation.mutate({ code });
  }, [code, error, googleCallbackMutation]);

  const hasError = !!error || (!code && !googleCallbackMutation.isPending);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Google Sign-In</CardTitle>
        <CardDescription>
          {hasError
            ? "We could not complete Google sign-in."
            : "Finishing your secure sign-in..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {!hasError && (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        )}
        {hasError && (
          <Link href="/auth/login" className="w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
