import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms-conditions">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).terms;
  return { title: t.title, description: t.metaDescription };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/terms-conditions">) {
  const { locale } = await params;
  return <PolicyPage t={getDictionary(locale).terms} />;
}
