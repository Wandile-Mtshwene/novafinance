"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    startTransition(async () => {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setError(error.message ?? "Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-6">
      <h1 className="text-lg font-semibold text-[var(--nova-text)] mb-1">Sign in</h1>
      <p className="text-sm text-[var(--nova-muted)] mb-6">Enter your credentials to access NovaFinance.</p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--nova-muted)]">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            autoComplete="email"
            className="h-10 rounded-xl border-[var(--nova-border)] bg-[var(--nova-surface)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--nova-muted)]">Password</Label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10 rounded-xl border-[var(--nova-border)] bg-[var(--nova-surface)] text-[var(--nova-text)] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nova-dim)] hover:text-[var(--nova-muted)] transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-10 bg-[var(--nova-accent)] hover:bg-[var(--nova-accent-hover)] text-white font-medium rounded-xl"
        >
          {isPending && <Loader2 size={14} className="animate-spin mr-2" />}
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-[var(--nova-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--nova-accent)] hover:underline font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
