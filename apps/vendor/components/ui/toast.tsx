"use client";

import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const VISIBLE_MS = 3000;
const EXIT_MS = 250;

type ToastState = { id: number; message: string; variant: "success" | "error" };

/** One toast at a time — a new call replaces whatever's showing rather than
 *  stacking, which is all a single form's worth of save actions ever needs. */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, variant: "success" | "error" = "success") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  return { toast, show, dismiss: () => setToast(null) };
}

export function Toast({
  toast,
  onDone,
}: {
  toast: ToastState | null;
  onDone: () => void;
}) {
  if (!toast) return null;
  // Keyed on toast.id so a new toast while one is already showing remounts
  // this instead of needing to reset `closing` mid-effect.
  return <ToastBubble key={toast.id} toast={toast} onDone={onDone} />;
}

function ToastBubble({ toast, onDone }: { toast: ToastState; onDone: () => void }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setClosing(true), VISIBLE_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!closing) return;
    const id = setTimeout(onDone, EXIT_MS);
    return () => clearTimeout(id);
  }, [closing, onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-4 z-50 flex justify-center px-4",
        closing ? "toast-out" : "toast-in",
      )}
    >
      <p
        className={cn(
          "rounded-full px-4 py-2 text-sm font-medium shadow-lg",
          toast.variant === "error"
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        {toast.message}
      </p>
    </div>
  );
}
