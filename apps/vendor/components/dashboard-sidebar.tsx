"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Store,
  Ticket,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavLink = { href: string; label: string; icon: LucideIcon };

const LINKS: NavLink[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/bookings", label: "Bookings", icon: Ticket },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_LINKS: NavLink[] = [
  { href: "/admin/review", label: "Review queue", icon: ShieldCheck },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/admins", label: "Admins", icon: UserCog },
];

export function DashboardSidebar({
  vendorName,
  email,
  isAdmin,
}: {
  vendorName: string;
  email: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function navLink(link: NavLink) {
    // "/" would prefix-match everything, so it has to match exactly.
    const active =
      link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
    const Icon = link.icon;

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-white/15 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon className="size-4" />
        {link.label}
      </Link>
    );
  }

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col bg-gradient-to-b from-[#4A2536] to-[#28131c] text-white">
      <div className="px-5 py-6">
        <p className="text-lg leading-none font-bold tracking-tight">
          thebucketlist<span className="text-[#F47EB4]">dxb</span>
        </p>
        <p className="mt-1 text-xs font-medium tracking-wide text-white/50 uppercase">
          Vendor
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map(navLink)}

        {isAdmin ? (
          <>
            <p className="px-3 pt-5 pb-1 text-[0.6875rem] font-semibold tracking-wide text-white/40 uppercase">
              Admin
            </p>
            {ADMIN_LINKS.map(navLink)}
          </>
        ) : null}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="px-2.5 pb-3">
          <p className="truncate text-sm font-semibold">{vendorName}</p>
          <p className="truncate text-xs text-white/50">{email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
