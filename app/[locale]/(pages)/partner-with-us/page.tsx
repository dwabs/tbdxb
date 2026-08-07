import type { Metadata } from "next";

import { InquiryForm, type InquiryField } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/partner-with-us">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).partner;
  return { title: t.title, description: t.metaDescription };
}

export default async function PartnerPage({
  params,
}: PageProps<"/[locale]/partner-with-us">) {
  const { locale } = await params;
  const t = getDictionary(locale).partner;

  const fields: InquiryField[] = [
    {
      name: "business",
      type: "text",
      label: t.businessLabel,
      placeholder: t.businessPlaceholder,
      error: t.businessError,
      autoComplete: "organization",
    },
    {
      name: "contact",
      type: "text",
      label: t.contactLabel,
      placeholder: t.contactPlaceholder,
      error: t.contactError,
      autoComplete: "name",
    },
    {
      name: "email",
      type: "email",
      label: t.emailLabel,
      placeholder: t.emailPlaceholder,
      error: t.emailError,
      autoComplete: "email",
      email: true,
    },
    {
      name: "phone",
      type: "tel",
      label: t.phoneLabel,
      placeholder: t.phonePlaceholder,
      error: t.phoneError,
      autoComplete: "tel",
    },
    {
      name: "message",
      type: "textarea",
      label: t.messageLabel,
      placeholder: t.messagePlaceholder,
      error: t.messageError,
      minLength: 10,
    },
  ];

  return (
    <article>
      <PageHeader title={t.title} />

      <div className="prose mt-8">
        <p className="lead">{t.lead}</p>
        {t.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-10 max-w-lg">
        <InquiryForm
          idPrefix="partner"
          fields={fields}
          submitLabel={t.send}
          sendingLabel={t.sending}
          successMessage={t.sent}
        />
      </div>
    </article>
  );
}
