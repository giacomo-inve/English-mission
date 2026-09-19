export default function Grammar() {
  const sections = [
    {
      title: 'Present Simple',
      tag: 'TEMPI VERBALI',
      content: [
        'Si usa per azioni abituali, fatti generali e verità permanenti.',
        'Struttura affermativa: soggetto + verbo base (+ -s/-es alla 3ª persona singolare).',
        'Esempi: I work from home. · She works every day. · They drink coffee.',
      ],
      examples: [
        { en: 'I study English every morning.', it: 'Studio l\'inglese ogni mattina.' },
        { en: 'He doesn\'t like coffee.', it: 'A lui non piace il caffè.' },
        { en: 'Do you speak Italian?', it: 'Parli italiano?' },
      ],
    },
    {
      title: 'Past Simple',
      tag: 'TEMPI VERBALI',
      content: [
        'Si usa per azioni completate in un momento preciso del passato.',
        'Verbi regolari: aggiungere -ed (work → worked).',
        'Verbi irregolari: forme speciali da memorizzare (go → went, buy → bought).',
      ],
      examples: [
        { en: 'I visited Rome last year.', it: 'Ho visitato Roma l\'anno scorso.' },
        { en: 'She didn\'t come to the party.', it: 'Lei non è venuta alla festa.' },
        { en: 'Where did you go yesterday?', it: 'Dove sei andato ieri?' },
      ],
    },
    {
      title: 'Articles: a / an / the',
      tag: 'ARTICOLI',
      content: [
        '"A" prima di suono consonantico: a book, a car, a university.',
        '"An" prima di suono vocalico: an apple, an hour, an honest man.',
        '"The" per riferimenti specifici o già menzionati: the book on the table.',
      ],
      examples: [
        { en: 'I saw a cat in the garden.', it: 'Ho visto un gatto in giardino.' },
        { en: 'She has an umbrella.', it: 'Lei ha un ombrello.' },
        { en: 'The moon is beautiful tonight.', it: 'La luna è bella stasera.' },
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-white/30 text-xs tracking-widest mb-2" style={{ letterSpacing: '0.2em' }}>
          GRAMMATICA · A1
        </p>
        <h1 className="heading-display text-4xl mb-4">GRAMMATICA</h1>
        <hr className="hr-subtle" />
      </div>

      <div className="space-y-8">
        {sections.map((s, idx) => (
          <div key={idx} className="border border-border-subtle">
            {/* Section header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
              <h2 className="text-text-display font-sans text-lg">{s.title}</h2>
              <span className="font-mono text-white/20 text-xs tracking-wider" style={{ letterSpacing: '0.14em' }}>
                {s.tag}
              </span>
            </div>

            {/* Content */}
            <div className="px-5 py-5 space-y-4">
              <ul className="space-y-2">
                {s.content.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-white/20 font-mono text-xs mt-0.5">—</span>
                    <span className="text-text-content text-sm">{c}</span>
                  </li>
                ))}
              </ul>

              {/* Examples */}
              <div>
                <p className="font-mono text-white/20 text-xs tracking-wider mb-3" style={{ letterSpacing: '0.14em' }}>
                  ESEMPI
                </p>
                <div className="space-y-2">
                  {s.examples.map((ex, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="text-text-display text-sm italic flex-1">{ex.en}</span>
                      <span className="text-text-content/30 text-sm flex-1">{ex.it}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
