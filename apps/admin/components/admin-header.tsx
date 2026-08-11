"use client";

import {
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  ShieldCheck,
  Store,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { LogoMark, Wordmark } from "@/components/logo";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavLink = { href: string; label: string; icon: LucideIcon };

const LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/review", label: "Review queue", icon: ShieldCheck },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/admins", label: "Admins", icon: UserCog },
];

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="border-b">
      <div className="flex items-center justify-between px-4 py-3 sm:px-8">
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
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-8">
        {LINKS.map((link) => {
          // "/" would prefix-match everything, so it has to match exactly.
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
