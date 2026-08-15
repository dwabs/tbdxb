#!/usr/bin/env python3
"""Builds the owner's handbook PDF for thebucketlistdxb."""

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    ListFlowable,
    ListItem,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

OUT = "TheBucketListDXB-Owners-Handbook.pdf"

# Brand palette, taken from the project's own tokens.
MAROON = colors.HexColor("#4A2536")
PINK = colors.HexColor("#F47EB4")
INK = colors.HexColor("#331924")
INK_MUTED = colors.HexColor("#7A5766")
CANVAS = colors.HexColor("#FFFAFC")
BLUSH = colors.HexColor("#FDEFF5")
LINE = colors.HexColor("#E8D5DE")
CODE_BG = colors.HexColor("#F4F0F2")
WARN_BG = colors.HexColor("#FDEDED")
WARN_LINE = colors.HexColor("#E5A0A0")
OK_BG = colors.HexColor("#EDF7F0")
OK_LINE = colors.HexColor("#9CC9AC")

styles = getSampleStyleSheet()


def S(name, **kw):
    return ParagraphStyle(name, **kw)


ST_TITLE = S("t", fontName="Helvetica-Bold", fontSize=30, leading=35,
             textColor=MAROON, alignment=TA_CENTER, spaceAfter=6)
ST_SUB = S("s", fontName="Helvetica", fontSize=13, leading=18,
           textColor=INK_MUTED, alignment=TA_CENTER)
ST_H1 = S("h1", fontName="Helvetica-Bold", fontSize=21, leading=25,
          textColor=MAROON, spaceBefore=2, spaceAfter=10)
ST_H2 = S("h2", fontName="Helvetica-Bold", fontSize=14.5, leading=19,
          textColor=MAROON, spaceBefore=15, spaceAfter=6, keepWithNext=1)
ST_H3 = S("h3", fontName="Helvetica-Bold", fontSize=11.5, leading=15,
          textColor=INK, spaceBefore=11, spaceAfter=4, keepWithNext=1)
ST_BODY = S("b", fontName="Helvetica", fontSize=10, leading=15.2,
            textColor=INK, spaceAfter=7, alignment=TA_LEFT)
ST_SMALL = S("sm", fontName="Helvetica", fontSize=8.8, leading=13,
             textColor=INK_MUTED, spaceAfter=5)
ST_BULLET = S("bu", fontName="Helvetica", fontSize=10, leading=14.5,
              textColor=INK, spaceAfter=3)
ST_CODE = S("c", fontName="Courier-Bold", fontSize=9, leading=13.5,
            textColor=MAROON)
ST_CODE_SM = S("csm", fontName="Courier", fontSize=8.6, leading=12.5,
               textColor=INK)
ST_LABEL = S("lb", fontName="Helvetica-Bold", fontSize=7.6, leading=10,
             textColor=PINK)
ST_LABEL_W = S("lbw", fontName="Helvetica-Bold", fontSize=7.6, leading=10,
               textColor=colors.HexColor("#B03030"))
ST_LABEL_O = S("lbo", fontName="Helvetica-Bold", fontSize=7.6, leading=10,
               textColor=colors.HexColor("#2E7D4F"))
ST_BOXBODY = S("bb", fontName="Helvetica", fontSize=9.4, leading=13.8,
               textColor=INK)
ST_STEPNUM = S("sn", fontName="Helvetica-Bold", fontSize=15, leading=18,
               textColor=colors.white, alignment=TA_CENTER)
ST_STEPTITLE = S("st", fontName="Helvetica-Bold", fontSize=12, leading=16,
                 textColor=MAROON)
ST_TOC = S("toc", fontName="Helvetica", fontSize=10.2, leading=17,
           textColor=INK)
ST_CELL = S("cell", fontName="Helvetica", fontSize=9, leading=12.5,
            textColor=INK)
ST_CELLB = S("cellb", fontName="Helvetica-Bold", fontSize=9, leading=12.5,
             textColor=MAROON)
ST_CELLC = S("cellc", fontName="Courier", fontSize=8.4, leading=12,
             textColor=INK)

W = A4[0] - 40 * mm  # usable width


def h1(t):
    return Paragraph(t, ST_H1)


def h2(t):
    return Paragraph(t, ST_H2)


def h3(t):
    return Paragraph(t, ST_H3)


def p(t):
    return Paragraph(t, ST_BODY)


def small(t):
    return Paragraph(t, ST_SMALL)


def bullets(items, style=ST_BULLET):
    return ListFlowable(
        [ListItem(Paragraph(i, style), leftIndent=12) for i in items],
        bulletType="bullet", bulletChar="•", bulletFontSize=10,
        bulletColor=PINK, leftIndent=14, spaceAfter=7,
    )


def numbered(items):
    return ListFlowable(
        [ListItem(Paragraph(i, ST_BULLET), leftIndent=14) for i in items],
        bulletType="1", bulletFontName="Helvetica-Bold",
        bulletFontSize=9.5, bulletColor=PINK, leftIndent=15, spaceAfter=7,
    )


def _box(label, label_style, body_flowables, bg, border):
    inner = [Paragraph(label, label_style), Spacer(1, 3)] + body_flowables
    t = Table([[inner]], colWidths=[W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def prompt(text, label="TYPE THIS INTO CLAUDE CODE"):
    """A prompt the owner copies verbatim into the Claude Code chat."""
    body = [Paragraph(line, ST_CODE) for line in text.split("\n")]
    return KeepTogether([_box(label, ST_LABEL, body, BLUSH, LINE),
                         Spacer(1, 9)])


def terminal(text, label="TYPE THIS INTO THE TERMINAL"):
    body = [Paragraph(line, ST_CODE_SM) for line in text.split("\n")]
    return KeepTogether([_box(label, ST_LABEL, body, CODE_BG, LINE),
                         Spacer(1, 9)])


def warn(title, text):
    return KeepTogether([
        _box("STOP - " + title, ST_LABEL_W,
             [Paragraph(text, ST_BOXBODY)], WARN_BG, WARN_LINE),
        Spacer(1, 9)])


def tip(title, text):
    return KeepTogether([
        _box(title, ST_LABEL_O, [Paragraph(text, ST_BOXBODY)], OK_BG, OK_LINE),
        Spacer(1, 9)])


def step(num, title, flowables):
    """A numbered step: pink circle-ish badge, title, then content."""
    badge = Table([[Paragraph(str(num), ST_STEPNUM)]], colWidths=[9 * mm],
                  rowHeights=[9 * mm])
    badge.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PINK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    head = Table([[badge, Paragraph(title, ST_STEPTITLE)]],
                 colWidths=[12 * mm, W - 12 * mm])
    head.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return [head] + flowables + [Spacer(1, 4)]


def table(rows, widths, header=True):
    data = []
    for r_i, row in enumerate(rows):
        out = []
        for c_i, cell in enumerate(row):
            if r_i == 0 and header:
                st = ST_CELLB
            elif cell.startswith("`") and cell.endswith("`"):
                st = ST_CELLC
                cell = cell[1:-1]
            else:
                st = ST_CELL
            out.append(Paragraph(cell, st))
        data.append(out)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -2), 0.4, LINE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
    ]
    if header:
        style += [("BACKGROUND", (0, 0), (-1, 0), BLUSH)]
    t.setStyle(TableStyle(style))
    return KeepTogether([t, Spacer(1, 10)])


# ---------------------------------------------------------------- page frame
def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CANVAS)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    # footer
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(INK_MUTED)
    canvas.drawString(20 * mm, 12 * mm, "The Bucket List DXB - Owner's Handbook")
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, str(canvas.getPageNumber()))
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(20 * mm, 16 * mm, A4[0] - 20 * mm, 16 * mm)
    canvas.restoreState()


def on_cover(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(MAROON)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setFillColor(PINK)
    canvas.rect(0, A4[1] - 14 * mm, A4[0], 14 * mm, stroke=0, fill=1)
    canvas.restoreState()


ST_COVER_T = S("ct", fontName="Helvetica-Bold", fontSize=34, leading=40,
               textColor=colors.white, alignment=TA_CENTER)
ST_COVER_S = S("cs", fontName="Helvetica", fontSize=14, leading=20,
               textColor=PINK, alignment=TA_CENTER)
ST_COVER_B = S("cb", fontName="Helvetica", fontSize=10.5, leading=16,
               textColor=colors.HexColor("#D9C2CC"), alignment=TA_CENTER)

doc = BaseDocTemplate(
    OUT, pagesize=A4,
    leftMargin=20 * mm, rightMargin=20 * mm,
    topMargin=20 * mm, bottomMargin=22 * mm,
    title="The Bucket List DXB - Owner's Handbook",
    author="Handover documentation",
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[frame], onPage=on_cover),
    PageTemplate(id="body", frames=[frame], onPage=on_page),
])

E = []

# ------------------------------------------------------------------- COVER
E += [
    Spacer(1, 55 * mm),
    Paragraph("The Bucket List DXB", ST_COVER_T),
    Spacer(1, 6),
    Paragraph("Owner's Handbook", ST_COVER_S),
    Spacer(1, 22 * mm),
    Paragraph(
        "How to run, change and grow your website<br/>"
        "working together with an AI assistant.",
        ST_COVER_B),
    Spacer(1, 40 * mm),
    Paragraph(
        "Written for the new owners.<br/>"
        "No programming experience assumed.",
        ST_COVER_B),
    NextPageTemplate("body"),
    PageBreak(),
]

# --------------------------------------------------------------------- TOC
E += [
    h1("What is in this handbook"),
    p("Work through Part 1 once, on your own computer. After that, dip into "
      "whichever part you need. Nothing here assumes you can write code."),
]
E += [table([
    ["Part", "What it covers", "When to read it"],
    ["1", "Setting up your computer", "Once, at the start"],
    ["2", "Talking to Claude Code", "Before your first change"],
    ["3", "Everyday tasks, step by step", "Whenever you want a change"],
    ["4", "Publishing changes to the live site", "Every time you change something"],
    ["5", "Running the business day to day", "Ongoing"],
    ["6", "Rules that keep you safe", "Read once, remember forever"],
    ["7", "When something goes wrong", "As needed"],
    ["8", "Plain-English dictionary", "Whenever a word confuses you"],
], [16 * mm, W - 66 * mm, 50 * mm])]

E += [
    h2("First, what you actually own"),
    p("Your product is <b>three separate websites</b> that all share <b>one "
      "database</b>. That last part matters: a change to the database affects "
      "all three."),
]
E += [table([
    ["Website", "Address", "Who uses it"],
    ["The public site", "tbdxb.vercel.app", "Your customers. English and Arabic"],
    ["Vendor dashboard", "vendor-tbdxb.vercel.app",
     "Businesses that list experiences with you"],
    ["Admin dashboard", "admin-tbdxb.vercel.app",
     "You and your staff"],
], [40 * mm, 52 * mm, W - 92 * mm])]

E += [
    p("Behind them sit four services. You will need an account for each."),
]
E += [table([
    ["Service", "What it does for you", "What happens if it breaks"],
    ["Supabase", "Stores all data: events, bookings, customer accounts, photos",
     "Everything stops. This is the most important one"],
    ["Vercel", "Runs the three websites",
     "The sites go offline, but no data is lost"],
    ["GitHub", "Stores the code and its full history",
     "Sites keep running; you cannot publish changes"],
    ["Resend", "Sends the sign-in code emails",
     "Customers cannot sign in"],
], [26 * mm, (W - 26 * mm) / 2, (W - 26 * mm) / 2])]

E += [PageBreak()]

# ================================================================== PART 1
E += [h1("Part 1 - Setting up your computer")]
E += [p("You only do this once. Set aside about an hour. If a step fails, "
        "skip to Part 7 at the back.")]

E += step(1, "Get access to the four services", [
    p("Before anything else, make sure you can sign in to all four. The "
      "previous owner transfers these to you."),
    bullets([
        "<b>Supabase</b> - supabase.com. You should see a project named "
        "<b>tbdxb</b>.",
        "<b>Vercel</b> - vercel.com. You should see <b>three</b> projects.",
        "<b>GitHub</b> - github.com. You should see the code repository.",
        "<b>Resend</b> - resend.com. Used for sending emails.",
    ]),
    warn("Do not skip this",
         "If you cannot sign in to all four, stop and sort that out first. "
         "Everything below depends on it."),
])

E += step(2, "Install the free tools", [
    p("Three things to install. Take them in order."),
    h3("a) Node.js - the engine that runs the websites"),
    p("Go to <b>nodejs.org</b> and download the version marked <b>LTS</b>. "
      "Open the file and click through the installer."),
    h3("b) Git - keeps the history of every change"),
    p("Go to <b>git-scm.com/downloads</b>, download for your system, and "
      "install it. On a Mac it may already be installed."),
    h3("c) Claude Code - your AI developer"),
    p("Go to <b>claude.ai/code</b> and follow the install instructions. You "
      "will need a Claude account, which is a paid subscription."),
])

E += step(3, "Open the Terminal", [
    p("The Terminal is a window where you type commands instead of clicking. "
      "It looks intimidating and is not. You will use about six commands, ever."),
    bullets([
        "<b>Mac:</b> press Cmd+Space, type <b>Terminal</b>, press Enter.",
        "<b>Windows:</b> press the Start button, type <b>Terminal</b>, press Enter.",
    ]),
    p("Check the tools installed correctly by typing this and pressing Enter:"),
    terminal("node --version"),
    p("You should see something like <b>v22.1.0</b>. Any number is fine. If "
      "you instead see <i>command not found</i>, Node.js did not install - "
      "try Step 2a again."),
])

E += step(4, "Download your code", [
    p("In GitHub, open your repository and click the green <b>Code</b> button, "
      "then copy the HTTPS address. It ends in <b>.git</b>."),
    p("In the Terminal, type this, replacing the address with yours:"),
    terminal("cd ~/Documents\ngit clone https://github.com/YOUR-NAME/tbdxb.git\ncd tbdxb"),
    p("You now have a copy of the whole project in "
      "<b>Documents/tbdxb</b> on your computer."),
    tip("What just happened",
        "<b>cd</b> means change directory - it walks you into a folder. "
        "<b>git clone</b> downloads the project. You will use <b>cd</b> "
        "often; the others rarely."),
])

E += step(5, "Add the secret keys", [
    p("The code needs passwords to reach your database. These are kept in "
      "files that are deliberately never uploaded to GitHub, so you create "
      "them by hand once."),
    p("Open the <b>tbdxb</b> folder in Finder or File Explorer. You will "
      "create <b>three</b> files, all named <b>.env.local</b> - note the dot "
      "at the front:"),
    bullets([
        "One in the main <b>tbdxb</b> folder",
        "One in <b>tbdxb/apps/vendor</b>",
        "One in <b>tbdxb/apps/admin</b>",
    ]),
    p("Easiest way: ask Claude Code to do it for you. Start it first (Step 6), "
      "then use this:"),
    prompt("Create the three .env.local files I need for local development,\n"
           "using .env.local.example as the template. Leave the values blank\n"
           "and tell me exactly which value goes where."),
    p("Then fill in the values from <b>Supabase, Settings, API Keys</b>:"),
])
E += [table([
    ["Value in the file", "Where to find it in Supabase"],
    ["`NEXT_PUBLIC_SUPABASE_URL`", "Settings, Data API - the Project URL"],
    ["`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`",
     "Settings, API Keys - the publishable key (starts sb_publishable_)"],
    ["`SUPABASE_SECRET_KEY`",
     "Settings, API Keys - the secret key (starts sb_secret_). "
     "Only needed in the vendor and admin files"],
], [62 * mm, W - 62 * mm])]
E += [
    warn("Always use the copy button",
         "Never select a key with your mouse and copy it. The key wraps onto "
         "two lines on screen, and dragging across the wrap silently adds a "
         "space in the middle. That breaks it, and the error message you get "
         "will not tell you why. This has already happened once on this "
         "project. Use the copy icon next to the key, every time."),
]

E += step(6, "Start Claude Code and say hello", [
    p("In the Terminal, make sure you are in the project folder, then start it:"),
    terminal("cd ~/Documents/tbdxb\nclaude"),
    p("Claude Code starts and reads the project's built-in instructions "
      "automatically. Your very first message should be this:"),
    prompt("I am the new owner of this project and I am not a developer.\n"
           "Read CLAUDE.md and docs/README.md, then explain in plain English:\n"
           "what this project is, what the three apps do, and what I should\n"
           "be careful about."),
    p("Read the answer. This is the moment where the project stops being a "
      "mystery."),
])

E += step(7, "Run the sites on your own computer", [
    p("Before changing anything, get the site running locally. This is your "
      "practice space - nothing you do here touches the live site or real "
      "customers."),
    prompt("Start the public site on my computer so I can see it in a browser."),
    p("Claude Code will run it and give you an address, usually "
      "<b>http://localhost:3000</b>. Open that in your browser. That is your "
      "website, running on your own machine."),
    p("The other two work the same way:"),
])
E += [table([
    ["Site", "Local address"],
    ["Public site", "`http://localhost:3000`"],
    ["Vendor dashboard", "`http://localhost:3200`"],
    ["Admin dashboard", "`http://localhost:3300`"],
], [55 * mm, W - 55 * mm])]
E += [tip("You are set up",
          "From here on, the loop is always the same: describe what you want, "
          "look at it locally, then publish. Part 3 walks through it.")]

E += [PageBreak()]

# ================================================================== PART 2
E += [h1("Part 2 - Talking to Claude Code")]
E += [p("Claude Code is a developer that works by conversation. It can read "
        "every file, write code, run the site, and publish changes. The "
        "quality of what you get back depends almost entirely on how you ask.")]

E += [h2("The five habits that matter")]

E += [h3("1. Say what you want, not how to build it")]
E += [p("You are the client, not the engineer. Describe the outcome.")]
E += [table([
    ["Weaker", "Better"],
    ["Change the CSS flex property on the booking panel",
     "The Book Now button is hard to see on mobile. Make it stand out more"],
    ["Add a column to the event table",
     "Vendors need to say whether an experience is wheelchair accessible"],
], [(W) / 2, (W) / 2])]

E += [h3("2. One change at a time")]
E += [p("Ask for a single thing, check it, then ask for the next. A list of "
        "eight changes in one message gets you eight half-checked changes, and "
        "when something breaks you will not know which one did it.")]

E += [h3("3. Always ask it to check its own work")]
E += [p("This is the single most valuable habit in this handbook. Add this "
        "sentence to the end of any request that changes something:")]
E += [prompt("After making the change, run the build to make sure nothing is\n"
             "broken, then show me the result in the browser.")]

E += [h3("4. Ask it to explain before it does anything big")]
E += [p("If a request feels large or risky, ask for the plan first:")]
E += [prompt("Do not change anything yet. Explain what you would change,\n"
             "which files, and what could go wrong. Then wait for me.")]

E += [h3("5. Say when you do not understand")]
E += [p("It will happily re-explain at any level. There is no penalty for "
        "asking, and a confused owner approving changes is the real risk.")]
E += [prompt("Explain that again as if I have never seen code before.")]

E += [h2("Prompts worth keeping")]
E += [p("Copy these. They work as written.")]

E += [h3("Starting any working session")]
E += [prompt("Give me a short summary of the current state of the project\n"
             "and anything that needs my attention.")]

E += [h3("Understanding something before you change it")]
E += [prompt("Explain how [the booking process] works, in plain English,\n"
             "step by step. Do not change anything.")]

E += [h3("Checking whether an idea is sensible")]
E += [prompt("I am thinking of [adding a gift voucher feature].\n"
             "Is that a small change or a big one for this project?\n"
             "What would it touch, and what would you recommend?")]

E += [h3("Ending a session safely")]
E += [prompt("Is there anything uncommitted or half-finished right now?\n"
             "If yes, tell me what and whether it is safe to leave it.")]

E += [tip("A note on trust",
          "Claude Code will tell you when it is unsure, and will say when it "
          "has not verified something. Read those caveats - they are the "
          "difference between 'it is done' and 'it should work'. If it says "
          "it could not test something, test it yourself before publishing.")]

E += [PageBreak()]

# ================================================================== PART 3
E += [h1("Part 3 - Everyday tasks, step by step")]
E += [p("Every task below follows the same four beats: <b>ask</b>, "
        "<b>look</b>, <b>approve</b>, <b>publish</b>. Once you have done one, "
        "you have done them all.")]

E += [h2("Task A - Change wording on the public site")]
E += [p("The easiest kind of change, and a good first one to practise on.")]
E += [numbered([
    "Start Claude Code in the project folder.",
    "Describe the change and where it is.",
    "Look at it in your browser.",
    "Publish it.",
])]
E += [prompt("On the home page, the heading says\n"
             "'Things worth doing in Dubai'.\n"
             "Change it to 'Unforgettable experiences in Dubai'.\n"
             "Remember this site is bilingual, so update Arabic too.\n"
             "Then show me the result.")]
E += [warn("Never leave Arabic behind",
           "The public site is fully bilingual. Every piece of text exists "
           "twice. Claude Code knows this, but say it anyway - an English "
           "phrase appearing in the Arabic site looks careless to customers.")]

E += [h2("Task B - Change how something looks")]
E += [prompt("The category headings on the home page feel too small.\n"
             "Make them larger and easier to read, but keep the existing\n"
             "style of the site. Show me before and after.")]
E += [p("For anything visual, ask to see it rather than trusting a "
        "description. Add: <i>show me a screenshot at phone size and at "
        "desktop size</i>.")]

E += [h2("Task C - Add a whole new page")]
E += [prompt("Add a new page to the public site at /gift-cards.\n"
             "It should match the style of the existing About Us page.\n"
             "Content: a heading, two paragraphs I will write later,\n"
             "and a contact button. Add it to the footer links.\n"
             "English and Arabic. Then show it to me.")]
E += [p("Then fill in the words:")]
E += [prompt("On the gift cards page, replace the placeholder text with this:\n"
             "[paste your text here]")]

E += [h2("Task D - Fix something that is broken")]
E += [p("Describe the symptom precisely: what you did, what you expected, "
        "what happened instead. A screenshot helps enormously - you can drag "
        "an image straight into the chat.")]
E += [prompt("On the vendor dashboard, when I click Save on the event form,\n"
             "nothing appears to happen. I expected a confirmation.\n"
             "Investigate and tell me what is wrong before fixing it.")]

E += [h2("Task E - Store a new piece of information")]
E += [p("This is the one genuinely risky category, because it changes the "
        "<b>database</b> - the thing that holds all your real customer and "
        "booking data. It needs one extra manual step that nothing else does.")]
E += [warn("Read this whole section before starting",
           "Database changes are applied by hand and are not automatically "
           "reversible. Do them calmly, one at a time, and never late at night "
           "before a busy weekend.")]
E += [p("Say what you want to store, in business terms:")]
E += [prompt("Vendors need to mark whether an experience is\n"
             "wheelchair accessible, and customers should see that\n"
             "on the event page.\n"
             "Explain the plan first, including the database change.\n"
             "Do not write anything yet.")]
E += [p("Once you are happy with the plan, let it proceed. It will write a "
        "<b>migration</b> - a small file of database instructions. Then:")]
E += [numbered([
    "Claude Code gives you the migration file and tells you it is ready.",
    "Open <b>Supabase</b>, then <b>SQL Editor</b>, then <b>New query</b>.",
    "Paste the contents of the migration file in.",
    "Press <b>Run</b>.",
    "You should see <i>Success. No rows returned.</i> Tell Claude Code it worked.",
    "Only now publish the code, following Part 4.",
])]
E += [warn("Order matters",
           "Always run the database change BEFORE publishing the code that "
           "uses it. The other way round, your live site will break for "
           "however long the gap is.")]
E += [tip("Ask for the safety check",
          "Add this to any database request: <i>explain in plain English what "
          "this migration does, and confirm it cannot delete existing data.</i>")]

E += [h2("Task F - Something you have not thought of")]
E += [p("The pattern generalises. Describe the outcome, ask for a plan, "
        "approve, look, publish.")]
E += [prompt("I want to [describe your idea in your own words].\n"
             "Explain how you would do it and what it affects.\n"
             "Do not change anything yet.")]

E += [PageBreak()]

# ================================================================== PART 4
E += [h1("Part 4 - Publishing changes to the live site")]
E += [p("Changes you make on your computer are invisible to the world until "
        "you publish them. Publishing is one instruction.")]

E += [h2("The safe publishing routine")]
E += step(1, "Check it locally first", [
    prompt("Show me the change in the browser so I can check it\n"
           "before we publish."),
])
E += step(2, "Ask for the publish", [
    prompt("This looks good. Commit the change with a clear message\n"
           "and push it to main."),
    p("<b>Commit</b> means save a labelled snapshot. <b>Push to main</b> means "
      "upload it, which triggers the live update automatically."),
])
E += step(3, "Wait, then check the real site", [
    p("Vercel rebuilds automatically, usually in one to three minutes. Then "
      "open the real address and confirm with your own eyes."),
    prompt("Confirm the change is live and everything still loads."),
])

E += [h2("If you publish something you regret")]
E += [p("Every change is a labelled snapshot, so going back is quick. Do not "
        "panic and do not start deleting things.")]
E += [prompt("The last change I published caused a problem.\n"
             "Undo it and put the site back to how it was before,\n"
             "then explain what went wrong.")]
E += [warn("The one thing that does not simply undo",
           "Code changes reverse easily. <b>Database</b> changes may not - if "
           "a migration deleted a column, the data in it is gone. This is why "
           "Part 3, Task E tells you to ask whether a migration can delete "
           "data before you run it.")]

E += [PageBreak()]

# ================================================================== PART 5
E += [h1("Part 5 - Running the business day to day")]
E += [p("Most days you will not touch code at all. You will use the admin "
        "dashboard, which is a normal website with buttons.")]

E += [h2("Your daily loop, in the admin dashboard")]
E += [table([
    ["Page", "What you do there"],
    ["Dashboard", "Revenue, bookings, views, event and vendor counts at a glance"],
    ["Review queue", "Vendors submit experiences here. You approve or reject them"],
    ["Bookings", "Every booking across every vendor. Search, cancel, check in"],
    ["Vendors", "Create a vendor, set their status and commission rate"],
    ["Users", "Everyone who has signed up. Searchable"],
    ["Admins", "Give or remove staff access"],
], [38 * mm, W - 38 * mm])]

E += [h2("Approving an experience")]
E += [numbered([
    "Open <b>Review queue</b>. Anything waiting is listed.",
    "Click the experience name to open its full details, photos and ticket prices.",
    "Click <b>Approve</b> to publish it, or <b>Reject</b> with a reason.",
    "A rejection reason is sent back to the vendor, so make it specific and useful.",
])]

E += [h2("Adding a vendor")]
E += [p("Go to <b>Vendors</b>, fill in the business name, contact email and "
        "the owner's login email, then click <b>Create vendor</b>.")]
E += [p("You will be shown a <b>temporary password</b> once. Copy it and send "
        "it to the vendor by a safe channel. It is never shown again. They "
        "change it themselves under Settings after signing in.")]

E += [h2("Giving a colleague admin access")]
E += [warn("They must sign up first",
           "The Admins page only promotes an <b>existing</b> account. Ask "
           "your colleague to sign up on the public site first, then enter "
           "that same email on the Admins page. If you skip this you will see "
           "'No account found for that email' - that is the system working "
           "correctly, not a bug.")]

E += [h2("Commission")]
E += [p("Each vendor has a commission rate, set on the Vendors page as a "
        "percentage. It is used to calculate your platform revenue on the "
        "dashboard. Changing it affects future calculations.")]

E += [PageBreak()]

# ================================================================== PART 6
E += [h1("Part 6 - Rules that keep you safe")]
E += [p("Short list. Worth reading twice.")]

E += [h2("Never do these")]
E += [bullets([
    "<b>Never paste a secret key into a chat, email or message.</b> Not to "
    "Claude Code, not to anyone. Keys belong only in the .env.local files on "
    "your computer and in Vercel's settings screen.",
    "<b>Never edit a migration file that has already been run.</b> It is the "
    "record of what your live database looks like. Ask for a new one instead.",
    "<b>Never publish a change you have not looked at.</b>",
    "<b>Never make database changes and code changes live at the same "
    "moment.</b> Database first, always.",
    "<b>Never share the secret key with a vendor</b>, however senior. It "
    "bypasses every security rule in the system.",
])]

E += [h2("Always do these")]
E += [bullets([
    "<b>Look at every change locally before publishing.</b>",
    "<b>Ask Claude Code to run the build</b> before you publish.",
    "<b>Keep the documentation true.</b> When you change how something works, "
    "ask: <i>update the docs to match this change.</i>",
    "<b>Rotate your keys if one is ever shown on screen</b> - in a screenshot, "
    "a screen share, or an error message.",
])]

E += [h2("If a key is ever exposed")]
E += [numbered([
    "In Supabase, go to <b>Settings, API Keys</b> and create a <b>new</b> "
    "secret key.",
    "Put the new key into both Vercel projects (vendor and admin) and "
    "redeploy them.",
    "Test that creating a vendor still works.",
    "Only then delete the old key.",
])]
E += [tip("Why that order",
          "If you delete the old key first and something is wrong with the "
          "new one, you have two broken keys instead of one working one.")]

E += [PageBreak()]
E += [h2("Who to trust with what")]
E += [table([
    ["Person", "Should have"],
    ["You, the owner", "Everything: all four services, admin access"],
    ["Your staff", "Admin dashboard access only"],
    ["A vendor", "Their own vendor dashboard login. Nothing else"],
    ["A developer you hire",
     "GitHub, and their own Supabase and Vercel invitations - never your "
     "personal password"],
], [40 * mm, W - 40 * mm])]

E += [PageBreak()]

# ================================================================== PART 7
E += [h1("Part 7 - When something goes wrong")]
E += [p("Work down this list. Most problems are in the first three rows.")]

E += [table([
    ["What you see", "What it usually means", "What to do"],
    ["'command not found' in the Terminal",
     "A tool did not install, or you are in the wrong folder",
     "Re-run Part 1 Step 2. Check you typed cd into the project folder"],
    ["The local site will not start",
     "Missing or wrong .env.local file",
     "Ask: check my .env.local files are correct and tell me what is missing"],
    ["'Couldn't create the account' when adding a vendor",
     "The secret key in Vercel is wrong, missing, or has a stray space",
     "Re-copy it from Supabase with the copy button. Redeploy"],
    ["'No account found for that email'",
     "Working as designed - that person has not signed up yet",
     "Ask them to sign up on the public site first"],
    ["A dashboard shows all zeros",
     "Usually a data-scoping bug",
     "Ask: the dashboard shows zeros but there is real data. Investigate"],
    ["The live site did not update",
     "The build failed, or it is still building",
     "Check Vercel for a red build. Ask Claude Code to read the error"],
    ["You are signed out unexpectedly",
     "Normal session expiry",
     "Sign in again"],
], [42 * mm, 52 * mm, W - 94 * mm])]

E += [h2("The universal fallback")]
E += [p("If you do not recognise the problem at all, describe it exactly as "
        "you experienced it. Precision beats vocabulary.")]
E += [prompt("Something is wrong. Here is exactly what I did:\n"
             "[what you clicked, in order]\n"
             "Here is what I expected: [what you wanted]\n"
             "Here is what happened instead: [what you saw]\n"
             "Investigate and explain before changing anything.")]

E += [h2("Getting help from a human")]
E += [p("If you ever hire a developer, this gets them productive in an "
        "afternoon rather than a week:")]
E += [prompt("Read CLAUDE.md and everything in docs/, then write me a\n"
             "summary I can send to a developer I am about to hire.")]

E += [PageBreak()]

# ================================================================== PART 8
E += [h1("Part 8 - Plain-English dictionary")]

E += [table([
    ["Word", "What it actually means"],
    ["Repository (repo)", "The folder holding your code and its full history"],
    ["Commit", "A saved snapshot of changes, with a label explaining them"],
    ["Push", "Upload your commits, which triggers the live site to update"],
    ["Main", "The official version of your code. What is live comes from here"],
    ["Deploy / build", "Vercel turning your code into the working website"],
    ["Local / localhost",
     "Running on your own computer only. Nobody else can see it"],
    ["Terminal", "The window where you type commands instead of clicking"],
    ["Migration",
     "A file of database instructions. Run by hand in Supabase, once, in order"],
    ["Database", "Where all real data lives: bookings, customers, events"],
    ["RLS (Row Level Security)",
     "The rules deciding who can see which data. Enforced by the database "
     "itself, not the website, which is why it is trustworthy"],
    ["Environment variable",
     "A setting kept outside the code, such as a password. Lives in "
     ".env.local and in Vercel"],
    ["Secret key",
     "A master password that bypasses all security rules. Server only. "
     "Never share it"],
    ["Publishable key",
     "A key that is safe in a browser, because the security rules still apply"],
    ["Frontend", "The part customers see and click"],
    ["Backend", "The part that stores data and enforces rules"],
    ["API", "How two pieces of software talk to each other"],
    ["Component", "A reusable piece of the interface, such as a button"],
    ["Build error",
     "The code did not compile. The site keeps running on the last good "
     "version, so this is safe"],
], [42 * mm, W - 42 * mm])]

E += [PageBreak()]

# ============================================================ QUICK REFERENCE
E += [h1("Quick reference")]
E += [p("Print this page and keep it near your desk.")]

E += [h2("Starting work")]
E += [terminal("cd ~/Documents/tbdxb\nclaude")]

E += [h2("The five prompts you will use most")]
E += [prompt("Give me a short summary of the current state of the project\n"
             "and anything that needs my attention.", "1. STARTING A SESSION")]
E += [prompt("Explain how [X] works in plain English. Do not change anything.",
             "2. UNDERSTANDING SOMETHING")]
E += [prompt("[Describe your change]. Then show me the result\n"
             "in the browser before we publish.", "3. MAKING A CHANGE")]
E += [prompt("This looks good. Commit it with a clear message\n"
             "and push it to main.", "4. PUBLISHING")]
E += [prompt("The last change caused a problem. Undo it and put the site\n"
             "back to how it was, then explain what went wrong.",
             "5. UNDOING A MISTAKE")]

E += [h2("The three golden rules")]
E += [numbered([
    "<b>Look before you publish.</b> Always view the change locally first.",
    "<b>Database first, code second.</b> Run the migration in Supabase "
    "before publishing the code that needs it.",
    "<b>Keys never go in a chat.</b> Only in .env.local and Vercel settings.",
])]

E += [h2("Where things live")]
E += [table([
    ["Need to...", "Go to"],
    ["Approve an experience", "admin-tbdxb.vercel.app, Review queue"],
    ["See all bookings", "admin-tbdxb.vercel.app, Bookings"],
    ["Add a vendor", "admin-tbdxb.vercel.app, Vendors"],
    ["Look at the data directly", "supabase.com, Table Editor"],
    ["Run a migration", "supabase.com, SQL Editor"],
    ["Check if a deploy worked", "vercel.com, your project, Deployments"],
    ["Change a secret key", "vercel.com, Settings, Environment Variables"],
], [55 * mm, W - 55 * mm])]

E += [Spacer(1, 8)]
E += [small("This handbook describes the project as handed over. As you change "
            "the project, ask Claude Code to keep docs/ up to date - the "
            "technical reference it reads every session. This PDF is the "
            "human-facing companion to those documents.")]

doc.build(E)
print("Wrote " + OUT)
