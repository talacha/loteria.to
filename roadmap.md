# Lotería de los Pueblos: roadmap

The order is **single-device caller first** (works anywhere, no network), **then phones join**, **then AI**. Task IDs refer to [tasks.md](tasks.md).

## M0: Foundations
**Goal:** an installable PWA on Vercel with CI, translations and design tokens. This can be shared with Tianguis if both are built.
**Tasks:** LT-001 to LT-005
**Exit criteria:** the app installs, opens offline, switches between the five locales, and runs CI green on every PR.

## M1: Deck, tablas and the single-device cantor
**Goal:** one device calls a full game for players using printed tablas, completely offline.
**Tasks:** LT-010 to LT-017
**Exit criteria:**
- The 54-card deck renders with placeholder art.
- Tablas are deterministic from a seed: same seed, same boards.
- Printed tablas come out as a PDF of 1, 4 or 30 boards with check codes.
- The cantor screen auto-calls at an adjustable speed and can pause or go back.
- A typed check code verifies a claim correctly.
- All of the above works in airplane mode.

## M2: Content, art, audio and review
**Goal:** real names, verses, riddles and art, with recorded audio in at least one Indigenous language.
**Tasks:** LT-020 to LT-026
**Exit criteria:**
- All 54 cards have Spanish and English names, verses and riddles that a person has reviewed.
- One Indigenous language has all 54 names **approved by a native speaker** and recorded.
- The art is original or properly licensed, with an attribution page.
- Unreviewed content shows the "en revisión" badge.

## M3: Phones join the room
**Goal:** up to 40 phones join from a QR code, mark their own tablas, and claim lotería. The host checks every claim.
**Tasks:** LT-030 to LT-036
**Exit criteria:**
- Joining takes under 30 s at the median.
- Each call reaches 40 clients in under 500 ms at p95.
- A host reload, or a new host taking over, keeps the round going.
- Fake claims are rejected, and paper and phone players can mix in the same round.

## M4: Modes and AI
**Goal:** Escucha, Adivinanza and Aprende modes, Jev's hint and pacing, and Claude's cantor banter, all with offline fallbacks.
**Tasks:** LT-040 to LT-047
**Exit criteria:**
- A "Pista" hint returns in under 800 ms online and under 30 ms offline, labeled with the engine that produced it.
- Pacing adapts in a scripted test where players miss calls.
- The cantor's verses use only approved Indigenous names.
- With the network off, everything degrades quietly with no errors.

## ── Hackathon cut ──
For a build day, ship M0 and M1, the M3 core (LT-030 to LT-034) and the M4 hint (LT-043 to LT-044). Use Spanish, English and **one** reviewed Indigenous language, with OpenMoji placeholder art. The demo script is in LT-061.

## M5: Accessibility and inclusion pass
**Tasks:** LT-050 to LT-054
**Exit criteria:**
- WCAG 2.2 AA and zero axe violations.
- A full round with a screen reader.
- An auto-mark assist.
- High-contrast and large-print tablas, both on screen and printed.
- The gender-neutral copy lint passes.
- A caption track for every call.

## M6: Launch
**Tasks:** LT-060 to LT-064
**Exit criteria:**
- A classroom pilot with 20 or more players runs smoothly.
- A teacher guide in Spanish and English.
- The north-star dashboard is live.
- The consent and credit records are complete.

## Dependencies and risks
| Risk | Impact | Mitigation |
|---|---|---|
| Original art for 54 cards takes time | No polished deck for the demo | Use OpenMoji (CC BY-SA 4.0) placeholders, then commission an Indigenous illustrator (budget line in LT-023). |
| Audio recordings are slow to collect | Calls in a language without audio | Text and IPA are shown with an "audio pendiente" badge. Never use synthetic speech for Indigenous languages. |
| Supabase free-tier limits (200 concurrent connections, 2M messages a month) | Large events throttled | Only the host broadcasts calls, and clients send only claims and marks. One round of 40 players is about 54 + 40 messages. |
| Some classroom networks block WebSockets | Phones can't join | Paper mode is always available, and the host's QR screen shows a "no network? print tablas" button. |
| Cultural missteps in card choice | Harm and loss of trust | A community review of the card list happens before any art is made (LT-020). |
| Trademark confusion with the classic lotería | Legal risk | Original names and art, and the phrase "inspirada en la lotería tradicional". |

## Timeline guide (relative)
- **Build day:** M0, M1, M3 core, the M4 hint, then the demo.
- **Weeks 1–2:** M2 content and audio, the rest of M4, M5.
- **Week 3:** the classroom pilot and launch (M6).
