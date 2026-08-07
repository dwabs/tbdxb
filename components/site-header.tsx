"use client";

import { Check, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountMenu } from "@/components/account-menu";
import { LanguageMenu } from "@/components/language-menu";
import { LogoMark, Wordmark } from "@/components/logo";
import { SignInModal } from "@/components/sign-in-modal";
import { WelcomeToast } from "@/components/welcome-toast";
import type { Dictionary } from "@/lib/i18n";
import {
  LOCALE_NAMES,
  LOCALES,
  localePath,
  type Locale,
  stripLocale,
} from "@/lib/i18n/config";
import { NAV_LINKS } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function SiteHeader({
  locale,
  t,
  auth,
}: {
  locale: Locale;
  t: Dictionary["nav"];
  auth: Dictionary["auth"];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [supabase] = useState(() => createClient());
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const [welcome, setWelcome] = useState<{
    name: string;
    isNewUser: boolean;
  } | null>(null);

  // Closing on navigation is handled in the link's own onClick, not an effect.
  // This one is a genuine external-system sync: stop the page behind scrolling.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Hydrates from an existing session on load (e.g. a page refresh), and
  // reacts to sign-out/sign-in happening in another tab.
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(async ({ data }) => {
      if (cancelled || !data.user) return;
      const { data: profile } = await supabase
        .from("profile")
        .select("full_name")
        .eq("id", data.user.id)
        .single();
      if (!cancelled && profile?.full_name) setSignedInAs(profile.full_name);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setSignedInAs(null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSignedInAs(null);
  }

  const links = NAV_LINKS.map((link) => ({
    href: localePath(locale, link.href),
    label: t[link.key],
  }));

  return (
    <>
      {welcome ? (
        <WelcomeToast
          name={welcome.name}
          isNewUser={welcome.isNewUser}
          t={auth.welcome}
          onDone={() => setWelcome(null)}
        />
      ) : null}
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[86rem] items-center gap-3 px-5 sm:h-[4.5rem] lg:px-8">
          <Link
            href={localePath(locale, "/")}
            className="flex shrink-0 items-center gap-2.5"
            aria-label={t.homeAria}
          >
            <LogoMark className="size-9" />
            <Wordmark className="text-[1.0625rem]" />
          </Link>

          <nav
            aria-label={t.main}
            className="ms-6 hidden items-center gap-1 lg:flex"
          >
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-150",
                    active
                      ? "bg-blush text-accent-deep"
                      : "text-ink-muted hover:bg-sand-soft hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <LanguageMenu
              locale={locale}
              label={t.language}
              className="hidden sm:inline-flex"
            />
            {signedInAs ? (
              <div className="hidden sm:flex">
                <AccountMenu
                  name={signedInAs}
                  t={auth}
                  onSignOut={handleSignOut}
                />
              </div>
            ) : (
              <SignInModal
                t={auth}
                onSignedIn={(fullName, isNewUser) => {
                  setSignedInAs(fullName);
                  setWelcome({ name: fullName, isNewUser });
                }}
              />
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t.closeMenu : t.openMenu}
              className="tap-target grid size-10 place-items-center rounded-full border border-line-strong text-ink lg:hidden [touch-action:manipulation]"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open ? (
          <nav
            id="mobile-nav"
            aria-label={t.main}
            className="animate-rise overscroll-contain border-t border-line bg-canvas px-5 pt-2 pb-6 lg:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === link.href ? "page" : undefined}
                className="block border-b border-line py-3.5 font-display text-lg font-semibold text-ink last:border-0"
              >
                {link.label}
              </Link>
            ))}
            {/* Laid out flat rather than as the desktop dropdown: the sheet is
              already a disclosure, and nesting a popover inside one to pick
              between two options is a tap more than it needs to be. */}
            <div className="mt-5">
              <p className="flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                <Globe aria-hidden="true" className="size-3.5" />
                {t.language}
              </p>
              <ul className="mt-2 flex gap-2">
                {LOCALES.map((option) => {
                  const current = option === locale;
                  return (
                    <li key={option}>
                      <Link
                        href={localePath(option, stripLocale(pathname))}
                        hrefLang={option}
                        lang={option}
                        aria-current={current ? "true" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 py-2.5 text-[0.9375rem] transition-colors duration-150",
                          current
                            ? "border-accent-soft bg-blush font-medium text-accent-deep"
                            : "border-line-strong text-ink-muted",
                        )}
                      >
                        {current ? (
                          <Check aria-hidden="true" className="size-3.5" />
                        ) : null}
                        {LOCALE_NAMES[option]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            {signedInAs ? (
              <div className="mt-5 flex items-center justify-between">
                <span className="text-[0.9375rem] font-medium text-ink">
                  {signedInAs}
                </span>
                <AccountMenu
                  name={signedInAs}
                  t={auth}
                  onSignOut={() => {
                    handleSignOut();
                    setOpen(false);
                  }}
                />
              </div>
            ) : null}
          </nav>
        ) : null}
      </header>
    </>
  );
}
