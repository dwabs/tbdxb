import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms you agree to when using TheBucketListDXB — bookings, payments, cancellations, liability and conduct.",
};

export default function TermsPage() {
  return (
    <article>
      <PageHeader title="Terms &amp; Conditions" updated="August 2026" />

      <div className="prose mt-8">
        <p className="lead">
          Welcome to TheBucketListDXB. By accessing or using our platform, you agree to the
          following terms.
        </p>

        <h2>1. Use of the platform</h2>
        <p>
          TheBucketListDXB is a curated marketplace that connects users with experiences across
          Dubai. By using our platform, you agree to use it only for lawful purposes and not to
          misuse, copy, or disrupt any part of the service.
        </p>

        <h2>2. Bookings &amp; payments</h2>
        <p>
          All bookings made through TheBucketListDXB are subject to availability and confirmation.
          We act as a platform connecting you with experience providers, and while we facilitate
          bookings and payments, the experience itself is delivered by third-party partners. Prices,
          availability, and details may change at any time.
        </p>

        <h2>3. Cancellations &amp; refunds</h2>
        <p>
          Cancellation and refund policies may vary depending on the experience provider. Where
          applicable, details will be shown at the time of booking, and users are responsible for
          reviewing these before confirming a purchase.
        </p>

        <h2>4. Responsibility &amp; liability</h2>
        <p>
          TheBucketListDXB is not responsible for the execution, quality, or safety of any
          experience listed on the platform. Any issues, injuries, or disputes arising from an
          experience must be resolved directly with the provider.
        </p>

        <h2>5. User conduct</h2>
        <p>
          By using our platform, you agree not to provide false or misleading information, attempt
          to interfere with the platform’s functionality, or use the platform for fraudulent or
          harmful activities. We reserve the right to suspend or remove access if these terms are
          violated.
        </p>

        <h2>6. Content &amp; listings</h2>
        <p>
          All content, including experience listings, descriptions, and images, is either provided
          by partners or curated by us. While we aim for accuracy, we do not guarantee that all
          information is always complete or up to date.
        </p>

        <h2>7. Changes to terms</h2>
        <p>
          We may update these Terms &amp; Conditions at any time. Continued use of the platform
          means you accept any updated terms.
        </p>
      </div>
    </article>
  );
}
