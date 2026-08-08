import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AddressForm } from "@/components/account/address-form";
import { NotificationsForm } from "@/components/account/notifications-form";
import { ProfileForm } from "@/components/account/profile-form";
import { PageHeader } from "@/components/page-header";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/account">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).account;
  return { title: t.title };
}

export default async function AccountPage({
  params,
}: PageProps<"/[locale]/account">) {
  const { locale } = await params;
  const t = getDictionary(locale).account;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localePath(locale as Locale, "/"));

  const { data: profile } = await supabase
    .from("profile")
    .select(
      "full_name, phone, birthday, avatar_url, address_line1, address_line2, city, country, notify_marketing, notify_reminders",
    )
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      <PageHeader title={t.title} />

      <div className="mt-8 grid gap-6">
        <ProfileForm
          t={t.profile}
          userId={user.id}
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? null}
          birthday={profile?.birthday ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
        <AddressForm
          t={t.address}
          userId={user.id}
          line1={profile?.address_line1 ?? ""}
          line2={profile?.address_line2 ?? ""}
          city={profile?.city ?? ""}
          country={profile?.country ?? ""}
        />
        <NotificationsForm
          t={t.notifications}
          userId={user.id}
          marketing={profile?.notify_marketing ?? false}
          reminders={profile?.notify_reminders ?? true}
        />
      </div>
    </div>
  );
}
