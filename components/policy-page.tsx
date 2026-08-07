import { PageHeader } from "@/components/page-header";
import { fill } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Policy = {
  title: string;
  updated: string;
  lastUpdated: string;
  lead: string;
  sections: readonly { readonly heading: string; readonly body: string }[];
};

/**
 * The refund, privacy and terms pages are the same document with different
 * words, so they share one renderer and differ only by dictionary key.
 */
export function PolicyPage({ t }: { t: Policy }) {
  return (
    <article>
      <PageHeader title={t.title} updated={t.updated} updatedLabel={t.lastUpdated} />

      <div className="prose mt-8">
        <p className="lead">{t.lead}</p>
        {t.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{fill(section.body, { email: SITE.email })}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
