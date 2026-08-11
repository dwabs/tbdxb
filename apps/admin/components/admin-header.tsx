"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { LogoMark, Wordmark } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

/**
 * Just a top bar for now — no nav links yet, since Phase 4 is an empty
 * shell. Phase 5 moves the real admin pages in and this grows a nav, at
 * which point it likely becomes a sidebar like apps/vendor's.
 */
export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 sm:px-8">
      <div className="flex items-center gap-2">
        <LogoMark className="size-7" />
        <Wordmark className="text-sm" />
        <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-secondary-foreground uppercase">
          Admin
        </span>
      </div>
      <div className="flex items-center gap-4">
        <p className="hidden text-sm text-muted-foreground sm:block">{email}</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
