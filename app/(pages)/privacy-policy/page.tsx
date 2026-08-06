import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How TheBucketListDXB collects, uses and protects your information when you use the platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      <PageHeader title="Privacy Policy" updated="August 2026" />

      <div className="prose mt-8">
        <p className="lead">
          Your privacy matters to us. This policy explains how we collect, use, and protect your
          information when you use our platform.
        </p>

        <h2>Information we collect</h2>
        <p>
          When you use TheBucketListDXB, we may collect personal information such as your name,
          email address, phone number, and payment details when you make a booking or sign up. We
          may also collect basic usage data to improve your experience on the platform.
        </p>

        <h2>How we use your information</h2>
        <p>
          We use your information to process bookings, communicate with you about your experiences,
          and improve our platform. This may include sending booking confirmations, updates, and
          relevant recommendations.
        </p>

        <h2>Sharing your information</h2>
        <p>
          We may share necessary details with third-party experience providers to fulfill your
          booking. We do not sell your personal information to third parties.
        </p>

        <h2>Payments</h2>
        <p>
          All payments are processed securely through third-party payment providers. We do not store
          your full payment details on our servers.
        </p>

        <h2>Marketing &amp; communication</h2>
        <p>
          If you opt in, we may send you updates about new experiences, offers, or events. You can
          unsubscribe at any time.
        </p>

        <h2>Data security</h2>
        <p>
          We take reasonable steps to protect your personal information, but no system is completely
          secure. By using the platform, you acknowledge this.
        </p>

        <h2>Cookies &amp; tracking</h2>
        <p>
          We may use cookies or similar technologies to enhance your browsing experience and
          understand how users interact with our platform.
        </p>

        <h2>Your rights</h2>
        <p>
          You can request access to, correction of, or deletion of your personal data by contacting
          us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Continued use of the platform means
          you accept any updates.
        </p>
      </div>
    </article>
  );
}
