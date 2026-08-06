import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Accordion } from "@/components/ui/accordion";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQs",
  description:
    "How TheBucketListDXB works, who the experiences are for, and how cancellations and refunds are handled.",
};

const FAQS = [
  {
    question: "What is TheBucketListDXB?",
    answer:
      "TheBucketListDXB is a curated platform that helps you discover and book the best experiences in Dubai. We don’t list everything — only what’s actually worth your time.",
  },
  {
    question: "How does it work?",
    answer:
      "Browse experiences, pick what you like, and book directly through the platform. No endless searching, no back and forth — just simple, easy plans.",
  },
  {
    question: "Who are these experiences for?",
    answer:
      "For people who live in Dubai and want better things to do — whether it’s a date night, birthday, or just something different for the weekend.",
  },
  {
    question: "Can I cancel or get a refund?",
    answer:
      "Cancellation and refund policies vary depending on the experience. You’ll see the details before booking, so you know exactly what to expect.",
  },
  {
    question: "Who runs the experiences?",
    answer:
      "All experiences are hosted by trusted third-party partners, including restaurants, studios, and event organizers across Dubai.",
  },
  {
    question: "How do I stay updated on new experiences?",
    answer:
      "Follow us on Instagram or sign up on the platform to get updates on new drops, exclusive experiences, and last-minute spots.",
  },
];

/** Lets the questions win their own result in search. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function FaqPage() {
  return (
    <article>
      <script
        type="application/ld+json"
        // Built from the constant above, not from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageHeader title="Frequently Asked Questions" />

      <div className="mt-8">
        <Accordion items={FAQS} />
      </div>

      <p className="mt-10 rounded-card border border-line bg-sand-soft px-6 py-5 text-[0.9375rem] text-ink-muted">
        Still stuck? Email us at{" "}
        <a
          href={`mailto:${SITE.email}`}
          className="font-medium text-accent-deep underline underline-offset-4"
        >
          {SITE.email}
        </a>{" "}
        or read the{" "}
        <Link href="/refund-policy" className="font-medium text-accent-deep underline underline-offset-4">
          refund policy
        </Link>
        .
      </p>
    </article>
  );
}
