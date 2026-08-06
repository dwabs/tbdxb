import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Cancellation and refund policies vary by experience provider. Here’s how refunds, rescheduling and no-shows are handled.",
};

export default function RefundPolicyPage() {
  return (
    <article>
      <PageHeader title="Refund Policy" updated="August 2026" />

      <div className="prose mt-8">
        <p className="lead">
          We work with a range of experience providers across Dubai, so refund and cancellation
          policies may vary depending on the event or activity.
        </p>

        <h2>Cancellations</h2>
        <p>
          Each experience has its own cancellation policy, which will be shown before you complete
          your booking. Please review this carefully, as some experiences may be non-refundable or
          require advance notice to cancel.
        </p>

        <h2>Refunds</h2>
        <p>
          Where refunds are allowed, they will be processed according to the experience provider’s
          policy. Once approved, refunds will be issued to your original payment method within a
          reasonable timeframe.
        </p>

        <h2>Changes &amp; rescheduling</h2>
        <p>
          Some experiences may allow date changes or rescheduling. This depends on the provider and
          availability. Details will be provided at the time of booking.
        </p>

        <h2>No-shows</h2>
        <p>
          If you do not attend your booked experience, refunds are typically not provided.
        </p>

        <h2>Third-party responsibility</h2>
        <p>
          All experiences are hosted by third-party providers. While we curate and list these
          experiences, the provider is responsible for delivering the service, including their
          cancellation and refund terms.
        </p>
      </div>
    </article>
  );
}
