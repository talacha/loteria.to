# Lotería de los Pueblos: north star

> **A whole classroom, plaza or family table can join a lotería round from one QR code in under 30 seconds, and every player hears the cards called in Nahuatl, Maya, Quechua, Spanish or English. No phone is required to play.**

Lotería is the picture-bingo that nearly everyone in Mexico grew up with. A caller (*el cantor*) draws a card, recites a short verse, and players mark the matching picture on their *tabla* with a bean. This version keeps the ritual and makes it inclusive:
- An original deck of 54 cards drawn from the peoples, land and foods of Mesoamerica and the Andes.
- The cards are called in five languages.
- Players can join from a phone, a shared tablet or a printed paper board.

## Who it's for
- **Classrooms and community centres:** one projector or TV as the caller, kids on paper boards or phones.
- **Families with mixed languages:** a grandparent can call in Maya while the kids match pictures.
- **Heritage learners:** "listen mode" calls only the word, with no picture, so players learn by ear.
- **Hackathon judges:** scan a QR code and play a 2-minute round.

## Experience pillars
1. **Everyone can join.** It works on phones, printed boards or a shared tablet, with no accounts and no app store.
2. **Hear the language.** Calls are recorded by native speakers, and the cantor can call in any of the five languages.
3. **Works with no connection.** A single device can be the caller for a room full of paper boards, with no network at all.
4. **No stereotypes and no gender assumptions.** The deck is original and doesn't use the classic figures like *La Dama*, *El Valiente* or *El Negrito*; it shows animals, plants, food, places, tools and sky. Players are names and glyphs, and pronouns are optional.
5. **Honest about language.** Every Indigenous-language word and recording is reviewed before it ships, and anything unreviewed is visibly labeled.
6. **Gentle for kids.** A false "¡Lotería!" claim gets a friendly "¡Casi!", not a penalty. Speeds are adjustable, and auto-mark is available as an accessibility aid.

## North-star metric
**Indigenous-language calls matched:** the number of cards players correctly marked after a call in Nahuatl, Maya or Quechua, per session. Target **≥ 10 per session** at launch.

| Supporting metric | Target |
|---|---|
| Median time from scanning the QR code to holding a tabla | < 30 s |
| Rounds that reach a winner | ≥ 80% |
| Rounds with at least one Indigenous-language call | ≥ 60% |
| Single-device paper mode playable offline | 100% (must-have) |
| Players per room supported | up to 40 |

These are measured with anonymous counters only, and there's an opt-out switch.

## Non-goals
- No money, prizes, real wagering or betting language. The beans are just beans.
- No reuse of the traditional Don Clemente card art or names. That art is trademarked, and some of its figures are stereotypes.
- No live machine-generated Indigenous text. Claude writes verses only in Spanish or English and quotes only reviewed vocabulary.
- No free-text chat.

## Game in one page (rules v1)
- **The deck:** 54 original cards. Each card has:
  - a number and an illustration;
  - its name in all five languages;
  - a short *verso* (the caller's rhyme) in Spanish and English;
  - a riddle;
  - recorded audio in each reviewed language.
- **The tablas:** 4×4 grids of 16 cards. Each tabla is generated from `roomSeed + seatId`, so the cantor can check any claim without being sent the board. Paper tablas print with a short code that the cantor can type in to check a claim.
- **The cantor:** the host device shows the card big, plays the audio in the **call language**, and shows the verse. Calls are automatic every 6, 10 or 15 seconds, or advanced by hand.
- **Call language:** one language per round, or *rotating*, where each card is called in the next language.
- **Modes:**
  - **Clásica:** picture plus name plus verse.
  - **Escucha:** audio only, with no picture shown, until the card is revealed after a delay.
  - **Adivinanza:** only the riddle is read, and the picture is revealed after a delay.
  - **Aprende:** each player's tabla labels show their own language while the call is in another.
- **Win patterns**, chosen by the host: a line, a column, a diagonal, four corners, the 2×2 centre (*centrito*), or a full board (*llena*).
- **Claiming:** a player taps "¡Lotería!". The host checks that every marked card in the pattern has been called.
  - **Valid:** a winner celebration, and the round ends, or continues for 2nd place.
  - **Invalid:** "¡Casi!", which shows the player the card that wasn't called yet.

## Where AI fits
| Job | Online | Offline |
|---|---|---|
| **"Pista" hint:** "which of my cards is the one just called?" | **Jev** `Choice` over the player's 16 cards, given the riddle or audio id, with a confidence meter | Tag matching on the card's keywords and category |
| **Pacing:** speed up or slow down the calls | **Jev** `Choice` of {slower, same, faster} from recent mark times and missed cards | A rule: slow down when more than 30% of players missed the last 2 calls |
| **The cantor's banter**, a fresh verse or cultural note for a card | **Claude**, in Spanish or English, quoting only reviewed card names | The bundled, reviewed verse |
| **Building the deck content** | Claude drafts the Spanish and English verses and riddles with the Batches API, for people to review | n/a |

The AI is a supporting act in this game. The core value is the languages, the accessibility and the ritual of playing together, and the game is fully playable with no AI at all.

## Tech in one line
A Vite + React + TypeScript PWA on Vercel Hobby, using the same stack as Tianguis:
- **Multiplayer:** Supabase Realtime broadcast rooms. These scale to classroom size, where peer-to-peer connections between 40 phones wouldn't.
- **Offline:** IndexedDB and Workbox, with all card audio precached.
- **Server functions:** `/api/pista` (Jev) and `/api/cantor` (Claude) on Vercel.
- **Printing:** paper tablas are produced in the browser with `pdf-lib`.
