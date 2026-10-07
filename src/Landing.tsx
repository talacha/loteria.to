// Placeholder marketing page. Delete this file and landing.css when the real app shell lands.

const tabla = [
  { glyph: '☀️', name: 'El Sol' },
  { glyph: '🌽', name: 'El Maíz' },
  { glyph: '🐦', name: 'El Colibrí' },
  { glyph: '🌵', name: 'El Nopal' },
  { glyph: '🌙', name: 'La Luna' },
  { glyph: '🦙', name: 'La Llama' },
  { glyph: '🫘', name: 'El Frijol' },
  { glyph: '🏔️', name: 'La Montaña' },
  { glyph: '🐆', name: 'El Jaguar' },
];

const languages = ['Nahuatl', 'Maya', 'Quechua', 'Español', 'English'];

const steps = [
  {
    title: 'Scan one QR code',
    body: 'The cantor puts the room code on a projector, TV or tablet. Players hold a tabla in under 30 seconds, with no accounts and no app store.',
  },
  {
    title: 'Hear the call',
    body: 'Each card is called in the round’s language, or in a different language every card. Indigenous-language calls are recorded by native speakers.',
  },
  {
    title: 'Shout ¡Lotería!',
    body: 'Mark the pictures with a tap or a bean. A claim that isn’t ready yet gets a friendly “¡Casi!”, never a penalty.',
  },
];

const pillars = [
  { title: 'Everyone can join', body: 'Phones, a shared tablet or printed paper boards all play in the same round.' },
  { title: 'Works with no connection', body: 'One device can call a whole room of paper boards with no network at all.' },
  { title: 'An original deck', body: '54 new cards of animals, plants, food, places, tools and sky. No stereotyped figures.' },
  { title: 'Honest about language', body: 'Every Indigenous-language word and recording is reviewed before it ships, and anything unreviewed is clearly labeled.' },
  { title: 'Gentle for kids', body: 'Adjustable speeds, a listen-only mode for heritage learners, and auto-mark as an accessibility aid.' },
  { title: 'Just beans', body: 'No money, no prizes and no betting. Players are names and glyphs; pronouns are optional.' },
];

const audiences = [
  { title: 'Classrooms and community centres', body: 'One screen calls, kids play on paper or phones.' },
  { title: 'Families with mixed languages', body: 'A grandparent calls in Maya while the kids match pictures.' },
  { title: 'Heritage learners', body: 'Escucha mode calls only the word, so you learn by ear.' },
];

export function Landing() {
  return (
    <>
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Próximamente · Coming soon</p>
            <h1>Lotería de los Pueblos</h1>
            <p className="lede">
              The picture bingo everyone grew up with, called in five languages. A whole classroom, plaza or family
              table joins from one QR code, and no phone is required to play.
            </p>
            <ul className="langs" aria-label="Call languages">
              {languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div className="tabla" aria-hidden="true">
            {tabla.map((c, i) => (
              <div className={`carta${i === 4 ? ' marked' : ''}`} key={c.name}>
                <span className="glyph">{c.glyph}</span>
                <span className="name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="wrap">
          <h2>How a round works</h2>
          <ol className="steps">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="num">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="band">
          <div className="wrap">
            <h2>Made to include everyone</h2>
            <div className="cards">
              {pillars.map((p) => (
                <article key={p.title}>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap">
          <h2>Who it’s for</h2>
          <div className="cards three">
            {audiences.map((a) => (
              <article key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="wrap footer">
        <p>
          Lotería de los Pueblos is in development. The card names shown here are Spanish placeholders; the full deck and
          its Nahuatl, Maya and Quechua recordings will ship only after review by native speakers.
        </p>
      </footer>
    </>
  );
}
