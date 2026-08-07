"use client";

import { useEffect, useState } from "react";

import { fill, type Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const VISIBLE_MS = 4000;
const EXIT_MS = 350;

export function WelcomeToast({
  name,
  isNewUser,
  t,
  onDone,
}: {
  name: string;
  isNewUser: boolean;
  t: Dictionary["auth"]["welcome"];
  onDone: () => void;
}) {
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
        "fixed inset-x-0 top-4 z-[60] flex justify-center px-4 sm:top-6",
        closing ? "animate-toast-out" : "animate-toast-in",
      )}
    >
      <p className="rounded-full bg-primary px-5 py-2.5 text-[0.9375rem] font-medium text-white shadow-lift-lg">
        {fill(isNewUser ? t.new : t.back, { name })}
      </p>
    </div>
  );
}
