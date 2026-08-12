"use client";

import {
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  ShieldCheck,
  Store,
  Ticket,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { LogoMark, Wordmark } from "@/components/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; icon: LucideIcon };

const LINKS: NavLink[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/review", label: "Review queue", icon: ShieldCheck },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/bookings", label: "Bookings", icon: Ticket },
  { href: "/admins", label: "Admins", icon: UserCog },
  { href: "/users", label: "Users", icon: Users },
];

export function AdminSidebar({ email }: { email: string }) {
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
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
        )}
      >
        <Icon className="size-4" />
        {link.label}
      </Link>
    );
  }

  function nav() {
    return <nav className="flex-1 space-y-1 px-3">{LINKS.map(navLink)}</nav>;
  }

  function accountFooter() {
    return (
      <div className="border-t px-3 py-4">
        <p className="truncate px-2.5 pb-3 text-sm text-muted-foreground">
          {email}
        </p>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    );
  }

  function brand() {
    return (
      <div className="flex items-center gap-2 px-5 py-6">
        <LogoMark className="size-7" />
        <Wordmark className="text-sm" />
        <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-accent-foreground uppercase">
          Admin
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar — below lg, replaces the fixed column with a
          hamburger that opens the same nav in an off-canvas sheet. */}
      <header className="flex items-center justify-between border-b bg-secondary px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <Wordmark className="text-sm" />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="-me-1.5 grid size-11 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="size-5" />
          </button>
          <SheetContent closeLabel="Close menu" className="bg-secondary">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {brand()}
            {nav()}
            {accountFooter()}
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop sidebar — lg and up. Sticky, not just h-svh: the row
          around it only has min-h-svh, so on pages taller than one
          viewport a plain h-svh aside would stop short once scrolled. */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col overflow-y-auto border-r bg-secondary lg:flex">
        {brand()}
        {nav()}
        {accountFooter()}
      </aside>
    </>
  );
}
