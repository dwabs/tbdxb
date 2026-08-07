/**
 * The English dictionary. It is also the source of the `Dictionary` type, so
 * a key added here fails the build until every other locale supplies it.
 */
export const en = {
  meta: {
    title: "The Bucket List DXB — Things worth doing in Dubai",
    titleTemplate: "%s · The Bucket List DXB",
    description:
      "Not just things to do — things worth doing. Hand-picked experiences, workshops and nights out across Dubai, chosen for people who actually live here.",
  },

  nav: {
    skipToContent: "Skip to content",
    homeAria: "The Bucket List DXB, home",
    main: "Main",
    home: "Home",
    about: "About Us",
    faq: "FAQs",
    contact: "Contact",
    signIn: "Sign In",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
  },

  auth: {
    close: "Close",
    email: {
      title: "Sign In",
      subtitle: "We'll email you a 6-digit code — no password to remember.",
      emailLabel: "Email",
      emailPlaceholder: "you@example.com",
      emailError: "Enter a valid email address.",
      sendError: "Couldn't send the code. Try again.",
      continue: "Continue",
      sending: "Sending…",
    },
    otp: {
      title: "Check your email",
      subtitle: "We sent a 6-digit code to {email}.",
      codeLabel: "Enter code",
      codeError: "That code didn't match. Try again.",
      verifying: "Verifying…",
      changeEmail: "Use a different email",
      resend: "Resend code",
      resendIn: "Resend code in {seconds}s",
    },
    profile: {
      title: "Just a few details",
      subtitle: "So we know who's booking.",
      nameLabel: "Full name",
      namePlaceholder: "Your name",
      nameError: "Enter your name.",
      mobileLabel: "Mobile",
      mobilePlaceholder: "+971 5X XXX XXXX",
      mobileError: "Enter a mobile number.",
      saveError: "Couldn't save. Try again.",
      finish: "Finish",
      finishing: "Saving…",
    },
    menu: {
      accountAria: "Account menu for {name}",
      editProfile: "Edit Profile",
      settings: "Settings",
    },
    signOut: "Sign out",
    welcome: {
      new: "👋 Welcome, {name}!",
      back: "👋 Welcome back, {name}!",
    },
  },

  hero: {
    eyebrow: "Dubai · Updated weekly",
    titleLead: "Things worth",
    titleRest: "doing in",
    titleHighlight: "Dubai",
    subtitle:
      "We don’t list everything — only the experiences we’d book ourselves. Find one, tick it off, go again.",
    listTitle: "Your bucket list",
    listProgress: "2 of 4 ticked off",
    listItems: [
      "Candle making at SALT",
      "Dhow supper on the creek",
      "Glassblowing in Al Quoz",
      "Supper club in the dunes",
    ],
  },

  search: {
    label: "Find an experience",
    keyword: "Search",
    keywordPlaceholder: "Candle making, padel, dhow…",
    from: "From",
    to: "To",
    anyDate: "Any date",
    guests: "Guests",
    any: "Any",
    addGuest: "Add a guest",
    removeGuest: "Remove a guest",
    submit: "Search",
    submitting: "Searching…",
    clear: "Clear",
  },

  categories: {
    "best-this-month": "Best Things to Do This Month",
    "date-night": "Date Night",
    "group-plans": "Group Plans",
    "try-something-new": "Try Something New",
    "summer-in-the-city": "Summer in the City",
  },

  home: {
    eyebrowFirst: "Fresh this month",
    seeAll: "See All",
    emptyTitle: "Nothing in {category} yet",
    emptyBody:
      "We only list what we would go to ourselves, so this row fills up slowly. Tell us what you want here and we will go find it.",
    suggest: "Suggest an Experience",
    whyEyebrow: "Why thebucketlistdxb",
    whyTitle: "Not just things to do — things worth doing",
    ctaTitle: "Planning something bigger?",
    ctaBody:
      "Birthdays, team days, proposals — tell us the brief and we’ll build the plan.",
    valueProps: [
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
    ],
  },

  events: {
    title: "Search",
    metaDescription:
      "Search every experience on The Bucket List DXB by keyword, date and group size.",
    countOne: "{count} experience",
    countOther: "{count} experiences",
    matching: " matching “{query}”",
    noMatchTitle: "No matches",
    noMatchBody:
      "Try a wider date range, fewer guests, or a different keyword.",
    clearFilters: "Clear Filters",
  },

  detail: {
    breadcrumb: "Breadcrumb",
    where: "Where",
    when: "When",
    duration: "Duration",
    groupSize: "Group size",
    about: "About This Experience",
    included: "What’s Included",
    location: "Where You’ll Be",
    openInMaps: "Open in Maps",
    related: "You Might Also Like",
    venueArea: "{venue}, {area}",
    inDubai: "{area}, Dubai",
    perPerson: "per person",
    date: "Date",
    time: "Time",
    guests: "Guests",
    addGuest: "Add a guest",
    removeGuest: "Remove a guest",
    bookNow: "Book Now",
    priceTimes: "{price} × {count}",
    guestOne: "guest",
    guestOther: "guests",
    cancellation:
      "Free cancellation up to 48 hours before. You won’t be charged yet.",
    booking: "Booking",
  },

  footer: {
    quickLinks: "Quick Links",
    popularLinks: "Popular Links",
    newsletter: "Newsletter",
    newsletterLabel: "One email a week, on Thursday. The good stuff only.",
    emailPlaceholder: "you@example.com",
    signUp: "Sign Up",
    signingUp: "Signing up…",
    subscribed: "You’re on the list. Look for us on Thursday.",
    invalidEmail: "Enter an email address that includes an @.",
    rights: "© {year} thebucketlistdxb. All rights reserved.",
    expert: "Speak to our expert at",
    instagramAria: "The Bucket List DXB on Instagram",
    tagline: "Not just things to do — things worth doing.",
    city: "Dubai, UAE",
    refundPolicy: "Refund Policy",
    faq: "FAQ",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    home: "Home",
    about: "About Us",
    contact: "Contact",
    partner: "Partner With Us",
  },

  secondaryNav: {
    heading: "More from us",
    label: "More pages",
    about: "About Us",
    faq: "FAQs",
    contact: "Contact",
    refund: "Refund Policy",
    terms: "Terms & Conditions",
    privacy: "Privacy Policy",
  },

  notFound: {
    title: "This one isn’t on the list.",
    body: "The page you’re after doesn’t exist, or it moved. The experiences are all still where you left them.",
    browse: "Browse experiences",
    backHome: "Back home",
    orTry: "Or try one of these",
    otherPages: "Other pages",
  },

  about: {
    title: "About TheBucketListDXB",
    metaDescription:
      "Dubai has everything. The problem is, most people don’t experience it. TheBucketListDXB curates the things actually worth your time.",
    lead: "Dubai has everything. The problem is, most people don’t experience it.",
    paragraphs: [
      "We fall into the same routines, save ideas for later, and never actually go. TheBucketListDXB exists to change that.",
      "We curate the best things to do in Dubai — not everything, just what’s actually worth your time. No tourist traps, no endless scrolling, no filler.",
      "Built for people who live here, this is where you go when you want better plans — whether it’s a date night, birthday, or a last-minute “what should we do tonight?”",
    ],
    closing:
      "Because it’s not about finding things to do. It’s about actually doing them.",
    browse: "Browse experiences",
    readFaq: "Read the FAQs",
  },

  contact: {
    title: "Contact Us",
    metaDescription:
      "Questions about a booking, an experience, or the site itself — send us a message and we’ll get back to you.",
    lead: "Got a question, a booking issue, or feedback on something we listed? Send us a message and we’ll get back to you personally — no bots, no ticket queue.",
    nameLabel: "Full name",
    namePlaceholder: "Your name",
    nameError: "Enter your name.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailError: "Enter an email address that includes an @.",
    messageLabel: "Message",
    messagePlaceholder: "How can we help?",
    messageError: "Say a little more — a few words is enough.",
    send: "Send Message",
    sending: "Sending…",
    sent: "Message sent. We’ll get back to you soon.",
    infoTitle: "Other ways to reach us",
  },

  partner: {
    title: "Partner With Us",
    metaDescription:
      "List your experience on TheBucketListDXB and reach Dubai locals who are actually looking to book.",
    lead: "We work with a small number of vendors at a time — not a listings dump. If what you run is worth doing, we want to hear about it.",
    paragraphs: [
      "TheBucketListDXB only lists experiences we’d book ourselves, which means most applications don’t make it in — and the ones that do get real attention: a proper listing, a spot in the category rails, and an audience that’s already looking for something to do this weekend.",
      "No setup fee. We take a commission on bookings made through the platform, agreed with you before you go live.",
    ],
    businessLabel: "Business name",
    businessPlaceholder: "Your business or brand",
    businessError: "Enter your business name.",
    contactLabel: "Your name",
    contactPlaceholder: "Full name",
    contactError: "Enter your name.",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailError: "Enter an email address that includes an @.",
    phoneLabel: "Phone",
    phonePlaceholder: "+971 5X XXX XXXX",
    phoneError: "Enter a phone number.",
    messageLabel: "Tell us about the experience",
    messagePlaceholder: "What you offer, where, and roughly how many people",
    messageError: "Say a little more — a few words is enough.",
    send: "Send Enquiry",
    sending: "Sending…",
    sent: "Thanks — we’ll be in touch within a few days.",
  },

  faq: {
    title: "Frequently Asked Questions",
    metaDescription:
      "How TheBucketListDXB works, who the experiences are for, and how cancellations and refunds are handled.",
    items: [
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
    ],
    stillStuckBefore: "Still stuck? Email us at ",
    stillStuckMiddle: " or read the ",
    stillStuckLink: "refund policy",
    stillStuckAfter: ".",
  },

  refund: {
    title: "Refund Policy",
    updated: "August 2026",
    lastUpdated: "Last updated",
    metaDescription:
      "Cancellation and refund policies vary by experience provider. Here’s how refunds, rescheduling and no-shows are handled.",
    lead: "We work with a range of experience providers across Dubai, so refund and cancellation policies may vary depending on the event or activity.",
    sections: [
      {
        heading: "Cancellations",
        body: "Each experience has its own cancellation policy, which will be shown before you complete your booking. Please review this carefully, as some experiences may be non-refundable or require advance notice to cancel.",
      },
      {
        heading: "Refunds",
        body: "Where refunds are allowed, they will be processed according to the experience provider’s policy. Once approved, refunds will be issued to your original payment method within a reasonable timeframe.",
      },
      {
        heading: "Changes & rescheduling",
        body: "Some experiences may allow date changes or rescheduling. This depends on the provider and availability. Details will be provided at the time of booking.",
      },
      {
        heading: "No-shows",
        body: "If you do not attend your booked experience, refunds are typically not provided.",
      },
      {
        heading: "Third-party responsibility",
        body: "All experiences are hosted by third-party providers. While we curate and list these experiences, the provider is responsible for delivering the service, including their cancellation and refund terms.",
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    updated: "August 2026",
    lastUpdated: "Last updated",
    metaDescription:
      "How TheBucketListDXB collects, uses and protects your information when you use the platform.",
    lead: "Your privacy matters to us. This policy explains how we collect, use, and protect your information when you use our platform.",
    sections: [
      {
        heading: "Information we collect",
        body: "When you use TheBucketListDXB, we may collect personal information such as your name, email address, phone number, and payment details when you make a booking or sign up. We may also collect basic usage data to improve your experience on the platform.",
      },
      {
        heading: "How we use your information",
        body: "We use your information to process bookings, communicate with you about your experiences, and improve our platform. This may include sending booking confirmations, updates, and relevant recommendations.",
      },
      {
        heading: "Sharing your information",
        body: "We may share necessary details with third-party experience providers to fulfill your booking. We do not sell your personal information to third parties.",
      },
      {
        heading: "Payments",
        body: "All payments are processed securely through third-party payment providers. We do not store your full payment details on our servers.",
      },
      {
        heading: "Marketing & communication",
        body: "If you opt in, we may send you updates about new experiences, offers, or events. You can unsubscribe at any time.",
      },
      {
        heading: "Data security",
        body: "We take reasonable steps to protect your personal information, but no system is completely secure. By using the platform, you acknowledge this.",
      },
      {
        heading: "Cookies & tracking",
        body: "We may use cookies or similar technologies to enhance your browsing experience and understand how users interact with our platform.",
      },
      {
        heading: "Your rights",
        body: "You can request access to, correction of, or deletion of your personal data by contacting us at {email}.",
      },
      {
        heading: "Changes to this policy",
        body: "We may update this Privacy Policy from time to time. Continued use of the platform means you accept any updates.",
      },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    updated: "August 2026",
    lastUpdated: "Last updated",
    metaDescription:
      "The terms you agree to when using TheBucketListDXB — bookings, payments, cancellations, liability and conduct.",
    lead: "Welcome to TheBucketListDXB. By accessing or using our platform, you agree to the following terms.",
    sections: [
      {
        heading: "1. Use of the platform",
        body: "TheBucketListDXB is a curated marketplace that connects users with experiences across Dubai. By using our platform, you agree to use it only for lawful purposes and not to misuse, copy, or disrupt any part of the service.",
      },
      {
        heading: "2. Bookings & payments",
        body: "All bookings made through TheBucketListDXB are subject to availability and confirmation. We act as a platform connecting you with experience providers, and while we facilitate bookings and payments, the experience itself is delivered by third-party partners. Prices, availability, and details may change at any time.",
      },
      {
        heading: "3. Cancellations & refunds",
        body: "Cancellation and refund policies may vary depending on the experience provider. Where applicable, details will be shown at the time of booking, and users are responsible for reviewing these before confirming a purchase.",
      },
      {
        heading: "4. Responsibility & liability",
        body: "TheBucketListDXB is not responsible for the execution, quality, or safety of any experience listed on the platform. Any issues, injuries, or disputes arising from an experience must be resolved directly with the provider.",
      },
      {
        heading: "5. User conduct",
        body: "By using our platform, you agree not to provide false or misleading information, attempt to interfere with the platform’s functionality, or use the platform for fraudulent or harmful activities. We reserve the right to suspend or remove access if these terms are violated.",
      },
      {
        heading: "6. Content & listings",
        body: "All content, including experience listings, descriptions, and images, is either provided by partners or curated by us. While we aim for accuracy, we do not guarantee that all information is always complete or up to date.",
      },
      {
        heading: "7. Changes to terms",
        body: "We may update these Terms & Conditions at any time. Continued use of the platform means you accept any updated terms.",
      },
    ],
  },
} as const;

/**
 * Widens the literal types `as const` produced. Without this, `Dictionary`
 * would demand the exact English strings and no translation could satisfy it.
 * Keys and shape are still enforced, so a missing or misspelled key in any
 * locale fails the build — which is the whole point of typing the dictionary.
 */
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer U)[]
        ? readonly Widen<U>[]
        : { readonly [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
