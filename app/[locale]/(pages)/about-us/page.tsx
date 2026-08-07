import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about-us">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).about;
  return { title: t.title, description: t.metaDescription };
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about-us">) {
  const { locale } = await params;
  const t = getDictionary(locale).about;

  return (
    <article>
      <PageHeader title={t.title} />

      <div className="prose mt-8">
        <p className="lead">{t.lead}</p>
        {t.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
        <p>
          <strong>{t.closing}</strong>
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={localePath(locale as Locale, "/events")}>{t.browse}</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href={localePath(locale as Locale, "/faq")}>{t.readFaq}</Link>
        </Button>
      </div>
    </article>
  );
}
