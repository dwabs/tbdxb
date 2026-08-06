export const SITE = {
  name: "thebucketlistdxb",
  tagline: "Not just things to do — things worth doing.",
  email: "thebucketlistdxb@gmail.com",
  phone: "+971509147621",
  phoneHref: "tel:+971509147621",
  city: "Dubai, UAE",
  instagram: "https://www.instagram.com/thebucketlistdxb",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/bucket-list", label: "Your Bucket List" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_COLUMNS = [
  {
    heading: "Quick Links",
    links: [
      { href: "/refund-policy", label: "Refund Policy" },
      { href: "/faq", label: "FAQ" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms-conditions", label: "Terms of Use" },
    ],
  },
  {
    heading: "Popular Links",
    links: [
      { href: "/", label: "Home" },
      { href: "/about-us", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/partner-with-us", label: "Partner With Us" },
    ],
  },
] as const;

export const VALUE_PROPS = [
  {
    title: "Made for Dubai locals",
    body: "No tourist traps. Just the spots, events and experiences people here genuinely love.",
  },
  {
    title: "Plans you actually follow through on",
    body: "Less scrolling, more doing. We make it easy to go from “that looks cool” to “I’m going”.",
  },
  {
    title: "For the moments that matter",
    body: "Date nights, birthdays, last-minute plans — sorted, without the group-chat debate.",
  },
  {
    title: "We don’t list everything",
    body: "Only the experiences that are actually worth your time. If we wouldn’t go, it isn’t here.",
  },
] as const;
