import { Plus } from "lucide-react";

/**
 * Built on <details>, not a JS disclosure. It is keyboard- and
 * screen-reader-correct for free, survives with JS off, and lets the FAQ
 * stay a Server Component — a hand-rolled version would only be re-adding
 * behaviour the element already has.
 */
export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    // No top rule: each row carries its own bottom border, and whatever sits
    // above (a PageHeader) already ends in one.
    <div>
      {items.map((item) => (
        <details key={item.question} name="faq" className="group border-b border-line">
          <summary className="tap-target flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-[1.0625rem] font-semibold text-ink transition-colors duration-150 marker:content-none hover:text-accent-deep [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              // Tailwind v4 sets the independent `rotate` property, so the
              // transition has to name it — `transition-transform` covers the
              // transform family but not the colours changing alongside it.
              className="grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-ink-muted transition-[rotate,border-color,color] duration-200 ease-[var(--ease-out-soft)] group-open:rotate-45 group-open:border-accent group-open:text-accent-deep"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="max-w-[65ch] pb-5 text-[1.0625rem] leading-relaxed text-ink-muted">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
