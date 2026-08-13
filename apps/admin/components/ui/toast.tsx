"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const VISIBLE_MS = 3000;
const EXIT_MS = 250;

type ToastState = { id: number; message: string; variant: "success" | "error" };
type ToastContextValue = (message: string, variant?: "success" | "error") => void;

const ToastContext = createContext<ToastContextValue | null>(null);

/** Mounted once per app (dashboard layout) so any nested client component —
 *  including several rendered per page, like one per table row — can
 *  confirm an action without owning its own toast state. That's what keeps
 *  two near-simultaneous confirmations (e.g. two row actions) from stacking
 *  two fixed-position toasts on top of each other: only one instance of the
 *  toast itself ever exists. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback<ToastContextValue>((message, variant = "success") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </ToastContext.Provider>
  );
}

/** Returns a `show(message, variant?)` function — call it after any save,
 *  create, remove, or status-change action succeeds. */
export function useToast(): ToastContextValue {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used within a ToastProvider");
  return show;
}

function Toast({ toast, onDone }: { toast: ToastState | null; onDone: () => void }) {
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
