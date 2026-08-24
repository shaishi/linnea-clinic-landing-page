# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: static HTML/CSS/JS built with Vite, GSAP (scroll/reveal animation), Lenis (smooth scroll). Deploys to GitHub Pages via `gh-pages`. Redesign continues on this stack.

## Users

Primary users are prospective aesthetic-medicine patients in Israel (Jerusalem area), researching injectable and skin treatments (Botox, fillers, skin rejuvenation, facial contouring) and deciding which clinic to book a consultation with. The site is bilingual Hebrew/English with full RTL support for Hebrew, which is the primary language for the local audience.

## Product Purpose

Linnéa Clinic's landing page markets and books consultations for an aesthetic-medicine practice. Success is a visitor trusting the clinic's medical credibility and taste, then booking a consultation (via the booking modal/form) or reaching out via WhatsApp/social.

## Positioning

Linnéa combines three claims a generic aesthetics clinic in Israel does not make together: (1) medically-credentialed practitioners — two doctors, Dr. Shmuel Shai Shiloh DMD, MSc and Dr. Yasmine Khoury DMD, MSc; (2) a boutique, unhurried, high-touch client experience rather than a high-volume med-spa; (3) an evidence-based, advanced-technique treatment menu (e.g. Polynucleotides, Sculptra, Radiesse, Skin Boosters, non-surgical rhinoplasty) rather than a generic Botox-and-filler list. The redesign should carry all three in tone and structure, not just one.

## Operating Context

Real clinic located at Herzl Blvd 116, Jerusalem, with a Google Maps embed on the site. Booking flows through an in-page modal form that posts to formsubmit.co (currently pointed at a placeholder email — must be swapped to the clinic's real address before launch). Footer carries WhatsApp/Facebook/Instagram links (currently placeholders) and an Accessibility Statement modal, which reflects the Israeli legal requirement (תקנות נגישות) for a visible accessibility statement — this must be preserved in the redesign, not dropped.

## Capabilities and Constraints

- Full Hebrew/English toggle with RTL layout flip for Hebrew must be preserved and re-themed, not removed.
- Per-treatment detail modals exist for individual treatments (e.g. Full Face Restoration, PN, Sculptra) alongside the treatments grid; category grouping (Skin Rejuvenation / Facial Contouring / Botox & Neuromodulators) is current information architecture, open to restructuring.
- Sections currently present: Header/Nav, Hero, About (two doctor bios), Treatments (grid + category detail + per-treatment modals), Before/After "Transformations", Articles/blog teasers, Reviews, Location/Map, Contact/Footer, Booking modal, Accessibility Statement modal.
- Content status: reviews, before/after photography, and doctor photography on the current site are placeholder/AI-generated stand-ins, not real client material — explicitly approved for replacement or regeneration as part of this redesign. Doctor names, clinic address, and treatment names are real and must be preserved as fact.
- Scope for this redesign is unrestricted: both the visual world (palette, type, layout — moving away from the current teal/cream "premium spa" look toward a clean Nordic-Japanese direction with a Korean-blue palette) and the content architecture (section set, order, grouping) are open to change.

## Brand Commitments

- Clinic name "Linnéa" (accented é) is fixed.
- Doctor names and credentials (Dr. Shmuel Shai Shiloh DMD, MSc; Dr. Yasmine Khoury DMD, MSc) are fixed facts, not open to invention.
- Real address: Herzl Blvd 116, Jerusalem.
- Existing logo treatment (text-based wordmark with accent mark) is not a locked constraint — new-work may redesign it as part of the new visual world.

## Evidence on Hand

- Treatment list (Botox/neuromodulators, fillers, Sculptra, Radiesse, Skin Boosters, PN, acne-scar treatment, lip enhancement, jawline/chin sculpting, non-surgical rhinoplasty, tear trough filler, full face restoration) is real and must be preserved.
- Reviews, before/after photos, and doctor portrait photography are placeholders approved for regeneration — do not present regenerated photography or reviews as real patient documentation/testimonials in copy; keep them clearly illustrative or replace with clean generated imagery appropriate to a medical site, per craft-floor guidance on fabricated evidence.
- No real testimonial text, press mentions, or case-study data exists on hand; do not fabricate specific patient claims, numbers, or quotes.

## Product Principles

1. Medical credibility first: two credentialed doctors and an evidence-based treatment menu are the trust anchors — the design should read as clinical-premium, not generic spa-luxury.
2. Boutique restraint over volume: layout and pacing should feel unhurried and considered, avoiding a crowded, sales-heavy grid.
3. Bilingual parity: Hebrew (RTL) is the primary experience for the target audience, not a secondary translation bolted onto an English-first design.
4. Booking is the conversion point: navigation, hero, and treatment sections should consistently route toward the consultation booking flow.

## Accessibility & Inclusion

Israeli legal accessibility statement (נגישות) is a required, standing constraint — the redesign must keep a visible accessibility statement and should meet WCAG-appropriate contrast/interaction standards given the site serves a general medical-consumer audience.
