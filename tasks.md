# Lotería de los Pueblos: tasks

Each task is sized so one Claude Code session can complete it in one PR. Every task lists what it depends on, what to build, and how to know it's done.

**Conventions**
- **Tooling:** the same as Tianguis: pnpm, TypeScript `strict`, Vitest, Playwright, and `pnpm check` on every PR.
- **Repo layout:** `src/engine/` holds the pure deck, tabla and claim logic. `src/app/` is the UI, `src/net/` is the rooms, `src/ai/` holds the hint and pacing providers, `src/print/` produces the PDFs, and `api/` holds the Vercel functions.
- **Building both games?** Do TG-001 to TG-006 once in a monorepo with `packages/ui`, `packages/i18n` and `packages/net`, and skip LT-001 to LT-005.

---

## M0: Foundations

### LT-001 Scaffold the repo, CI and Vercel
- **Depends on:** nothing
- **Do:**
  - Vite with the react-ts template, ESLint, Prettier, Vitest and Playwright, and a `pnpm check` script.
  - Path aliases: `@engine`, `@app`, `@net`, `@ai`, `@content`, `@print`.
  - A Vercel Hobby project with preview deploys, and a GitHub Actions workflow running `pnpm check` plus a Playwright smoke test.
- **Done when:** a PR gets a preview URL and green CI.

### LT-002 Installable PWA with precached audio
- **Depends on:** LT-001
- **Do:**
  - Add `vite-plugin-pwa` with the name "Lotería de los Pueblos" and short_name "Lotería".
  - Precache the app shell, `src/content/**` and **all card art**.
  - Audio, about 54 cards × the reviewed languages at roughly 15 KB each in Opus, is precached once that language is enabled. The total stays under 10 MB.
  - Use `NetworkOnly` for `/api/*`.
- **Done when:** after one online visit, airplane mode can run a whole cantor game with audio.

### LT-003 Translations
- **Depends on:** LT-001
- **Do:**
  - i18next with ICU and catalogs for `es`, `en`, `nah`, `yua` and `quz`. The **UI** language, the **call** language and the **tabla label** language are three separate settings.
  - Add the `i18n-check` script: missing keys, placeholder mismatches and gendered forms. It can be shared with TG-004 and TG-052.
- **Done when:** the three language settings change independently.

### LT-004 Design tokens and components
- **Depends on:** LT-001
- **Do:**
  - Self-hosted Noto Sans.
  - Components: `Button`, `Sheet`, `Toast`, `Badge` (including "en revisión" and "audio pendiente"), `CardFace` (art, number and name) and `TablaGrid`.
  - A "festive" theme in papel-picado colors, a dark theme and a high-contrast theme, all AA-checked.
- **Done when:** the kitchen-sink route passes axe.

### LT-005 Anonymous telemetry
- **Depends on:** LT-001
- **Do:**
  - The same queue-and-flush design as TG-006.
  - Events: `round_start{mode, callLang, players}`, `card_matched{callLang}` (aggregated by the host, one event per call), `claim{valid}`, `round_end` and `print{boards}`.
  - The opt-out toggle is on by default.
- **Done when:** events reach `/api/metrics`, and the toggle stops them.

---

## M1: Deck, tablas and the single-device cantor

### LT-010 Deck schema and placeholder deck
- **Depends on:** LT-003
- **Do:**
  - Create `src/content/cards.json` with 54 entries of the shape `{ n, id, category, art, tags[], names:{lang:{text, ipa?, status, source?, audio?}}, verso:{es,en}, riddle:{es,en}, noteId? }`.
  - Categories, 54 cards in total:
    - **animals (14):** ajolote, jaguar, quetzal, colibrí, llama, cóndor, tortuga, venado, mariposa monarca, xoloitzcuintle, tecolote, serpiente, guacamaya, vicuña
    - **plants and food (12):** maíz, cacao, nopal, papa, chile, aguacate, cempasúchil, calabaza, frijol, quinua, maguey, vainilla
    - **sky and land (10):** sol, luna, estrella, lluvia, volcán, río, mar, cenote, nube, ceiba
    - **made by hand (12):** metate, comal, huéhuetl (tambor), quena, telar, petate, olla, canasta, red de pesca, huipil, chakitaqlla (arado andino), trompo
    - **places and gatherings (6):** milpa, mercado, pirámide, plaza, temazcal, apacheta
  - Validate the file with a zod schema in CI. Placeholder art uses OpenMoji SVGs, attributed in `credits.json`, with category-colored backgrounds where no emoji exists.
  - **The card list is a draft and needs community review in LT-020 before any art is commissioned.**
- **Done when:** the schema passes, and the `/deck` route shows all 54 cards.

### LT-011 Seeded random numbers and shuffling
- **Depends on:** LT-010
- **Do:** in `src/engine/rng.ts`, mulberry32 plus a Fisher–Yates shuffle. `deckOrder(roomSeed, roundNo)` gives the call order for a round.
- **Done when:** tests show the same seed gives the same order, and the shuffle passes a chi-square uniformity test over 100k runs.

### LT-012 Tabla generator
- **Depends on:** LT-011
- **Do:**
  - `tabla(seed, index): CardId[16]` deterministically picks 16 distinct cards, with at most 5 from any one category so boards look varied.
  - `tablaSet(seed, count)` guarantees that no two boards share more than 8 cards. It resamples when needed, and every card appears on roughly equally many boards.
  - `tablaCode(seed, index)` is a 6-character Crockford base32 code with a checksum, used on printed boards.
  - `decodeTablaCode(code) → {seedRef, index}`.
- **Done when:** property tests confirm determinism, the overlap bound, and that a typo is detected 100% of the time with single-character errors.

### LT-013 Win patterns and claim checking
- **Depends on:** LT-012
- **Do:**
  - Patterns, as index sets on the 4×4 grid: `row×4`, `col×4`, `diag×2`, `corners`, `centrito` (indices 5, 6, 9, 10) and `llena`.
  - `checkClaim(tabla, called:Set<CardId>, pattern, marks?:number[])` returns `{valid, completedPattern?, missing?:CardId[]}`.
  - When `marks` is given, as on phones, the completed pattern has to be within both the marked cells and the called cards. For paper boards with no marks, it only checks against called cards.
- **Done when:** unit tests cover every pattern, near misses, and the missing cards reported back.

### LT-014 Cantor (caller) screen
- **Depends on:** LT-004, LT-011
- **Do:**
  - A full-screen view: the current card big, its name in the call language, the verse, a progress bar to the next call, and the last 5 cards as thumbnails.
  - Controls: play/pause, previous, next, speed (6, 10 or 15 s, or manual), call language (any or rotating), pattern, and "Ver cartas cantadas", a grid of every card called so far.
  - Keyboard shortcuts for presenting: space, the arrow keys, and `L` to check a claim.
  - Show captions at the same time as the audio.
  - Use the Wake Lock API to keep the screen on.
- **Done when:** a full 54-card round runs on a laptop connected to a projector, offline.

### LT-015 Checking a paper claim
- **Depends on:** LT-013, LT-014
- **Do:**
  - Pressing `L` opens a dialog to type the 6-character tabla code.
  - It shows that board with called cards highlighted and the result: "¡Lotería!" with confetti, or "¡Casi! Falta: [card art]".
  - Optionally continue the round for 2nd and 3rd place.
- **Done when:** codes from a printed set verify correctly in tests.

### LT-016 Printable tablas as a PDF
- **Depends on:** LT-012, LT-010
- **Do:**
  - Use `pdf-lib` in a Web Worker to make A4 or Letter pages with 1 or 2 boards per page.
  - Each board shows its 16 card images, the names in the chosen **label language** (or none, for listen practice), the tabla code and a small QR code. The QR code lets a phone join with that same board later.
  - Offer a large-print option at 1 board per page with large names, and a black-and-white ink-saver option.
  - Embed fonts so the Latin-extended characters print correctly.
- **Done when:** 30 boards generate in under 5 s on a mid-range phone, and the PDF prints correctly in Chrome and Safari.

### LT-017 Single-device game setup
- **Depends on:** LT-014, LT-016
- **Do:**
  - Home screen with three choices: "Ser cantor (pantalla grande)", "Imprimir tablas" and "Unirme a una sala".
  - The cantor setup picks the mode, the pattern, the call language and the speed, and shows the room seed so it matches the printed boards.
  - Save the current round in IndexedDB so a reload resumes it.
- **Done when:** a teacher can print boards, then call and check a full round with no network.

---

## M2: Content, art, audio and review

### LT-020 Community review of the card list
- **Depends on:** LT-010
- **Do:**
  - Share the draft list with at least one speaker or cultural reviewer per language, using the reviewer tool (LT-022) or a shared doc.
  - Ask them three things: is anything sacred, misused or stereotyped? What's missing? Which names are right for their own variety of the language?
  - Record each decision in `docs/deck-decisions.md`.
- **Done when:** every card is marked keep, change or drop, with a reason.

### LT-021 Verses and riddles drafted by Claude (Batches API)
- **Depends on:** LT-020
- **Do:**
  - Write `scripts/draft-versos.ts`, which sends one Message Batch with 54 requests:
    - model `claude-opus-5-5`, `output_config.effort: "low"`
    - structured output `{verso_es, verso_en, riddle_es, riddle_en, sources[]}`
  - **System prompt:**
    - traditional lotería-caller style: short, rhythmic, playful, kid-safe;
    - no gendered references to people;
    - no Indigenous-language words except the card's own approved name;
    - riddles describe the thing without naming it.
  - Key the results by `custom_id = card.id`, since results arrive in any order, and write them into `cards.json` with `status: "draft"`.
  - A person then edits and approves every line, flipping it to `reviewed`.
- **Done when:** the drafts exist for all 54 cards, and a human review checklist is in the PR.

### LT-022 Reviewer and recording tool
- **Depends on:** LT-004
- **Do:**
  - Add a `/review?lang=yua` route protected by a passcode (`REVIEW_CODE`, checked by `/api/review-auth`).
  - For each card it shows the art, the draft name and its source. The reviewer can approve or correct the name, add IPA, and **record** the name with MediaRecorder as Opus at 48 kbps mono, with auto-trimmed silence via WebAudio.
  - Optionally they can record the verse in their language. That recording is **not** shown as text unless the reviewer also writes the text out.
  - Upload to the Supabase Storage bucket `audio-pending` and the table `review_submissions`.
  - `scripts/pull-reviews.ts` opens a PR that merges approved items into `cards.json` and copies the audio to `public/audio/{lang}/{n}.webm`.
- **Done when:** a test reviewer approves and records 5 cards, and the script's PR diff is correct.

### LT-023 Original art
- **Depends on:** LT-020
- **Do:**
  - Write an art brief in `docs/art-brief.md`: a flat style inspired by papel picado and textile patterns, a consistent palette, no human figures with gender markers, and every animal and plant drawn true to its region.
  - Budget for and commission an Indigenous illustrator if possible, with credit and payment agreed in writing.
  - Until the art is ready, keep the OpenMoji placeholders. Art lives in `src/content/art/{n}.svg`, optimized with svgo.
- **Done when:** the brief is approved and the placeholder pipeline works. The final art is tracked separately.

### LT-024 Review badges and build flag
- **Depends on:** LT-010, LT-004
- **Do:**
  - `useCardName(card, lang)` returns `{text, status, audio?}`.
  - Show "en revisión" when the status isn't approved, and "audio pendiente" when there's no recording.
  - The build flag `VITE_HIDE_UNREVIEWED=true` removes call languages with less than 100% approved names.
- **Done when:** the flag changes the call-language picker.

### LT-025 Audio playback service
- **Depends on:** LT-022
- **Do:**
  - `speak(card, lang)` plays the recording. Spanish and English fall back to Web Speech.
  - Indigenous languages **never** fall back to a synthetic voice. Without a recording, they show a large caption with the IPA and a "audio pendiente" badge.
  - Use Media Session so calls continue when the screen dims, and show a visual pulse that stays in sync with the audio.
- **Done when:** calls play offline, and a missing recording fails gracefully.

### LT-026 Credits and attributions page
- **Depends on:** LT-022, LT-023
- **Do:** a `/creditos` page generated from the reviewer and voice data, `credits.json` and the OpenMoji CC BY-SA notice.
- **Done when:** every credited item renders.

---

## M3: Phones join the room

### LT-030 Supabase room channels
- **Depends on:** LT-001
- **Do:**
  - Use the Supabase Realtime channel `loteria:{code}`, where the code is 5 letters from an unambiguous alphabet.
  - Messages:
    - **host to all:** `round{seed, roundNo, mode, pattern, callLang|rotating, speed}`, `call{i, cardId, lang, at}`, `claimResult{seat, valid, missing?}` and `end{winners}`
    - **client to host:** `claim{seat, tablaIndex, marks[]}` and `hello{seat, name, glyph, labelLang}`
  - Presence tracks the seats.
- **Done when:** 2 browsers exchange calls and claims.

### LT-031 Join by QR code with a tabla assigned
- **Depends on:** LT-030, LT-012
- **Do:**
  - The cantor screen shows the room code and a QR code for `/r/{code}`.
  - A joiner picks a name and glyph, with optional pronouns shown only to themselves and the host list.
  - Each seat gets the next tabla index, so the tabla is `tabla(seed, index)`.
  - If the QR code came from a **printed board**, the phone uses that board's index, so a phone can follow a paper board.
- **Done when:** a phone gets a playable tabla within 30 s of scanning.

### LT-032 Player tabla screen
- **Depends on:** LT-031, LT-004
- **Do:**
  - The 4×4 grid fills the screen. Tapping a card toggles a bean, with haptics and a sound.
  - The current call is shown in a top bar: the picture (except in Escucha and Adivinanza modes), the name in the call language, a replay-audio button, and the name in the player's own language if Aprende mode is on.
  - A big "¡Lotería!" button. Marks persist in sessionStorage.
- **Done when:** a Playwright run with 3 clients and 1 host plays to a valid win.

### LT-033 Host checks claims and announces results
- **Depends on:** LT-013, LT-030
- **Do:**
  - The host runs `checkClaim` for each claim message and broadcasts `claimResult`.
  - A valid claim triggers a celebration on every screen showing the winner's name and glyph.
  - An invalid claim shows "¡Casi!" only to that player, with the missing card highlighted.
  - Limit each seat to 1 claim every 3 s.
- **Done when:** fuzz tests with fake claims never produce a false winner.

### LT-034 Host reconnecting and handover
- **Depends on:** LT-030
- **Do:**
  - The host persists the round (seed, call index and winners) to IndexedDB and rebroadcasts `round` and the latest `call` after a reload.
  - "Pasar el rol de cantor" hands the round state to another seat, which becomes the new host.
  - Clients show "El cantor se reconectó…" while waiting.
- **Done when:** a host reload mid-round recovers within 3 s.

### LT-035 Classroom scale
- **Depends on:** LT-030
- **Do:**
  - Load-test with 40 headless clients against a real Supabase project, measuring p95 fan-out latency and claim round-trip time.
  - The client sends nothing except `hello` and `claim`, and marks stay local.
  - Document the free-tier headroom in `docs/scale.md`.
- **Done when:** p95 call latency is under 500 ms at 40 clients.

### LT-036 Mixing paper and phone players
- **Depends on:** LT-015, LT-033
- **Do:**
  - A paper player shouts "¡Lotería!" and the cantor presses `L` and types the code.
  - The result is broadcast to phones too, and the winners list mixes paper and phone players.
- **Done when:** a mixed round ends with the correct winners list.

---

## M4: Modes and AI

### LT-040 Escucha (listen) mode
- **Depends on:** LT-025, LT-032
- **Do:** each call plays audio only. The picture is revealed after `revealDelay`, which defaults to 5 s. Players who marked the right card **before** the reveal get a ⭐ "oído fino" (sharp ear) counter, just for fun.
- **Done when:** a test confirms the picture is hidden until the reveal time.

### LT-041 Adivinanza (riddle) mode
- **Depends on:** LT-021
- **Do:** the cantor reads the riddle, as text plus Web Speech in Spanish or English. The picture is revealed after a delay. Only riddles marked `reviewed` are used.
- **Done when:** the mode works offline using bundled riddles.

### LT-042 Aprende (learn) mode
- **Depends on:** LT-032
- **Do:** tabla labels are in the player's label language and calls are in the call language. After the reveal, both names show together with an audio button for each.
- **Done when:** labels and calls use different languages correctly.

### LT-043 Hint provider interface and offline matcher
- **Depends on:** LT-010
- **Do:**
  - Define `interface HintProvider { name; pick(call:{cardId?, riddleId?, audioOnly}, myCards:CardId[]): Promise<{cardId|null, confidence}> }`.
  - The offline matcher scores each of the player's cards by overlap between the riddle's keywords and the card's `tags` and category. If the score is under a threshold it returns `null`, meaning "Puede que no esté en tu tabla".
  - The UI's "Pista" button highlights the card with a confidence ring. Limit it to 3 hints per round; the host can change that limit.
- **Done when:** the offline matcher is right at least 80% of the time on a test set of riddles.

### LT-044 `/api/pista` (Jev)
- **Depends on:** LT-043, the Jev spike (shared with TG-041)
- **Do:**
  - A Vercel function takes `{riddleText|cardTags, options:[{id, tags, name_es}]}` and asks Jev a `Choice` question over the options, plus a "none of these" option.
  - Return `{cardId|null, confidence}`.
  - zod validation, `JEV_API_KEY` kept on the server, and an Upstash rate limit of 60 requests per minute per room.
  - The client times out after 800 ms and falls back to the offline matcher.
  - Note: in Escucha mode, when the audio is the call, send the **card's tags**. Jev never receives any audio.
- **Done when:** Jev is at least as accurate as the matcher on the riddle test set, and the result is logged in `docs/jev.md`.

### LT-045 Adaptive pacing
- **Depends on:** LT-033, LT-044
- **Do:**
  - Clients send a tiny `markStat{seat, ms}` within 15 s of each call: the time to mark, or a timeout. This is the only extra traffic.
  - Online, the host asks Jev a `Choice` of {slower, same, faster} from the last 3 calls' stats. Offline it uses a rule: slow down 2 s when more than 30% of players missed, and speed up 1 s when 90% marked in under 4 s.
  - Pacing stays between 6 and 20 s and is shown on the cantor screen as "ritmo: tranquilo".
  - The host can turn adaptive pacing off.
- **Done when:** in a simulated room with slow players, the interval goes up, and with fast players it goes down.

### LT-046 `/api/cantor` (Claude's banter)
- **Depends on:** LT-021
- **Do:**
  - A Vercel function using `@anthropic-ai/sdk`:
    - model `claude-opus-5-5`, effort `low`
    - beta `server-side-fallback-2026-07-01` with `fallbacks: "default"`
  - It generates one fresh 2-line verse or a one-sentence cultural fact for a card, in Spanish or English.
  - The system prompt holds the cantor persona and the approved-names glossary, cached with `cache_control`.
  - Structured output via `messages.parse` and `zodOutputFormat({text, termsUsed[]})`. Any term not in the approved glossary is rejected, and the bundled verse is used instead. Check `stop_reason` before reading the content.
  - The host prefetches the next 3 cards' banter in the background and caches it in IndexedDB.
  - The banter toggle is off by default in classrooms, so teachers can stick to reviewed text only.
- **Done when:** 30 sampled verses pass the glossary check, and the cache hits from the second call on.

### LT-047 Offline AI fallbacks end to end
- **Depends on:** LT-043 to LT-046
- **Do:** a Playwright test that cuts the network mid-round with `context.setOffline(true)`. Hints switch to the matcher, pacing switches to the rule, and banter switches to the bundled verse, with no error toasts.
- **Done when:** the test passes in CI.

---

## M5: Accessibility and inclusion

### LT-050 Screen readers and captions
- **Depends on:** LT-032, LT-014
- **Do:**
  - Each call is announced in an `aria-live="assertive"` region with the name in the call language and in the player's label language.
  - Tabla cells read as "Fila 2, columna 3: Colibrí, marcada".
  - The cantor's captions mirror the audio exactly.
- **Done when:** a full round is played with VoiceOver and with TalkBack.

### LT-051 Auto-mark assist
- **Depends on:** LT-032
- **Do:**
  - A per-player setting, which the host can allow or block, marks matching cards automatically.
  - It's an accessibility aid for motor or vision needs and very young players, labeled "Ayuda para marcar". Claim checking is unchanged.
- **Done when:** with the setting on, cards are marked within 1 s of each call.

### LT-052 Large print, high contrast and colorblind support
- **Depends on:** LT-004, LT-016
- **Do:**
  - A tabla mode with a 2×2 zoom and swipe paging.
  - The bean marker uses shape as well as color.
  - Large-print and high-contrast PDF variants.
  - Reduced-motion confetti.
- **Done when:** 200% zoom, the high-contrast theme and colorblind simulations all pass review.

### LT-053 Gender-neutral and anti-stereotype copy lint
- **Depends on:** LT-003
- **Do:**
  - Reuse the TG-052 deny-list.
  - Add a check that fails if a card or verse names gendered human roles (*dama, valiente, catrín, borracho…*) without an explicit allow-list entry and a reason.
- **Done when:** CI fails on a seeded violation and passes on the deck.

### LT-054 Simple mode for young players
- **Depends on:** LT-032
- **Do:** a 3×3 tabla option, the centrito pattern only, slow pacing and big pictures with no text. The cantor can set it per round.
- **Done when:** a 5-year-old playtest completes a round.

---

## M6: Launch

### LT-060 Teacher guide
- **Depends on:** M1 and M3
- **Do:** a one-page PDF in Spanish and English, generated from `docs/teacher-guide.md`. It covers setup, printing, modes, and how to invite a community speaker to be the cantor in their own language.
- **Done when:** a teacher can run a session from the guide alone.

### LT-061 Demo script
- **Depends on:** the hackathon cut
- **Do:** write `docs/demo.md`, a 2-minute script:
  1. The QR code is on the projector, and 3 judges join.
  2. One judge holds a printed board.
  3. The round is called in Maaya t'aan, with recorded audio.
  4. A judge taps "Pista", and Jev shows its confidence ring.
  5. Turn on airplane mode, and the cantor carries on offline.
  6. A paper "¡Lotería!" is verified by typing its code.
  - Add a `?demo=1` seed that produces a win in about 12 calls.
- **Done when:** the script runs cleanly 5 times in a row.

### LT-062 Classroom pilot
- **Depends on:** LT-035, LT-060
- **Do:** run one real session with 20 or more players, collect anonymous metrics and teacher feedback in `docs/pilot-notes.md`, and fix the top 3 issues.
- **Done when:** the notes and fixes are merged.

### LT-063 North-star dashboard
- **Depends on:** LT-005
- **Do:** a passcode-protected `/admin` page showing Indigenous-language calls matched per session over 7 and 30 days, plus the supporting metrics.
- **Done when:** the dashboard shows real pilot data.

### LT-064 Consent, licenses and trademark check
- **Depends on:** LT-026
- **Do:**
  - Get written consent from every voice and reviewer, with their choice of how they're credited.
  - Licenses: MIT for the code. For content, CC BY-SA only with the contributors' agreement; recordings stay under whatever license their speakers choose.
  - Check that no name, wording or art copies a commercial lotería deck.
- **Done when:** the records are filed and the check is signed off.
