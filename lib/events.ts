import { EXPERIENCES_AR } from "./events-ar";
import type { Locale } from "./i18n/config";

export type Experience = {
  slug: string;
  title: string;
  shortTitle: string;
  venue: string;
  area: string;
  category: string;
  priceAED: number;
  date: string; // ISO
  endTime: string; // 24h "HH:MM"
  startTime: string; // 24h "HH:MM"
  durationLabel: string;
  groupSize: string;
  images: { src: string; alt: string; width: number; height: number }[];
  tags: string[];
  summary: string;
  body: string[];
  /**
   * The emoji is part of the row, not decoration bolted on at render time:
   * only whoever writes the line knows whether "All materials" is a paint
   * palette or a toolbox. It carries no meaning a screen reader needs — the
   * label says everything — so it is hidden from the accessibility tree.
   *
   * It also stays out of the translation overlays. An emoji is language
   * neutral, so repeating it per locale would only invite drift.
   */
  includes: { emoji: string; label: string }[];
  /**
   * Real listings are copied verbatim from thebucketlistdxb.com. Sample rows
   * exist only so the redesigned category rails can be evaluated with content
   * in them — replace them with live API data before this ships.
   */
  isSample: boolean;
};

/** Order matters — this is the order the rails appear in. Labels live in the
 *  dictionaries, keyed by these ids. */
export const CATEGORIES = [
  "best-this-month",
  "date-night",
  "group-plans",
  "try-something-new",
  "summer-in-the-city",
] as const;

export type CategoryId = (typeof CATEGORIES)[number];

export const EXPERIENCES: Experience[] = [
  {
    // ---- Real listing, copied from the live site ----
    slug: "an-afternoon-at-salt-candle-making-mango-softies",
    title: "An Afternoon at SALT: Candle Making & Mango Softies",
    shortTitle: "An Afternoon at SALT",
    venue: "SALT, Museum of the Future",
    area: "Sheikh Zayed Road",
    category: "best-this-month",
    priceAED: 169,
    date: "2026-08-08",
    startTime: "16:00",
    endTime: "18:00",
    durationLabel: "2 hours",
    groupSize: "Up to 16 people",
    tags: ["Workshop", "Hands-on", "Includes food"],
    images: [
      {
        src: "/events/salt-1.jpeg",
        alt: "A mango softie shaped candle lit against a blue backdrop",
        width: 1080,
        height: 1350,
      },
      {
        src: "/events/salt-2.jpeg",
        alt: "Hands stirring a candle wick into a glass vessel at a workshop table",
        width: 736,
        height: 1104,
      },
      {
        src: "/events/salt-3.jpeg",
        alt: "A hand holding SALT’s signature mango softie in a branded cup",
        width: 800,
        height: 1066,
      },
    ],
    summary:
      "One of Dubai’s favourite summer treats — turned into a candle. Pour and customise your own Mango Softie scent, then eat the real thing.",
    body: [
      "One of Dubai’s favourite summer treats—turned into a candle. 🥭🕯️",
      "Spend your Saturday afternoon at SALT, Museum of the Future creating your very own scented candle inspired by SALT’s iconic Mango Softie—then enjoy the real thing afterwards. During this two-hour guided workshop, you’ll learn how to pour, customise, and take home your handmade candle, with all materials included.",
      "Whether you’re planning a fun date, a girls’ catch-up, or simply looking for something different to do this summer, this is one of those uniquely Dubai experiences you won’t want to miss. Trust us…this is one you’ll definitely want to tick off your bucket list.",
    ],
    includes: [
      {
        emoji: "🕯️",
        label: "A guided Mango Softie-inspired candle-making workshop",
      },
      { emoji: "🧰", label: "All candle-making materials and supplies" },
      { emoji: "🥭", label: "SALT’s signature Mango Softie" },
      { emoji: "🎁", label: "Your handmade candle to take home" },
    ],
    isSample: false,
  },

  // ---- Sample listings below: placeholder content for layout review only ----
  // Photography is from Unsplash (unsplash.com/license — free for commercial
  // use, no attribution required). Swap for the operators' own shots at launch.
  {
    slug: "sunset-dhow-supper-al-seef",
    title: "Sunset Dhow Supper on Dubai Creek",
    shortTitle: "Sunset Dhow Supper",
    venue: "Al Seef Marine Station",
    area: "Al Seef",
    category: "date-night",
    priceAED: 295,
    date: "2026-08-14",
    startTime: "18:30",
    endTime: "21:00",
    durationLabel: "2.5 hours",
    groupSize: "Up to 24 people",
    tags: ["Dinner", "On the water", "Sunset"],
    images: [
      {
        src: "/events/sunset-dhow.jpg",
        alt: "A lantern-lit wooden dhow crossing the water at night below the Dubai skyline",
        width: 1600,
        height: 1200,
      },
    ],
    summary:
      "A slow loop of the creek on a restored wooden dhow, with a four-course Emirati supper served as the light goes.",
    body: [
      "A slow loop of the creek on a restored wooden dhow, with a four-course Emirati supper served as the light goes.",
    ],
    includes: [
      { emoji: "🍽️", label: "Four-course Emirati supper" },
      { emoji: "☕", label: "Soft drinks and karak" },
      { emoji: "⛵", label: "Two-hour creek cruise" },
    ],
    isSample: true,
  },
  {
    slug: "rooftop-film-club-alserkal",
    title: "Rooftop Film Club at Alserkal Avenue",
    shortTitle: "Rooftop Film Club",
    venue: "Alserkal Avenue",
    area: "Al Quoz",
    category: "date-night",
    priceAED: 120,
    date: "2026-08-21",
    startTime: "20:00",
    endTime: "22:30",
    durationLabel: "2.5 hours",
    groupSize: "Up to 60 people",
    tags: ["Outdoors", "Late night"],
    images: [
      {
        src: "/events/rooftop-cinema.jpg",
        alt: "Two people in chairs watching a film on an open-air screen strung with festoon lights",
        width: 1600,
        height: 1067,
      },
    ],
    summary:
      "Deckchairs, wireless headphones and a cult film on a warehouse roof, with the Al Quoz skyline behind the screen.",
    body: [
      "Deckchairs, wireless headphones and a cult film on a warehouse roof.",
    ],
    includes: [
      { emoji: "🪑", label: "Reserved deckchair" },
      { emoji: "🎧", label: "Wireless headphones" },
      { emoji: "🥤", label: "One drink from the kiosk" },
    ],
    isSample: true,
  },
  {
    slug: "padel-and-pizza-social",
    title: "Padel & Pizza Social",
    shortTitle: "Padel & Pizza Social",
    venue: "Padel Pro, Al Barsha",
    area: "Al Barsha",
    category: "group-plans",
    priceAED: 145,
    date: "2026-08-16",
    startTime: "19:00",
    endTime: "22:00",
    durationLabel: "3 hours",
    groupSize: "8 – 24 people",
    tags: ["Sport", "Beginner friendly", "Includes food"],
    images: [
      {
        src: "/events/padel.jpg",
        alt: "Two padel bats and scattered balls on a blue court, seen from above",
        width: 1600,
        height: 1067,
      },
    ],
    summary:
      "Two hours of round-robin padel across four courts, then pizza on the terrace. Rackets provided, no partner needed.",
    body: [
      "Two hours of round-robin padel across four courts, then pizza on the terrace.",
    ],
    includes: [
      { emoji: "🎾", label: "Court hire and rackets" },
      { emoji: "🏆", label: "Round-robin matches" },
      { emoji: "🍕", label: "Pizza and drinks after" },
    ],
    isSample: true,
  },
  {
    slug: "desert-supper-club",
    title: "Desert Supper Club at Al Marmoom",
    shortTitle: "Desert Supper Club",
    venue: "Al Marmoom Desert Conservation Reserve",
    area: "Al Marmoom",
    category: "group-plans",
    priceAED: 420,
    date: "2026-08-29",
    startTime: "17:30",
    endTime: "22:00",
    durationLabel: "4.5 hours",
    groupSize: "Up to 30 people",
    tags: ["Dinner", "Out of town", "Stargazing"],
    images: [
      {
        src: "/events/desert-camp.jpg",
        alt: "White canvas tents at a desert camp in the dunes at twilight",
        width: 1600,
        height: 1067,
      },
    ],
    summary:
      "A long table set in the dunes, a fire-pit menu cooked in front of you, and a telescope once the sky clears.",
    body: [
      "A long table set in the dunes, with a fire-pit menu cooked in front of you.",
    ],
    includes: [
      { emoji: "🚐", label: "Return transfer from Dubai" },
      { emoji: "🔥", label: "Fire-pit dinner" },
      { emoji: "🔭", label: "Guided stargazing" },
    ],
    isSample: true,
  },
  {
    slug: "glassblowing-taster-dubai-glass",
    title: "Glassblowing Taster Session",
    shortTitle: "Glassblowing Taster",
    venue: "Dubai Glass Studio",
    area: "Al Quoz",
    category: "try-something-new",
    priceAED: 350,
    date: "2026-08-12",
    startTime: "11:00",
    endTime: "13:00",
    durationLabel: "2 hours",
    groupSize: "Up to 6 people",
    tags: ["Workshop", "Hands-on", "Small group"],
    images: [
      {
        src: "/events/glassblowing.jpg",
        alt: "A glassmaker shaping a clear vessel in the flame of a torch",
        width: 1600,
        height: 1067,
      },
    ],
    summary:
      "Gather, shape and blow your first piece at a 1,100°C furnace, under one-to-one instruction. Take it home the next week.",
    body: ["Gather, shape and blow your first piece at a 1,100°C furnace."],
    includes: [
      { emoji: "🔥", label: "Two-hour guided session" },
      { emoji: "🧰", label: "All materials" },
      { emoji: "🏺", label: "Your finished piece, collected later" },
    ],
    isSample: true,
  },
  {
    slug: "arabic-calligraphy-workshop",
    title: "Arabic Calligraphy from Scratch",
    shortTitle: "Arabic Calligraphy",
    venue: "Sikka Art Space",
    area: "Al Fahidi",
    category: "try-something-new",
    priceAED: 190,
    date: "2026-08-19",
    startTime: "17:00",
    endTime: "19:30",
    durationLabel: "2.5 hours",
    groupSize: "Up to 12 people",
    tags: ["Workshop", "Beginner friendly"],
    images: [
      {
        src: "/events/calligraphy.jpg",
        alt: "A calligrapher writing Arabic script in red ink with a reed pen",
        width: 1600,
        height: 1067,
      },
    ],
    summary:
      "Learn to cut a reed pen and write your name in Diwani script, taught by a calligrapher in a wind-tower house.",
    body: ["Learn to cut a reed pen and write your name in Diwani script."],
    includes: [
      { emoji: "🖋️", label: "Reed pen and ink to keep" },
      { emoji: "📄", label: "Practice sheets" },
      { emoji: "☕", label: "Arabic coffee and dates" },
    ],
    isSample: true,
  },
];

/**
 * English is the canonical row; other locales overlay only the prose. A
 * missing translation falls back to English rather than blanking the card.
 */
function localise(experience: Experience, locale: Locale): Experience {
  if (locale === "en") return experience;
  const overlay = EXPERIENCES_AR[experience.slug];
  if (!overlay) return experience;
  return {
    ...experience,
    ...overlay,
    // Emoji come from the English row; only the label is translated. Walking
    // the English list rather than the overlay means a short or over-long
    // translation can never add or drop a bullet — the worst case is one line
    // falling back to English.
    includes: experience.includes.map(({ emoji, label }, i) => ({
      emoji,
      label: overlay.includes[i] ?? label,
    })),
  };
}

export const allExperiences = (locale: Locale) =>
  EXPERIENCES.map((experience) => localise(experience, locale));

export const experiencesByCategory = (categoryId: string, locale: Locale) =>
  EXPERIENCES.filter((experience) => experience.category === categoryId).map(
    (experience) => localise(experience, locale),
  );

export const getExperience = (slug: string, locale: Locale) => {
  const found = EXPERIENCES.find((experience) => experience.slug === slug);
  return found ? localise(found, locale) : undefined;
};

export const relatedExperiences = (
  experience: Experience,
  locale: Locale,
  limit = 3,
) =>
  EXPERIENCES.filter((candidate) => candidate.slug !== experience.slug)
    .slice(0, limit)
    .map((candidate) => localise(candidate, locale));
