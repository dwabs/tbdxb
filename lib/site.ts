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
 * The sidebar on secondary pages. Only routes that exist are listed — the
 * live site's equivalent also links to its contact page, which lands in a
 * later phase. Add it here when it ships.
 */
export const SECONDARY_NAV = [
  { href: "/about-us", key: "about" },
  { href: "/faq", key: "faq" },
  { href: "/refund-policy", key: "refund" },
  { href: "/terms-conditions", key: "terms" },
  { href: "/privacy-policy", key: "privacy" },
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
