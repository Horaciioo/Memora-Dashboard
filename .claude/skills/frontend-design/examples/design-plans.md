# Worked design plans

Three finished first-pass plans, in the format the skill's "Process" section asks for (Color / Type /
Layout / Signature), for three different briefs. Use them to calibrate what a **non-generic** plan
looks like before writing your own — not to copy the tokens themselves onto an unrelated brief.

Each one deliberately avoids the three AI-default looks named in `SKILL.md` (warm cream + high-contrast
serif + terracotta; near-black + one acid accent; broadsheet hairlines). Notice that the thing which
makes each plan distinctive is a choice pulled from the subject's own world, not a swapped-in palette.

---

## Brief 1 — a small-batch mechanical-watch workshop selling direct to collectors

**Subject, audience, job**: a two-person atelier that services and sells hand-assembled watches;
audience is collectors who already own three watches and read movement specs for fun; the page's job
is to make a five-figure purchase feel like a studio visit, not a checkout flow.

**Color** — `#12130f` graphite case-back, `#e8e3d6` brushed-steel paper, `#8a6b3a` warm brass (not gold
leaf — brushed, slightly desaturated), `#c65a3a` a single lume-orange accent used only on the seconds
indicator and hover states, `#4a5a4f` a muted patina green for "in stock" states.

**Type** — display: **Fraunces** at a very high optical size setting, italic, used only for the piece
names ("Ref. 04 — Meridian"); body: **Söhne** (or **General Sans** if licensing Söhne is out of reach)
for everything else, tabular figures on for all specs. The contrast is deliberate: a wet, humanist
display face against a dry, engineered body face — the same tension as a hand-finished movement in a
machined case.

**Layout concept** — no hero banner. The page opens on a single watch rendered large enough that the
crown and case edge bleed off-screen, with specs running down the right rail like a service ticket, not
a bullet list.

```
┌───────────────────────────────────────────┬────────────┐
│                                             │ REF. 04    │
│                                             │ Meridian   │
│         [ watch bleeds off both edges ]     │            │
│                                             │ ⌀ 38mm     │
│                                             │ cal. 4130  │
│                                             │ 42h reserve│
│                                             │            │
│                                             │ [ enquire ]│
└───────────────────────────────────────────┴────────────┘
```

**Signature** — a running "service log" in the footer of every product page: a monospace ticker of
real timestamped micro-events ("Regulated to +2s/day — 04:12", "Case brushed — 03:58") that makes the
brass hairline under the fold feel like it's still ticking. It only works because the subject is
literally mechanical timekeeping — it would be a gimmick anywhere else.

**Why this isn't a default**: no terracotta, no acid accent, no broadsheet grid. The tension comes from
pairing a wet display face against a dry one, and the signature comes from the mechanism itself, not a
decorative device bolted on.

---

## Brief 2 — a municipal library's digital-literacy program for adults

**Subject, audience, job**: a public library's free evening classes teaching seniors and new immigrants
to use email, video calls, and government portals; audience is first-time or anxious computer users;
the page's job is to make signing up feel low-stakes and make the next class time obvious in five
seconds.

**Color** — `#fdfaf4` warm paper (not the AI-default cream — slightly yellower, closer to library card
stock), `#1d4d3e` deep reading-room green, `#c9432b` a warm red used only for "starts today" and
deadlines, `#3a3530` near-black ink for body text, `#e3ded0` a card-catalog tan for panel fills.

**Type** — display: **Newsreader** at regular (not light) weight — a book-adjacent serif, but set at
sizes and weights a 70-year-old can read without glasses; body: **Atkinson Hyperlegible**, chosen
specifically for its accessibility research pedigree, not as a neutral default — it is the actual right
tool for this audience. Minimum body size 18px, line-height 1.6.

**Layout concept** — a single-column "index card" flow, one class per printed-card-sized block, stacked
vertically, no sidebar, no multi-column grid — the target user does not reliably scroll horizontally or
parse a dashboard.

```
┌─────────────────────────────┐
│  TUESDAYS · 6:00 PM          │
│  Email & Video Calls          │
│  Room 204 · Bring your phone  │
│  [  Reserve a seat  ]         │
├─────────────────────────────┤
│  THURSDAYS · 6:00 PM          │
│  Online Government Forms      │
│  Room 204 · Laptops provided  │
│  [  Reserve a seat  ]         │
└─────────────────────────────┘
```

**Signature** — every card carries a real library due-date stamp graphic (rendered in CSS, not a
scanned image) instead of an icon, reinforcing "this is your library" without saying it. The stamp
rotates a few degrees per card so it reads as physically stamped, not templated.

**Why this isn't a default**: the type choice is driven by accessibility research for the actual
audience, not aesthetics first — a legitimate reason to override "distinctive" with "correct." The
single-column index-card layout is a constraint decision, not a trend.

---

## Brief 3 — a queer indie record label's next vinyl release

**Subject, audience, job**: a two-release-a-year label putting out one shoegaze record; audience is
people who already follow the label on Bandcamp; the page's job is a single release page that sells
pre-orders and makes the record feel like an event, not a product listing.

**Color** — `#0b0b0d` near-black (used deliberately, not as the generic "dark mode" default — it's the
record's own sleeve black), `#f2eee6` bone white, `#ff4d8f` a hot pink pulled directly from the cover
art, used exactly once per viewport, never as a background wash, `#6b6f76` cold grey for metadata.

**Type** — display: **Redaction** or **PP Editorial New** (an unstable, slightly broken-looking serif)
set huge, tracked tight, for the release title only; body/meta: **JetBrains Mono** for tracklist,
credits, and catalog number — treating the metadata like a pressing plant's paperwork, not marketing
copy.

**Layout concept** — the cover art is the entire first viewport at native aspect ratio, no crop, no
gradient overlay, no headline stacked on top of it. Title and pre-order sit in the second viewport as
you scroll, deliberately withholding the CTA.

```
┌───────────────────────────────┐
│                                 │
│      [ cover art, full-bleed ]  │
│                                 │
└───────────────────────────────┘
┌───────────────────────────────┐
│ LABEL·004                       │
│ Cassette Weather                │
│ LP · 180g · Bone / Splatter     │
│ [ Pre-order — ships March ]     │
└───────────────────────────────┘
```

**Signature** — the pink accent only ever appears as a single underline beneath the currently-playing
track in an embedded player, so the one moment of color on the page is tied to an action (listening),
not decoration.

**Why this isn't a default**: black is chosen because it's the record's own color, not because
near-black-plus-one-accent is a safe AI look — the plan states that reasoning explicitly, which is the
test this skill asks you to run against your own plans.
