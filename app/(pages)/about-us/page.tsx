import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Dubai has everything. The problem is, most people don’t experience it. TheBucketListDXB curates the things actually worth your time.",
};

export default function AboutPage() {
  return (
    <article>
      <PageHeader title="About TheBucketListDXB" />

      <div className="prose mt-8">
        <p className="lead">
          Dubai has everything. The problem is, most people don’t experience it.
        </p>
        <p>
          We fall into the same routines, save ideas for later, and never actually go.
          TheBucketListDXB exists to change that.
        </p>
        <p>
          We curate the best things to do in Dubai — not everything, just what’s actually worth
          your time. No tourist traps, no endless scrolling, no filler.
        </p>
        <p>
          Built for people who live here, this is where you go when you want better plans —
          whether it’s a date night, birthday, or a last-minute “what should we do tonight?”
        </p>
        <p>
          <strong>Because it’s not about finding things to do. It’s about actually doing them.</strong>
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/events">Browse experiences</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/faq">Read the FAQs</Link>
        </Button>
      </div>
    </article>
  );
}
