export const SITE = {
  name: "thebucketlistdxb",
  email: "thebucketlistdxb@gmail.com",
  phone: "+971509147621",
  phoneHref: "tel:+971509147621",
  instagram: "https://www.instagram.com/thebucketlistdxb",
} as const;

/**
 * Links carry a dictionary key, not a label — the href is structural and the
 * wording belongs to the locale. Paths are unprefixed; `localePath` adds the
 * locale at render time.
 */
export const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/about-us", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

/**
 * The sidebar on secondary pages. Partner-with-us is deliberately absent —
 * it's a vendor-facing page, not "the rest of the site" a visitor would
 * browse from here; it still links out via the footer.
 */
export const SECONDARY_NAV = [
  { href: "/about-us", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
  { href: "/refund-policy", key: "refund" },
  { href: "/terms-conditions", key: "terms" },
  { href: "/privacy-policy", key: "privacy" },
] as const;

/**
 * Keys index `auth.homeBase` in the dictionaries — structural list, locale
 * copy lives there. "visiting" last on purpose: it's the odd one out, not an
 * emirate.
 */
export const HOME_BASE_OPTIONS = [
  "dubai",
  "abuDhabi",
  "sharjah",
  "ajman",
  "ummAlQuwain",
  "rasAlKhaimah",
  "fujairah",
  "visiting",
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "quickLinks",
    links: [
      { href: "/refund-policy", key: "refundPolicy" },
      { href: "/faq", key: "faq" },
      { href: "/privacy-policy", key: "privacyPolicy" },
      { href: "/terms-conditions", key: "termsOfUse" },
    ],
  },
  {
    heading: "popularLinks",
    links: [
      { href: "/", key: "home" },
      { href: "/about-us", key: "about" },
      { href: "/contact", key: "contact" },
      { href: "/partner-with-us", key: "partner" },
    ],
  },
] as const;
