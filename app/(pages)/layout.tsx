import { SecondaryNav } from "@/components/secondary-nav";

/**
 * The shell every secondary page shares: content on the left, the same
 * sidebar of sibling pages on the right. The live site puts this list in a
 * block headed "Other"; here it reads as what it is — the rest of the site.
 */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[86rem] gap-12 px-5 pt-10 pb-24 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 lg:px-8">
      <div className="min-w-0">{children}</div>
      <SecondaryNav />
    </div>
  );
}
