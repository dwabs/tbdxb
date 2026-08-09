"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { createClient } from "@/lib/supabase/client";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

/** Signs the user out after `minutes` of no activity anywhere on the page.
 *  Mounted once in the dashboard layout so it applies across every route. */
export function IdleTimeout({ minutes }: { minutes: number }) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        async () => {
          await supabase.auth.signOut();
          router.replace("/login");
          router.refresh();
        },
        minutes * 60 * 1000,
      );
    }

    reset();
    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, reset);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, reset);
    };
  }, [minutes, router]);

  return null;
}
