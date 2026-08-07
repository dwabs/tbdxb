import type { Metadata } from "next";

import { PolicyPage } from "@/components/policy-page";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy-policy">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).privacy;
  return { title: t.title, description: t.metaDescription };
}

export default async function Page({
  params,
}: PageProps<"/[locale]/privacy-policy">) {
  const { locale } = await params;
  return <PolicyPage t={getDictionary(locale).privacy} />;
}
