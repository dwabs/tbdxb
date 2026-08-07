import { SecondaryNav } from "@/components/secondary-nav";
import { getDictionary, type Locale } from "@/lib/i18n";

/**
 * The shell every secondary page shares: content on one side, the same
 * sidebar of sibling pages on the other. The live site puts this list in a
 * block headed "Other"; here it reads as what it is — the rest of the site.
 */
export default async function PagesLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  const t = getDictionary(locale);

  return (
    <div className="mx-auto grid max-w-[86rem] gap-12 px-5 pt-10 pb-24 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 lg:px-8">
      <div className="min-w-0">{children}</div>
      <SecondaryNav locale={locale as Locale} t={t.secondaryNav} />
    </div>
  );
}
