# Lotería de los Pueblos

> **A whole classroom, plaza or family table can join a lotería round from one QR code in under 30 seconds, and every player hears the cards called in Nahuatl, Maya, Quechua, Spanish or English. No phone is required to play.**

Lotería is the picture-bingo that nearly everyone in Mexico grew up with. A caller (*el cantor*) draws a card, recites a short verse, and players mark the matching picture on their *tabla* with a bean. Lotería de los Pueblos keeps that ritual and makes it inclusive:

- An original deck of 54 cards drawn from the peoples, land and foods of Mesoamerica and the Andes.
- Cards are called in five languages: Nahuatl (`nah`), Yucatec Maya (`yua`), Quechua (`quz`), Spanish (`es`) and English (`en`).
- Players join from a phone, a shared tablet or a printed paper board.

*Inspirada en la lotería tradicional.* This is not the classic Don Clemente deck, and it doesn't reuse its art or card names.

## Project status

**Early build.** The repo holds the product docs, the [architecture plan](docs/ARCHITECTURE.md) and a placeholder landing page built with Vite, React and TypeScript. The game itself (deck, tablas, cantor, rooms) isn't built yet; this README describes what is being built, and the [roadmap](#roadmap) shows the order.

| Doc | What's in it |
|---|---|
| [north-star.md](north-star.md) | Product vision, pillars, metrics and rules v1 |
| [roadmap.md](roadmap.md) | Milestones M0 to M6 and their exit criteria |
| [tasks.md](tasks.md) | Task-by-task build plan (`LT-xxx` IDs) |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, services, env vars and dependencies |

## Who it's for

- **Classrooms and community centres:** one projector or TV as the caller, kids on paper boards or phones.
- **Families with mixed languages:** a grandparent can call in Maya while the kids match pictures.
- **Heritage learners:** *Escucha* mode calls only the word, with no picture, so players learn by ear.
- **Hackathon judges:** scan a QR code and play a 2-minute round.

## Experience pillars

1. **Everyone can join.** Phones, printed boards or a shared tablet, with no accounts and no app store.
2. **Hear the language.** Calls are recorded by native speakers, and the cantor can call in any of the five languages.
3. **Works with no connection.** A single device can be the caller for a room full of paper boards, with no network at all.
4. **No stereotypes and no gender assumptions.** The deck shows animals, plants, food, places, tools and sky, not figures like *La Dama*, *El Valiente* or *El Negrito*. Players are names and glyphs, and pronouns are optional.
5. **Honest about language.** Every Indigenous-language word and recording is reviewed before it ships, and anything unreviewed is visibly labeled.
6. **Gentle for kids.** A false "¡Lotería!" gets a friendly "¡Casi!", not a penalty. Speeds are adjustable, and auto-mark is available as an accessibility aid.

## How to play (rules v1)

- **The deck:** 54 original cards. Each card has a number and an illustration, its name in all five languages, a short *verso* (the caller's rhyme) in Spanish and English, a riddle, and recorded audio in each reviewed language.
- **The tablas:** 4×4 grids of 16 cards, generated from `roomSeed + seatId`, so the cantor can check any claim without being sent the board. Paper tablas print with a short code the cantor types in to check a claim.
- **The cantor:** the host device shows the card big, plays the audio in the call language and shows the verse. Calls advance automatically every 6, 10 or 15 seconds, or by hand.
- **Call language:** one language per round, or *rotating*, where each card is called in the next language.
- **Modes:**
  - **Clásica:** picture, name and verse.
  - **Escucha:** audio only; the picture is revealed after a delay.
  - **Adivinanza:** only the riddle is read; the picture is revealed after a delay.
  - **Aprende:** each player's tabla labels show their own language while the call is in another.
- **Win patterns**, chosen by the host: a line, a column, a diagonal, four corners, the 2×2 centre (*centrito*) or a full board (*llena*).
- **Claiming:** a player taps "¡Lotería!" and the host checks that every marked card in the pattern has been called. A valid claim gets a celebration and the round ends (or continues for 2nd place). An invalid one gets "¡Casi!" and shows the card that hasn't been called yet.

## Where AI fits

AI is a supporting act. The game is fully playable with no AI at all, and every AI feature has an offline fallback.

| Job | Online | Offline |
|---|---|---|
| **"Pista" hint:** which of my cards was just called? | Jev `Choice` over the player's 16 cards, with a confidence meter | Tag matching on the card's keywords and category |
| **Pacing:** speed up or slow down the calls | Jev `Choice` of {slower, same, faster} from recent mark times | Slow down when more than 30% of players missed the last 2 calls |
| **Cantor banter:** a fresh verse or cultural note | Claude, in Spanish or English, quoting only reviewed card names | The bundled, reviewed verse |
| **Deck content drafting** | Claude drafts Spanish and English verses and riddles for people to review | n/a |

There is no live machine-generated Indigenous-language text, and no synthetic speech for Indigenous languages.

## Tech stack

**In the repo today:** Vite, React 19 and TypeScript, built with pnpm on Node 22 and deployed to Vercel.

**Planned** (see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design):

- **App:** an installable PWA on Vercel Hobby.
- **Multiplayer:** Supabase Realtime broadcast rooms, sized for a classroom of up to 40 players. Only the host broadcasts calls; clients send claims and marks.
- **Offline:** IndexedDB and Workbox (`vite-plugin-pwa`), with the app shell, card art and reviewed audio precached.
- **Server functions:** `/api/pista` (hint), `/api/cantor` (banter), `/api/metrics` and `/api/review-auth` on Vercel.
- **Printing:** paper tablas are generated in the browser with `pdf-lib`.
- **Tooling:** ESLint, Prettier, Vitest, Playwright, i18next, and a single `pnpm check` script run in CI on every PR.

## Getting started

You need Node 22 (see `.nvmrc`) and pnpm 10 (`corepack enable` picks up the version pinned in `package.json`).

```sh
pnpm install
pnpm dev        # start the dev server
```

| Script | What it does |
|---|---|
| `pnpm dev` | Vite dev server with hot reload |
| `pnpm build` | Type-check (`tsc -b`) and build to `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | Type-check only |
| `pnpm check:services` | Read-only connectivity check for Supabase, Upstash Redis and Anthropic. It reads `.env.local`, prints pass, fail or "not configured" per service, and never prints values |

### Environment variables

The landing page needs none. The names the game will use are listed in [`.env.example`](.env.example) with empty values, and explained in section 10 of [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Real values live in the Vercel project settings:

```sh
vercel link && vercel env pull .env.local
pnpm check:services
```

Anything prefixed `VITE_` is compiled into the public bundle, so a secret never gets that prefix.

### Deployment

[`vercel.json`](vercel.json) pins the Vercel build: `pnpm install --frozen-lockfile`, then `pnpm build`, serving `dist/`. The plan is for every PR to get a preview URL and for `main` to deploy to production.

### Repository layout

```
index.html               page shell
src/main.tsx             entry point
src/Landing.tsx          placeholder landing page (and landing.css)
public/                  static files (favicon)
scripts/                 check-services.mjs
docs/ARCHITECTURE.md     architecture and dependencies
north-star.md, roadmap.md, tasks.md   product docs
```

The planned layout as the game lands (from [tasks.md](tasks.md)):

```
src/
  engine/   pure deck, seeded shuffle, tabla and claim logic
  app/      UI
  net/      realtime rooms
  ai/       hint and pacing providers (online + offline)
  content/  cards.json, translations, credits
  print/    PDF tablas
api/        Vercel functions
```

## Roadmap

The order is **single-device caller first** (works anywhere, no network), **then phones join**, **then AI**.

| Milestone | Goal |
|---|---|
| **M0 Foundations** | Installable PWA on Vercel with CI, five locales and design tokens |
| **M1 Single-device cantor** | 54-card deck, seeded tablas, printable PDFs with check codes, an offline caller |
| **M2 Content and review** | Reviewed names, verses, riddles and art; one Indigenous language approved by a native speaker and recorded |
| **M3 Phones join** | Up to 40 phones join from a QR code, mark tablas and claim; paper and phone players mix |
| **M4 Modes and AI** | Escucha, Adivinanza and Aprende modes, the Pista hint, adaptive pacing and cantor banter |
| **M5 Accessibility** | WCAG 2.2 AA, screen-reader play, auto-mark, high-contrast and large-print tablas, captions |
| **M6 Launch** | Classroom pilot, teacher guide in Spanish and English, north-star dashboard |

## Measuring success

The north-star metric is **Indigenous-language calls matched**: cards players correctly marked after a call in Nahuatl, Maya or Quechua, per session (target ≥ 10 at launch). Supporting targets include a median under 30 s from scanning the QR code to holding a tabla, and 100% offline play in single-device paper mode.

Metrics are anonymous counters only, and there is an opt-out switch.

## Non-goals

- No money, prizes, wagering or betting language. The beans are just beans.
- No reuse of the traditional Don Clemente card art or names.
- No live machine-generated Indigenous-language text.
- No free-text chat.

## Contributing language and cultural content

Indigenous-language names and recordings ship only after review by a native speaker. Content that hasn't been reviewed yet is shown with an **"en revisión"** badge, and a call without approved audio shows its text with an **"audio pendiente"** badge rather than synthetic speech. The card list itself goes through community review before any art is commissioned, and every recording and illustration is credited.

If you'd like to help with vocabulary, recordings, illustration or review, please open an issue describing your language or skill. Code changes go through pull requests against `main`.

## License

No license has been chosen yet.
