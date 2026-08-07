import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/refund-policy">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).refund;
  return { title: t.title, description: t.metaDescription };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/refund-policy">) {
  const { locale } = await params;
  return <PolicyPage t={getDictionary(locale).refund} />;
}
