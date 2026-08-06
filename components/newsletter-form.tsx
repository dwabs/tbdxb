"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type State = { status: "idle" | "sending" | "done"; error: string | null };

export function NewsletterForm() {
  const [state, setState] = useState<State>({ status: "idle", error: null });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();

    if (!email.includes("@")) {
      setState({ status: "idle", error: "Enter an email address that includes an @." });
      form.querySelector<HTMLInputElement>("#newsletter-email")?.focus();
      return;
    }

    setState({ status: "sending", error: null });
    // Wire to the mailing-list provider here.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState({ status: "done", error: null });
    form.reset();
  }

  if (state.status === "done") {
    return (
      <p
        aria-live="polite"
        className="flex items-center gap-2 rounded-full border border-pink-soft bg-blush px-4 py-3 text-sm text-pink-deep"
      >
        <Check aria-hidden="true" className="size-4 shrink-0" />
        You’re on the list. Look for us on Thursday.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-sm">
      <label htmlFor="newsletter-email" className="block text-sm text-ink-muted">
        One email a week, on Thursday. The good stuff only.
      </label>

      <div className="mt-2.5 flex items-center gap-2 rounded-full border border-line-strong bg-paper p-1.5 focus-within:border-pink">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "newsletter-error" : undefined}
          placeholder="you@example.com"
          className="min-w-0 flex-1 bg-transparent px-3 text-[0.9375rem] text-ink placeholder:text-ink-subtle focus:outline-none"
        />
        <Button type="submit" size="sm" className="shrink-0">
          {state.status === "sending" ? "Signing up…" : "Sign Up"}
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>

      {state.error ? (
        <p id="newsletter-error" aria-live="polite" className="mt-2 text-sm text-pink-deep">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
