"use client";

import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  Settings,
  ShieldCheck,
  Store,
  Ticket,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VendorSwitcher } from "@/components/vendor-switcher";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Vendor } from "@/lib/types";

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
  vendors,
  activeVendorId,
}: {
  vendorName: string;
  email: string;
  isAdmin: boolean;
  vendors: Vendor[];
  activeVendorId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
        onClick={() => setOpen(false)}
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

  function nav() {
    return (
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
    );
  }

  function accountFooter() {
    return (
      <div className="border-t border-white/10 px-3 py-4">
        <div className="px-2.5 pb-3">
          {vendors.length > 1 ? (
            <VendorSwitcher vendors={vendors} activeVendorId={activeVendorId} />
          ) : (
            <p className="truncate text-sm font-semibold">{vendorName}</p>
          )}
          <p className="mt-1.5 truncate text-xs text-white/50">{email}</p>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    );
  }

  function brand() {
    return (
      <div className="px-5 py-6">
        <p className="text-lg leading-none font-bold tracking-tight">
          thebucketlist<span className="text-[#F47EB4]">dxb</span>
        </p>
        <p className="mt-1 text-xs font-medium tracking-wide text-white/50 uppercase">
          Vendor
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar — below lg, replaces the fixed column with a
          hamburger that opens the same nav in an off-canvas sheet. */}
      <header className="flex items-center justify-between border-b border-line bg-[#4A2536] px-4 py-3 text-white lg:hidden">
        <p className="text-base leading-none font-bold tracking-tight">
          thebucketlist<span className="text-[#F47EB4]">dxb</span>
        </p>
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="-me-1.5 grid size-11 place-items-center rounded-md text-white/80 hover:bg-white/10 hover:text-white"
          >
            <Menu className="size-5" />
          </button>
          <SheetContent
            closeLabel="Close menu"
            className="bg-gradient-to-b from-[#4A2536] to-[#28131c] text-white"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {brand()}
            {nav()}
            {accountFooter()}
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar — lg and up. Sticky, not just h-svh: the row
          around it only has min-h-svh, so on pages taller than one
          viewport (long event lists, the overview charts) a plain h-svh
          aside stopped short of the page's actual height once scrolled. */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col overflow-y-auto bg-gradient-to-b from-[#4A2536] to-[#28131c] text-white lg:flex">
        {brand()}
        {nav()}
        {accountFooter()}
      </aside>
    </>
  );
}
