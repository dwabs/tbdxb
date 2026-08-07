import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Accordion } from "@/components/ui/accordion";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).faq;
  return { title: t.title, description: t.metaDescription };
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  const t = getDictionary(locale).faq;

  /** Lets the questions win their own result in search. */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: t.items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        // Built from the dictionary above, not from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageHeader title={t.title} />

      <div className="mt-8">
        <Accordion items={[...t.items]} />
      </div>

      <p className="mt-10 rounded-card border border-line bg-sand-soft px-6 py-5 text-[0.9375rem] text-ink-muted">
        {t.stillStuckBefore}
        <a
          href={`mailto:${SITE.email}`}
          dir="ltr"
          className="font-medium text-accent-deep underline underline-offset-4"
        >
          {SITE.email}
        </a>
        {t.stillStuckMiddle}
        <Link
          href={localePath(locale as Locale, "/refund-policy")}
          className="font-medium text-accent-deep underline underline-offset-4"
        >
          {t.stillStuckLink}
        </Link>
        {t.stillStuckAfter}
      </p>
    </article>
  );
}
