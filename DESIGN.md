# Design — Linnéa

<!-- impeccable:design-schema 1 -->

## World

Nordic restraint × Korean clinical-blue, brief-pinned by the client (references: eternoskin.com, jacques-cie.com) and grounded in the client's own logo system (Claude Design canvas, DM Serif Display + Jost). Replaces the previous teal/cream "spa luxury" identity and its card-grid, modal-heavy treatments UI.

## Color

Committed strategy: a deep ink-blue carries full-bleed panels (hero visual overlay, Doctors, Visit, preloader, cookie banner), alternating with warm porcelain paper for reading sections. Powder/pale blue tints add rhythm without new hue families.

- `--paper: #F7F5F0` / `--paper-deep: #EFEBE2` — ground
- `--ink: #1B2226` / `--ink-soft: #4D5A62` / `--ink-faint: #8B969C` — text on paper
- `--blue-deep: #12303F` / `--blue-deep-alt: #0D2530` — committed panels, primary CTA
- `--blue-mid: #4E7C93` / `--blue-link: #2B5C74` — accents, links
- `--blue-soft: #C9DDE3` / `--blue-pale: #E4EEF1` — section tints (Transformations bg)
- `--on-blue: #F3F7F8` / `--on-blue-muted: #AECAD3` — text on blue-deep panels

## Type

- **Wordmark only** ("Linnéa", always Latin, never translated): `--font-wordmark: 'DM Serif Display'` (regular, non-italic) + `--font-wordmark-tag: 'Jost'` (500, uppercase, wide tracking) for the "Aesthetic Medicine" tag. Sourced from the client's own Claude Design logo canvas — do not substitute.
- **Body/UI (bilingual Hebrew+Latin)**: `--font-display: 'Rubik'` for headings/buttons/labels, `--font-body: 'Assistant'` for paragraphs/forms. Chosen because both ship matched Hebrew+Latin glyphs in one family — required for the RTL/LTR toggle to stay coherent. DM Serif Display/Jost have no Hebrew coverage and must never be used for translatable copy.

## Logo system

Client-provided (Claude Design canvas `d87da930…`, file "Linnéa - Logo.html"): 9-concept exploration (Monogram, Wordmark Framed/Bare, Lockup, Stacked, Botanical mark). Allocation used on this site:

- **Navbar / footer**: bare wordmark, "Linnéa" only (`.brand-logo` / `.brand-word`) — no icon, no tag (client rejected the botanical-icon-in-navbar treatment as illegible at that scale).
- **Preloader**: Bare Stacked Wordmark — "Linnéa" + "Aesthetic Medicine" tag, centered, on `--blue-deep`.
- **Favicon**: Monogram — framed square, serif "L" glyph (Georgia fallback; data-URI SVGs can't load web fonts), `--ink` on `--paper`.
- The botanical "twinflower" (*Linnaea borealis*) mark exists in the client's canvas but is not used on the live site; available for future print/packaging use if wanted.

## Layout & components

- **Hero**: split ~58/42 (photo / panel) ≥900px, stacked below 900px. No eyebrow/kicker label — refused per craft floor.
- **Treatments**: accordion index (`.t-category` → `.t-item`), not cards. Replaced the old 3-category carousel + 12 near-identical per-treatment modals. Category and item both toggle via `aria-expanded` + CSS grid-rows trick (no JS height calc).
- **Doctors / Visit**: full-bleed `--blue-deep` panels, hairline dividers, no card chrome.
- **Reviews**: live Google Reviews via an Elfsight embed (`elfsight-app-bc47ec3c-…`), replacing 3 fabricated static reviews. The widget carries its own internal styling (not reskinned to match the site tokens — outside CSS's reach without Elfsight's paid customization).
- **Motion**: single reveal grammar (fade + 8px rise, `power3.out`) via GSAP ScrollTrigger + Lenis smooth scroll (both carried over from the incumbent build). Custom cursor and magnetic-button effects from the old build were removed — they read as busy/gimmicky against the Nordic-restraint direction, not as this world's signature motion.

## Real-world constraints carried over

- Address: **Menachem Begin 150, Tel Aviv** (schema.org data, meta tags, footer, Visit section, map embed, legal-modal address lines, jurisdiction clause).
- Booking form posts to Web3Forms (existing integration, access key unchanged).
- Accessibility statement / Privacy Policy / Terms of Use legal text (Hebrew + English, Israeli law citations) preserved verbatim — do not edit without legal sign-off.
- Placeholder facts still on the page, flagged for the client to replace: phone `050-123-4567`, email `linneaclinic@gmail.com`, Google review "place ID" link, and most treatment/doctor photography (existing AI-generated placeholders, not real clinic photos).

## Known follow-ups (not yet done)

- `article-botox.html`, `article-fillers.html`, `article-scientific.html` still carry the old teal/cream visual system — only `index.html` was redesigned in this pass.
- No image-generation tool was available this session, so photography is reused/reassigned from the existing placeholder set rather than newly produced — swap for real clinic photography when available.
- Mobile-viewport verification for this session was inconclusive due to a browser-tooling viewport-emulation inconsistency (CDP `innerWidth` desync); the CSS uses standard, unexotic responsive patterns (`grid-template-columns: 1fr` under 900px, off-canvas nav, etc.) but a real-device pass is recommended before shipping.
