import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

import { InquiryForm, type InquiryField } from "@/components/inquiry-form";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/lib/i18n";
import { SITE } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).contact;
  return { title: t.title, description: t.metaDescription };
}

export default async function ContactPage({
  params,
}: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  const t = getDictionary(locale).contact;

  const fields: InquiryField[] = [
    {
      name: "name",
      type: "text",
      label: t.nameLabel,
      placeholder: t.namePlaceholder,
      error: t.nameError,
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

      <p className="mt-8 max-w-[60ch] text-[1.0625rem] leading-relaxed text-ink-muted">
        {t.lead}
      </p>

      <div className="mt-8 max-w-lg">
        <InquiryForm
          idPrefix="contact"
          fields={fields}
          submitLabel={t.send}
          sendingLabel={t.sending}
          successMessage={t.sent}
        />
      </div>

      <div className="mt-10 max-w-lg rounded-card border border-line bg-paper p-6">
        <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
          {t.infoTitle}
        </h2>
        <ul className="mt-4 space-y-3 text-[0.9375rem] text-ink-muted">
          <li className="flex items-center gap-2.5">
            <Mail
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-subtle"
            />
            <a
              href={`mailto:${SITE.email}`}
              className="hover:text-accent-deep hover:underline"
            >
              {SITE.email}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <Phone
              aria-hidden="true"
              className="size-4 shrink-0 text-ink-subtle"
            />
            <a
              href={SITE.phoneHref}
              dir="ltr"
              className="tabular hover:text-accent-deep hover:underline"
            >
              {SITE.phone}
            </a>
          </li>
        </ul>
      </div>
    </article>
  );
}
