// ============================================================
//  SEED DATA — English Mission Control
//  A1-B2 Vocabulary · Irregular Verbs · Listening · Speaking · Writing
// ============================================================

// ─────────────────────────────────────────
// 1. VOCABOLI A1, B1, B2 — usati da SRS / Review
// ─────────────────────────────────────────
export interface VocabItem {
  id: string
  term: string
  translation: string
  ipa: string
  category: 'sostantivo' | 'aggettivo' | 'avverbio' | 'verbo' | 'preposizione'
  examples: string[]
  level?: 'A1' | 'A2' | 'B1' | 'B2'
  audioHint?: string
}

export const vocabulary: VocabItem[] = [
  // ── A1 ──
  { id: 'v01', term: 'apple',     translation: 'mela',               ipa: '/ˈæp.əl/',       category: 'sostantivo', level: 'A1', examples: ['I eat an apple every morning.', 'The apple is red and sweet.'] },
  { id: 'v02', term: 'book',      translation: 'libro',              ipa: '/bʊk/',           category: 'sostantivo', level: 'A1', examples: ['This book is very interesting.', 'She reads a book before bed.'] },
  { id: 'v03', term: 'cat',       translation: 'gatto',              ipa: '/kæt/',           category: 'sostantivo', level: 'A1', examples: ['The cat sleeps on the sofa.', 'My cat is black and white.'] },
  { id: 'v04', term: 'door',      translation: 'porta',              ipa: '/dɔːr/',          category: 'sostantivo', level: 'A1', examples: ['Please close the door.', 'The door is made of wood.'] },
  { id: 'v05', term: 'early',     translation: 'presto',             ipa: '/ˈɜːr.li/',       category: 'avverbio',   level: 'A1', examples: ['She wakes up early every day.', 'We arrived early at the airport.'] },
  { id: 'v06', term: 'friend',    translation: 'amico / amica',      ipa: '/frɛnd/',         category: 'sostantivo', level: 'A1', examples: ['He is my best friend.', 'We met a new friend at school.'] },
  { id: 'v07', term: 'happy',     translation: 'felice / contento',  ipa: '/ˈhæp.i/',        category: 'aggettivo',  level: 'A1', examples: ['I am happy to see you.', 'The children look very happy.'] },
  { id: 'v08', term: 'house',     translation: 'casa',               ipa: '/haʊs/',          category: 'sostantivo', level: 'A1', examples: ['We live in a small house.', 'The house has a beautiful garden.'] },
  { id: 'v09', term: 'important', translation: 'importante',         ipa: '/ɪmˈpɔːr.tənt/', category: 'aggettivo',  level: 'A1', examples: ['It is important to study every day.', 'This is a very important meeting.'] },
  { id: 'v10', term: 'job',       translation: 'lavoro / impiego',   ipa: '/dʒɒb/',          category: 'sostantivo', level: 'A1', examples: ['She has a new job in the city.', 'Finding a job can be difficult.'] },
  { id: 'v11', term: 'key',       translation: 'chiave',             ipa: '/kiː/',           category: 'sostantivo', level: 'A1', examples: ['I lost my key again.', 'The key is on the table.'] },
  { id: 'v12', term: 'listen',    translation: 'ascoltare',          ipa: '/ˈlɪs.ən/',       category: 'verbo',      level: 'A1', examples: ['Please listen carefully.', 'I listen to music while studying.'] },
  { id: 'v13', term: 'morning',   translation: 'mattina',            ipa: '/ˈmɔːr.nɪŋ/',    category: 'sostantivo', level: 'A1', examples: ['Good morning! How are you?', 'I go for a run every morning.'] },
  { id: 'v14', term: 'night',     translation: 'notte',              ipa: '/naɪt/',          category: 'sostantivo', level: 'A1', examples: ['The stars shine at night.', 'Good night, sleep well.'] },
  { id: 'v15', term: 'open',      translation: 'aprire / aperto',    ipa: '/ˈoʊ.pən/',       category: 'verbo',      level: 'A1', examples: ['Can you open the window?', 'The shop is open from nine to six.'] },

  // ── B1 (Connettori, Phrasal verbs, Lavoro) ──
  { id: 'v16', term: 'however',     translation: 'tuttavia / comunque', ipa: '/haʊˈev.ər/',      category: 'avverbio',   level: 'B1', examples: ['The mission was delayed; however, the crew remained calm.', 'I wanted to go, however I had no time.'] },
  { id: 'v17', term: 'although',    translation: 'sebbene / benché',   ipa: '/ɔːlˈðoʊ/',        category: 'preposizione', level: 'B1', examples: ['Although the test was tough, we succeeded.', 'She smiled although she was exhausted.'] },
  { id: 'v18', term: 'whereas',     translation: 'mentre invece',      ipa: '/weərˈæz/',        category: 'preposizione', level: 'B1', examples: ['He prefers manual flights, whereas she relies on autopilot.'] },
  { id: 'v19', term: 'look forward',translation: 'non vedere l\'ora di', ipa: '/lʊk ˈfɔːr.wəd/', category: 'verbo',     level: 'B1', examples: ['I look forward to hearing from you soon.', 'The astronauts look forward to landing.'] },
  { id: 'v20', term: 'run out of',  translation: 'esaurire / restare senza', ipa: '/rʌn aʊt əv/', category: 'verbo',    level: 'B1', examples: ['We cannot afford to run out of oxygen.', 'The team ran out of time during the test.'] },
  { id: 'v21', term: 'negotiate',   translation: 'negoziare',          ipa: '/nəˈɡoʊ.ʃi.eɪt/',  category: 'verbo',      level: 'B1', examples: ['We need to negotiate the delivery timeline with suppliers.'] },
  { id: 'v22', term: 'efficient',   translation: 'efficiente',         ipa: '/ɪˈfɪʃ.ənt/',      category: 'aggettivo',  level: 'B1', examples: ['The new thruster is twenty percent more efficient.'] },
  { id: 'v23', term: 'furthermore', translation: 'inoltre',            ipa: '/ˌfɜːr.ðəˈmɔːr/',  category: 'avverbio',   level: 'B1', examples: ['Furthermore, solar panels will produce additional power.'] },

  // ── B2 (Idioms professionali, Linguaggio tecnico e aerospaziale) ──
  { id: 'v24', term: 'trajectory',  translation: 'traiettoria',        ipa: '/trəˈdʒek.tər.i/', category: 'sostantivo', level: 'B2', examples: ['Recalculate orbital trajectory to avoid space debris.'] },
  { id: 'v25', term: 'propulsion',  translation: 'propulsione',        ipa: '/prəˈpʌl.ʃən/',    category: 'sostantivo', level: 'B2', examples: ['The ion propulsion system operated without any telemetry drop.'] },
  { id: 'v26', term: 'mitigate',    translation: 'mitigare / ridurre', ipa: '/ˈmɪt.ɪ.ɡeɪt/',    category: 'verbo',      level: 'B2', examples: ['Safety protocols mitigate atmospheric re-entry heat risks.'] },
  { id: 'v27', term: 'benchmark',   translation: 'parametro di riferimento', ipa: '/ˈbentʃ.mɑːrk/', category: 'sostantivo', level: 'B2', examples: ['This engine sets a new benchmark for deep space exploration.'] },
  { id: 'v28', term: 'touch base',  translation: 'fare il punto / aggiornarsi', ipa: '/tʌtʃ beɪs/', category: 'verbo',  level: 'B2', examples: ['Let us touch base tomorrow regarding the payload validation.'] },
  { id: 'v29', term: 'cut corners', translation: 'prendere scorciatoie pericolose', ipa: '/kʌt ˈkɔːr.nərz/', category: 'verbo', level: 'B2', examples: ['When launching orbital satellites, we can never cut corners.'] },
  { id: 'v30', term: 'redundancy',  translation: 'ridondanza di sicurezza', ipa: '/rɪˈdʌn.dən.si/', category: 'sostantivo', level: 'B2', examples: ['Avionics require triple redundancy to guarantee pilot survival.'] },
]

// ─────────────────────────────────────────
// 2. VERBI IRREGOLARI (50 items, A1–B2)
// ─────────────────────────────────────────
export type IrregularPattern = 'AAA' | 'ABA' | 'ABB' | 'ABC'

export interface IrregularVerb {
  id: string
  base: string
  past: string
  pastParticiple: string
  translation: string
  pattern: IrregularPattern
  level: 'A1' | 'A2' | 'B1' | 'B2'
  example: string
}

export const irregularVerbs: IrregularVerb[] = [
  // ── AAA ─────────────────────────────────
  { id: 'irr01', base: 'cut',       past: 'cut',      pastParticiple: 'cut',       translation: 'tagliare',              pattern: 'AAA', level: 'A1', example: 'She cut the paper carefully.' },
  { id: 'irr02', base: 'put',       past: 'put',      pastParticiple: 'put',       translation: 'mettere / posizionare', pattern: 'AAA', level: 'A1', example: 'He put the book on the shelf.' },
  { id: 'irr03', base: 'let',       past: 'let',      pastParticiple: 'let',       translation: 'lasciare / permettere', pattern: 'AAA', level: 'A1', example: 'They let us in without a ticket.' },
  { id: 'irr04', base: 'hit',       past: 'hit',      pastParticiple: 'hit',       translation: 'colpire',               pattern: 'AAA', level: 'A2', example: 'He hit the ball over the net.' },
  { id: 'irr05', base: 'set',       past: 'set',      pastParticiple: 'set',       translation: 'impostare / fissare',   pattern: 'AAA', level: 'A2', example: 'I set the alarm for seven o\'clock.' },
  { id: 'irr06', base: 'hurt',      past: 'hurt',     pastParticiple: 'hurt',      translation: 'fare male / ferire',    pattern: 'AAA', level: 'A2', example: 'She hurt her knee while running.' },
  { id: 'irr07', base: 'read',      past: 'read',     pastParticiple: 'read',      translation: 'leggere',               pattern: 'AAA', level: 'A1', example: 'I read the news every morning.' },
  { id: 'irr08', base: 'cost',      past: 'cost',     pastParticiple: 'cost',      translation: 'costare',               pattern: 'AAA', level: 'A2', example: 'The orbital booster cost several million pounds.' },
  { id: 'irr09', base: 'spread',    past: 'spread',   pastParticiple: 'spread',    translation: 'diffondere / spargere',pattern: 'AAA', level: 'B1', example: 'The signal spread quickly across ground stations.' },

  // ── ABA ─────────────────────────────────
  { id: 'irr10', base: 'come',      past: 'came',     pastParticiple: 'come',      translation: 'venire',                pattern: 'ABA', level: 'A1', example: 'She came home very late last night.' },
  { id: 'irr11', base: 'run',       past: 'ran',      pastParticiple: 'run',       translation: 'correre',               pattern: 'ABA', level: 'A1', example: 'He ran a marathon last year.' },
  { id: 'irr12', base: 'become',    past: 'became',   pastParticiple: 'become',    translation: 'diventare',             pattern: 'ABA', level: 'A2', example: 'She became a pilot after years of study.' },
  { id: 'irr13', base: 'overcome',  past: 'overcame', pastParticiple: 'overcome',  translation: 'superare / sormontare', pattern: 'ABA', level: 'B2', example: 'The crew overcame severe gravitational turbulence.' },

  // ── ABB ─────────────────────────────────
  { id: 'irr14', base: 'buy',       past: 'bought',   pastParticiple: 'bought',    translation: 'comprare',              pattern: 'ABB', level: 'A1', example: 'I bought a new phone yesterday.' },
  { id: 'irr15', base: 'find',      past: 'found',    pastParticiple: 'found',     translation: 'trovare',               pattern: 'ABB', level: 'A1', example: 'We found a great solution.' },
  { id: 'irr16', base: 'think',     past: 'thought',  pastParticiple: 'thought',   translation: 'pensare',               pattern: 'ABB', level: 'A1', example: 'I thought about the launch coordinates.' },
  { id: 'irr17', base: 'make',      past: 'made',     pastParticiple: 'made',      translation: 'fare / costruire',      pattern: 'ABB', level: 'A1', example: 'They made a vital breakthrough.' },
  { id: 'irr18', base: 'teach',     past: 'taught',   pastParticiple: 'taught',    translation: 'insegnare',             pattern: 'ABB', level: 'A2', example: 'He taught astrophysics at university.' },
  { id: 'irr19', base: 'sell',      past: 'sold',     pastParticiple: 'sold',      translation: 'vendere',               pattern: 'ABB', level: 'A2', example: 'They sold their satellite technology.' },
  { id: 'irr20', base: 'tell',      past: 'told',     pastParticiple: 'told',      translation: 'dire / raccontare',     pattern: 'ABB', level: 'A1', example: 'She told the flight director about the anomaly.' },
  { id: 'irr21', base: 'feel',      past: 'felt',     pastParticiple: 'felt',      translation: 'sentire / provare',     pattern: 'ABB', level: 'A2', example: 'The astronauts felt zero gravity.' },
  { id: 'irr22', base: 'keep',      past: 'kept',     pastParticiple: 'kept',      translation: 'tenere / mantenere',    pattern: 'ABB', level: 'A2', example: 'He kept telemetry in continuous sync.' },
  { id: 'irr23', base: 'leave',     past: 'left',     pastParticiple: 'left',      translation: 'lasciare / partire',    pattern: 'ABB', level: 'A2', example: 'The spacecraft left Earth orbit at midnight.' },
  { id: 'irr24', base: 'catch',     past: 'caught',   pastParticiple: 'caught',    translation: 'prendere / afferrare', pattern: 'ABB', level: 'A2', example: 'The antenna caught the weak radio beacon.' },
  { id: 'irr25', base: 'win',       past: 'won',      pastParticiple: 'won',       translation: 'vincere',               pattern: 'ABB', level: 'A2', example: 'The team won the aerospace grant.' },
  { id: 'irr26', base: 'meet',      past: 'met',      pastParticiple: 'met',       translation: 'incontrare',            pattern: 'ABB', level: 'A1', example: 'I met the commander at the simulator.' },
  { id: 'irr27', base: 'pay',       past: 'paid',     pastParticiple: 'paid',      translation: 'pagare',                pattern: 'ABB', level: 'A2', example: 'The agency paid for all telemetry upgrades.' },
  { id: 'irr28', base: 'build',     past: 'built',    pastParticiple: 'built',     translation: 'costruire',             pattern: 'ABB', level: 'B1', example: 'They built a modular space station habitat.' },
  { id: 'irr29', base: 'lose',      past: 'lost',     pastParticiple: 'lost',      translation: 'perdere',               pattern: 'ABB', level: 'A2', example: 'We lost communications for twelve seconds.' },
  { id: 'irr30', base: 'send',      past: 'sent',     pastParticiple: 'sent',      translation: 'inviare / mandare',     pattern: 'ABB', level: 'A2', example: 'Ground control sent the revised trajectory.' },
  { id: 'irr31', base: 'spend',     past: 'spent',    pastParticiple: 'spent',     translation: 'spendere / trascorrere',pattern: 'ABB', level: 'A2', example: 'The crew spent six months on the orbital platform.' },
  { id: 'irr32', base: 'lead',      past: 'led',      pastParticiple: 'led',       translation: 'guidare / condurre',    pattern: 'ABB', level: 'B1', example: 'The commander led the EVA spacewalk flawlessly.' },
  { id: 'irr33', base: 'withstand', past: 'withstood',pastParticiple: 'withstood', translation: 'resistere a',          pattern: 'ABB', level: 'B2', example: 'The heat shield withstood temperatures exceeding 2000 degrees.' },
  { id: 'irr34', base: 'seek',      past: 'sought',   pastParticiple: 'sought',    translation: 'cercare',               pattern: 'ABB', level: 'B2', example: 'The mission sought proof of subsurface water.' },

  // ── ABC ─────────────────────────────────
  { id: 'irr35', base: 'go',        past: 'went',     pastParticiple: 'gone',      translation: 'andare',                pattern: 'ABC', level: 'A1', example: 'The probe went beyond lunar orbit.' },
  { id: 'irr36', base: 'speak',     past: 'spoke',    pastParticiple: 'spoken',    translation: 'parlare',               pattern: 'ABC', level: 'A1', example: 'The flight engineer spoke clearly on the radio.' },
  { id: 'irr37', base: 'write',     past: 'wrote',    pastParticiple: 'written',   translation: 'scrivere',              pattern: 'ABC', level: 'A1', example: 'She wrote the mission post-mortem log.' },
  { id: 'irr38', base: 'begin',     past: 'began',    pastParticiple: 'begun',     translation: 'cominciare',            pattern: 'ABC', level: 'A2', example: 'The booster ignition began on countdown zero.' },
  { id: 'irr39', base: 'drink',     past: 'drank',    pastParticiple: 'drunk',     translation: 'bere',                  pattern: 'ABC', level: 'A1', example: 'Astronauts drank recycled purified water.' },
  { id: 'irr40', base: 'take',      past: 'took',     pastParticiple: 'taken',     translation: 'prendere / portare',    pattern: 'ABC', level: 'A1', example: 'The ascent module took three minutes to reach orbit.' },
  { id: 'irr41', base: 'give',      past: 'gave',     pastParticiple: 'given',     translation: 'dare',                  pattern: 'ABC', level: 'A1', example: 'Flight director gave the final go for launch.' },
  { id: 'irr42', base: 'see',       past: 'saw',      pastParticiple: 'seen',      translation: 'vedere',                pattern: 'ABC', level: 'A1', example: 'We saw the auroral lights from the cupola.' },
  { id: 'irr43', base: 'break',     past: 'broke',    pastParticiple: 'broken',    translation: 'rompere / spezzare',    pattern: 'ABC', level: 'A2', example: 'The pressure seal broke during stress test.' },
  { id: 'irr44', base: 'choose',    past: 'chose',    pastParticiple: 'chosen',    translation: 'scegliere',             pattern: 'ABC', level: 'B1', example: 'They chose an elliptical entry angle.' },
  { id: 'irr45', base: 'arise',     past: 'arose',    pastParticiple: 'arisen',    translation: 'sorgere / presentarsi', pattern: 'ABC', level: 'B1', example: 'An unexpected voltage surge arose in circuit B.' },
  { id: 'irr46', base: 'forbid',    past: 'forbade',  pastParticiple: 'forbidden', translation: 'proibire / vietare',    pattern: 'ABC', level: 'B1', example: 'Flight safety rules forbade entering unpressurized zones.' },
  { id: 'irr47', base: 'freeze',    past: 'froze',    pastParticiple: 'frozen',    translation: 'congelare',             pattern: 'ABC', level: 'B1', example: 'Coolant lines froze during deep shade transit.' },
  { id: 'irr48', base: 'undertake', past: 'undertook',pastParticiple: 'undertaken',translation: 'intraprendere',        pattern: 'ABC', level: 'B2', example: 'The astronauts undertook an emergency maintenance EVA.' },
  { id: 'irr49', base: 'withdraw',  past: 'withdrew', pastParticiple: 'withdrawn', translation: 'ritirare / recedere',   pattern: 'ABC', level: 'B2', example: 'Mission Control withdrew the abort sequence in time.' },
  { id: 'irr50', base: 'foresee',   past: 'foresaw',  pastParticiple: 'foreseen',  translation: 'prevedere',             pattern: 'ABC', level: 'B2', example: 'Telemetry models foresaw the atmospheric density spike.' },
]

// ─────────────────────────────────────────
// 3. QUIZ ITEMS (Core Loop)
// ─────────────────────────────────────────
export type QuizType = 'translate' | 'fill-blank' | 'choose-form'

export interface QuizItem {
  id: string
  type: QuizType
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  audioText?: string
  relatedId?: string
  level?: 'A1' | 'A2' | 'B1' | 'B2'
}

export const quizItems: QuizItem[] = [
  { id: 'q01', type: 'translate',   question: 'Come si dice "mela" in inglese?',        options: ['orange', 'apple', 'pear', 'grape'],            correctIndex: 1, explanation: '"Apple" significa mela. Pronuncia: /ˈæp.əl/',              audioText: 'apple',                              relatedId: 'v01', level: 'A1' },
  { id: 'q02', type: 'translate',   question: 'What does "happy" mean?',                options: ['triste', 'arrabbiato', 'felice', 'stanco'],    correctIndex: 2, explanation: '"Happy" significa felice o contento.',                    audioText: 'happy',                              relatedId: 'v07', level: 'A1' },
  { id: 'q03', type: 'fill-blank',  question: 'Please _____ the door.',                 options: ['close', 'listen', 'find', 'write'],            correctIndex: 0, explanation: '"Close the door" — chiudi la porta.',                    audioText: 'Please close the door.',             level: 'A1' },
  { id: 'q04', type: 'choose-form', question: 'Qual è il past simple di "go"?',         options: ['goed', 'gone', 'went', 'going'],               correctIndex: 2, explanation: '"Go" è ABC: go → went → gone.',                          audioText: 'went',                               relatedId: 'irr35', level: 'A1' },
  { id: 'q05', type: 'translate',   question: 'What does "however" mean?',              options: ['pertanto', 'tuttavia', 'invece', 'perciò'],    correctIndex: 1, explanation: '"However" è un connettore avversativo che significa tuttavia o comunque.', audioText: 'however', relatedId: 'v16', level: 'B1' },
  { id: 'q06', type: 'choose-form', question: 'Qual è il past participle di "write"?',  options: ['writed', 'wrote', 'written', 'writing'],       correctIndex: 2, explanation: '"Write" è ABC: write → wrote → written.',                audioText: 'written',                            relatedId: 'irr37', level: 'A1' },
  { id: 'q07', type: 'fill-blank',  question: 'She _____ a new phone yesterday.',       options: ['buyed', 'buys', 'bought', 'buying'],           correctIndex: 2, explanation: '"Buy" è ABB: buy → bought → bought.',                   audioText: 'She bought a new phone yesterday.',  relatedId: 'irr14', level: 'A1' },
  { id: 'q08', type: 'translate',   question: 'What is the meaning of "mitigate"?',     options: ['accelerare', 'mitigare / ridurre', 'cancellare', 'escludere'], correctIndex: 1, explanation: '"Mitigate" significa attenuare, mitigare o ridurre i rischi.', audioText: 'mitigate', relatedId: 'v26', level: 'B2' },
]

// ─────────────────────────────────────────
// 4. CATEGORIE TEMATICHE DI VOCABOLARIO
// ─────────────────────────────────────────
export interface CategoryVocabItem {
  id: string
  term: string
  translation: string
  ipa: string
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'other'
  example: string
  level?: 'A1' | 'A2' | 'B1' | 'B2'
}

export interface VocabCategory {
  id: string
  name: string
  nameIT: string
  emoji: string
  level?: 'A1' | 'A2' | 'B1' | 'B2'
  items: CategoryVocabItem[]
}

export const vocabCategories: VocabCategory[] = [
  // ── TRAVEL (A1-A2) ──
  {
    id: 'travel',
    name: 'TRAVEL',
    nameIT: 'Viaggi & Spostamenti',
    emoji: '✈',
    level: 'A1',
    items: [
      { id: 'tr01', term: 'airport',       translation: 'aeroporto',        ipa: '/ˈeər.pɔːrt/',       partOfSpeech: 'noun',      example: 'We arrived at the airport two hours early.' },
      { id: 'tr02', term: 'passport',      translation: 'passaporto',       ipa: '/ˈpɑːs.pɔːrt/',      partOfSpeech: 'noun',      example: 'Don\'t forget your passport when you travel abroad.' },
      { id: 'tr03', term: 'luggage',       translation: 'bagaglio',         ipa: '/ˈlʌɡ.ɪdʒ/',         partOfSpeech: 'noun',      example: 'She packed her luggage the night before the flight.' },
      { id: 'tr04', term: 'boarding pass', translation: 'carta d\'imbarco', ipa: '/ˈbɔːr.dɪŋ pæs/',    partOfSpeech: 'noun',      example: 'Please have your boarding pass ready at the gate.' },
      { id: 'tr05', term: 'destination',   translation: 'destinazione',     ipa: '/ˌdes.tɪˈneɪ.ʃən/',  partOfSpeech: 'noun',      example: 'Paris was our final destination on the tour.' },
      { id: 'tr06', term: 'reservation',   translation: 'prenotazione',     ipa: '/ˌrez.ər.ˈveɪ.ʃən/', partOfSpeech: 'noun',      example: 'I made a reservation at the hotel for three nights.' },
      { id: 'tr07', term: 'customs',       translation: 'dogana',           ipa: '/ˈkʌs.təmz/',         partOfSpeech: 'noun',      example: 'We had to wait in line at customs for an hour.' },
      { id: 'tr08', term: 'departure',     translation: 'partenza',         ipa: '/dɪˈpɑːr.tʃər/',     partOfSpeech: 'noun',      example: 'The departure gate is on the third floor.' },
    ],
  },

  // ── WORK (A2-B1) ──
  {
    id: 'work',
    name: 'WORK & CORPORATE',
    nameIT: 'Lavoro & Ufficio',
    emoji: '💼',
    level: 'A2',
    items: [
      { id: 'wk01', term: 'meeting',     translation: 'riunione',       ipa: '/ˈmiː.tɪŋ/',      partOfSpeech: 'noun',      example: 'We have a team meeting every Monday morning.' },
      { id: 'wk02', term: 'deadline',    translation: 'scadenza',       ipa: '/ˈded.laɪn/',     partOfSpeech: 'noun',      example: 'The deadline for the report is Friday at noon.' },
      { id: 'wk03', term: 'colleague',   translation: 'collega',        ipa: '/ˈkɒl.iːɡ/',      partOfSpeech: 'noun',      example: 'A colleague helped me with the presentation.' },
      { id: 'wk04', term: 'salary',      translation: 'stipendio',      ipa: '/ˈsæl.ər.i/',     partOfSpeech: 'noun',      example: 'She negotiated a higher salary with her boss.' },
      { id: 'wk05', term: 'interview',   translation: 'colloquio',      ipa: '/ˈɪn.tə.vjuː/',   partOfSpeech: 'noun',      example: 'He prepared carefully for the job interview.' },
      { id: 'wk06', term: 'contract',    translation: 'contratto',      ipa: '/ˈkɒn.trækt/',    partOfSpeech: 'noun',      example: 'Please read the contract before you sign it.' },
      { id: 'wk07', term: 'promotion',   translation: 'promozione',     ipa: '/prəˈmoʊ.ʃən/',   partOfSpeech: 'noun',      example: 'She got a promotion after two years in the company.' },
    ],
  },

  // ── PHRASAL VERBS & CONNECTORS (B1) ──
  {
    id: 'connectors-b1',
    name: 'CONNECTORS & PHRASALS',
    nameIT: 'Connettivi e Frasali B1',
    emoji: '🔗',
    level: 'B1',
    items: [
      { id: 'cb01', term: 'however',     translation: 'tuttavia',        ipa: '/haʊˈev.ər/',      partOfSpeech: 'adverb',    example: 'We had technical issues; however, we delivered on time.' },
      { id: 'cb02', term: 'although',    translation: 'sebbene',         ipa: '/ɔːlˈðoʊ/',        partOfSpeech: 'other',     example: 'Although the weather was harsh, flight tests continued.' },
      { id: 'cb03', term: 'whereas',     translation: 'mentre invece',   ipa: '/weərˈæz/',        partOfSpeech: 'other',     example: 'Option A is cost-effective, whereas Option B is more reliable.' },
      { id: 'cb04', term: 'call off',    translation: 'annullare',       ipa: '/kɔːl ɒf/',        partOfSpeech: 'verb',      example: 'Ground control called off the spacewalk due to a solar flare.' },
      { id: 'cb05', term: 'figure out',  translation: 'risolvere / capire', ipa: '/ˈfɪɡ.ər aʊt/',  partOfSpeech: 'verb',      example: 'The team figured out why the telemetry sensor fluctuated.' },
      { id: 'cb06', term: 'run out of',  translation: 'esaurire',        ipa: '/rʌn aʊt əv/',     partOfSpeech: 'verb',      example: 'We must not run out of fuel before orbital capture.' },
      { id: 'cb07', term: 'look forward to', translation: 'non vedere l\'ora di', ipa: '/lʊk ˈfɔːr.wəd tuː/', partOfSpeech: 'verb', example: 'We look forward to reviewing the telemetry output.' },
    ],
  },

  // ── AEROSPACE & MISSION CONTROL (B2) ──
  {
    id: 'aerospace-b2',
    name: 'AEROSPACE & MISSION',
    nameIT: 'Spazio & Telemetria B2',
    emoji: '🚀',
    level: 'B2',
    items: [
      { id: 'ae01', term: 'trajectory',  translation: 'traiettoria orbitale', ipa: '/trəˈdʒek.tər.i/', partOfSpeech: 'noun', example: 'The navigational computer recalculated the trajectory.' },
      { id: 'ae02', term: 'propulsion',  translation: 'propulsione',          ipa: '/prəˈpʌl.ʃən/',    partOfSpeech: 'noun', example: 'Secondary propulsion thrusters fired for eighteen seconds.' },
      { id: 'ae03', term: 'telemetry',   translation: 'telemetria',           ipa: '/təˈlem.ə.tri/',   partOfSpeech: 'noun', example: 'Downlink telemetry indicated nominal oxygen pressure.' },
      { id: 'ae04', term: 'heat shield', translation: 'scudo termico',        ipa: '/hiːt ʃiːld/',     partOfSpeech: 'noun', example: 'The ablative heat shield protected the capsule during re-entry.' },
      { id: 'ae05', term: 'docking',     translation: 'attracco / aggancio',  ipa: '/ˈdɒk.ɪŋ/',        partOfSpeech: 'noun', example: 'Automated docking maneuvers commenced at zero-six-hundred.' },
      { id: 'ae06', term: 'payload',     translation: 'carico utile',         ipa: '/ˈpeɪ.loʊd/',      partOfSpeech: 'noun', example: 'The payload consisted of scientific atmospheric spectrometers.' },
      { id: 'ae07', term: 'redundancy',  translation: 'ridondanza di sicurezza', ipa: '/rɪˈdʌn.dən.si/', partOfSpeech: 'noun', example: 'Triple redundancy prevents fatal navigation errors.' },
    ],
  },

  // ── BUSINESS IDIOMS (B2) ──
  {
    id: 'business-b2',
    name: 'BUSINESS IDIOMS',
    nameIT: 'Idiomi Professionali B2',
    emoji: '💡',
    level: 'B2',
    items: [
      { id: 'bi01', term: 'touch base',     translation: 'aggiornarsi brevemente', ipa: '/tʌtʃ beɪs/', partOfSpeech: 'verb',  example: 'Let us touch base tomorrow afternoon to align expectations.' },
      { id: 'bi02', term: 'on the same page', translation: 'sulla stessa lunghezza d\'onda', ipa: '/ɒn ðə seɪm peɪdʒ/', partOfSpeech: 'other', example: 'Ensure everyone is on the same page prior to execution.' },
      { id: 'bi03', term: 'cut corners',    translation: 'risparmiare a scapito della qualità', ipa: '/kʌt ˈkɔːr.nərz/', partOfSpeech: 'verb', example: 'We refuse to cut corners when pilot safety is at stake.' },
      { id: 'bi04', term: 'raise the bar',  translation: 'alzare l\'asticella / gli standard', ipa: '/reɪz ðə bɑːr/', partOfSpeech: 'verb', example: 'This engineering feat raised the bar for deep space missions.' },
      { id: 'bi05', term: 'benchmark',      translation: 'parametro di riferimento', ipa: '/ˈbentʃ.mɑːrk/', partOfSpeech: 'noun', example: 'Fuel efficiency remains our top industry benchmark.' },
    ],
  },
]

// ─────────────────────────────────────────
// 5. ASCOLTO (COMUNICAZIONI) — ALMENO 18 ESERCIZI (A1-B2)
// ─────────────────────────────────────────
export interface AudioClip {
  id: string
  title: string
  subtitle: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  durationSec: number
  text: string
  hint: string
}

export const LISTENING_CLIPS: AudioClip[] = [
  // ── A1 / A2 ──
  {
    id: 'clip-a1-1',
    title: 'ANNUNCIO AEROPORTUALE',
    subtitle: 'VOLO BA-482 · IMBARCO IMMEDIATO',
    level: 'A1',
    durationSec: 18,
    text: 'Attention all passengers on British Airways flight BA-482 to London Heathrow. The flight is now boarding at Gate 14. Please have your passport and boarding pass ready for inspection. This is the final call for all remaining passengers.',
    hint: 'Fai attenzione al numero del volo, alla destinazione e al gate di imbarco.',
  },
  {
    id: 'clip-a1-2',
    title: 'ORDINAZIONE AL CAFFÈ',
    subtitle: 'COLAZIONE E RICHIESTA CONTO',
    level: 'A1',
    durationSec: 16,
    text: 'Good morning! Could I please have a black coffee and a warm croissant? I will also take a bottle of sparkling water. Can I pay by card or do you only accept cash? Thank you very much, keep the change.',
    hint: 'Concentrati sulle bevande richieste e sulla modalità di pagamento.',
  },
  {
    id: 'clip-a2-1',
    title: 'BRIEFING TELEMETRICO BASE',
    subtitle: 'TELEMETRIA E PREPARAZIONE ACCENSIONE',
    level: 'A2',
    durationSec: 20,
    text: 'Mission control to crew. All telemetry systems are nominal. Atmospheric pressure and oxygen levels are stable at one hundred and one kilopascals. Prepare for primary engine ignition in two minutes. Acknowledge and confirm trajectory coordinates.',
    hint: 'Ascolta i parametri di pressione e i minuti che mancano all\'accensione dei motori.',
  },
  {
    id: 'clip-a2-2',
    title: 'CHECK-IN IN HOTEL',
    subtitle: 'PRENOTAZIONE E CONSEGNA CHIAVI',
    level: 'A2',
    durationSec: 17,
    text: 'Hello, I have a reservation under the name of Giacomo for two nights. Breakfast is included, right? Could you also tell me what time the gym opens in the morning and where the elevator is located?',
    hint: 'Nota le domande relative alla colazione, agli orari della palestra e all\'ascensore.',
  },
  {
    id: 'clip-a2-3',
    title: 'INDICAZIONI METROPOLITANA',
    subtitle: 'CAMBIO LINEA E BIGLIETTI',
    level: 'A2',
    durationSec: 19,
    text: 'Excuse me, how do I get to Victoria Station from here? You need to take the Central Line heading eastbound, change at Holborn to the Piccadilly Line, and then take the Victoria Line south. Buy a day travelcard at the machine.',
    hint: 'Ascolta la sequenza delle linee della metropolitana e la stazione di interscambio.',
  },

  // ── B1 (Phrasal verbs, connettori, lavoro e viaggi) ──
  {
    id: 'clip-b1-1',
    title: 'NEGOZIAZIONE DEADLINE SPRINT',
    subtitle: 'CONNETTORI LOGICI & PHRASAL VERBS',
    level: 'B1',
    durationSec: 24,
    text: 'Although we intended to ship the software patch today, the QA team ran into unexpected regression bugs. However, if we put in extra hours tonight, we can figure out the root cause and release before noon tomorrow without calling off the demo.',
    hint: 'Individua i connettori "although" e "however" assieme ai phrasal verbs "ran into", "figure out" e "calling off".',
  },
  {
    id: 'clip-b1-2',
    title: 'CANCELLAZIONE VOLO & COMPENSAZIONE',
    subtitle: 'DIRITTI PASSEGGERI E ROTTE ALTERNATIVE',
    level: 'B1',
    durationSec: 23,
    text: 'Due to severe headwinds over the North Sea, flight four-one-two has been called off. Whereas direct re-routing is unavailable tonight, we are offering hotel vouchers and meal allowances. Furthermore, passengers may claim statutory compensation online.',
    hint: 'Fai attenzione a "whereas", "called off" e "furthermore" riguardanti i voucher e la compensazione.',
  },
  {
    id: 'clip-b1-3',
    title: 'POLICY LAVORO DA REMOTO',
    subtitle: 'CONFRONTO PRODUTTIVITÀ E COLLABORAZIONE',
    level: 'B1',
    durationSec: 22,
    text: 'Our engineering department thrives with flexible remote hours; however, junior colleagues need hands-on mentoring. Although asynchronous communication is efficient, we expect everyone to catch up during our weekly retrospective on Mondays.',
    hint: 'Ascolta il compromesso tra flessibilità da remoto e la necessità di "catch up" e mentoring.',
  },
  {
    id: 'clip-b1-4',
    title: 'MANUTENZIONE PANNELLI SOLARI ORBITALI',
    subtitle: 'PROCEDURE EVA E PROTOCOLLI DI SICUREZZA',
    level: 'B1',
    durationSec: 25,
    text: 'Station commander to ground. The secondary solar array failed to align automatically. We looked into the servo telemetry and noticed a minor ice buildup. We are looking forward to the scheduled spacewalk tomorrow to clear the mechanical obstruction.',
    hint: 'Individua "looked into", "looking forward to" e la causa dell\'ostruzione meccanica.',
  },
  {
    id: 'clip-b1-5',
    title: 'COLLOQUIO DI SELEZIONE HUB LOGISTICO',
    subtitle: 'COMPETENZE E GESTIONE DELLO STRESS',
    level: 'B1',
    durationSec: 24,
    text: 'In my previous position as shift coordinator, I frequently dealt with conflicting deadlines. Although supply chain bottlenecks arose regularly, I always ensured drivers and warehouse teams stayed aligned by maintaining transparent daily briefings.',
    hint: 'Ascolta come il candidato ha gestito gli imprevisti e il connettore "although".',
  },
  {
    id: 'clip-b1-6',
    title: 'GUIDA CULTURALE DI EDIMBURGO',
    subtitle: 'PATRIMONIO STORICO E TRASPORTI URBANI',
    level: 'B1',
    durationSec: 22,
    text: 'Edinburgh Old Town retains a medieval atmosphere, whereas the Georgian New Town showcases neoclassical symmetry. If you plan to visit the Castle, book in advance; otherwise, queues can exceed two hours during the summer festival season.',
    hint: 'Fai attenzione al confronto espresso con "whereas" tra Old Town e New Town.',
  },

  // ── B2 (Linguaggio aerospaziale, idioms, strutture complesse) ──
  {
    id: 'clip-b2-1',
    title: 'DEBRIEFING RIENTRO ATMOSFERICO',
    subtitle: 'SCUDO TERMICO & PLANATA IPERSONICA',
    level: 'B2',
    durationSec: 27,
    text: 'Flight Dynamics Officer reporting. Had we not pitched the capsule fifteen degrees into the plasma corridor, the thermal tiles would have exceeded maximum tolerances. Telemetry confirms deceleration peaked at four point two Gs prior to drogue chute deployment.',
    hint: 'Nota la struttura ipotetica mista ("Had we not pitched...") e i dettagli tecnici sul picco di G e scudo termico.',
  },
  {
    id: 'clip-b2-2',
    title: 'GESTIONE CRISI AZIENDALE E BOARD MEETING',
    subtitle: 'RISCHI FINANZIARI & IDIOMS PROFESSIONALI',
    level: 'B2',
    durationSec: 26,
    text: 'Let us be completely candid: the engineering division cut corners to meet the quarterly milestone, and we are now paying the price. We need to raise the bar immediately, touch base with external auditors, and ensure all stakeholders are on the same page.',
    hint: 'Cattura gli idiomi "cut corners", "pay the price", "raise the bar", "touch base" e "on the same page".',
  },
  {
    id: 'clip-b2-3',
    title: 'OSSERVAZIONE CLIMATICA DA ORBITA BASSA',
    subtitle: 'ANALISI SPETTROMETRICA E DISCREPANZE',
    level: 'B2',
    durationSec: 28,
    text: 'Initial spectroscopic readings revealed anomalous methane concentrations across the arctic basin. Although preliminary algorithms attributed the anomaly to sensor calibration drift, cross-referenced lidar data confirmed significant permafrost degassing.',
    hint: 'Ascolta la distinzione tra la falsa ipotesi iniziale di calibrazione e il reale fenomeno riscontrato.',
  },
  {
    id: 'clip-b2-4',
    title: 'INTEGRAZIONE AI NEI PROTOCOLLI DI VOLO',
    subtitle: 'RIDONDANZA ALGORITMICA E VETO UMANO',
    level: 'B2',
    durationSec: 28,
    text: 'While neural networks can compute orbital re-entry burns within milliseconds, human veto power remains paramount. Subsystem redundancy ensures that should algorithmic hallucinations occur, analogue manual overrides will safeguard the crew automatically.',
    hint: 'Nota l\'uso formale di "paramount", "should algorithmic hallucinations occur" e il ruolo del veto umano.',
  },
  {
    id: 'clip-b2-5',
    title: 'ANALISI COSTI DI LANCIO E VENTURE CAPITAL',
    subtitle: 'PROIEZIONE FISCALE E BREAK-EVEN ORBITALE',
    level: 'B2',
    durationSec: 27,
    text: 'By reusing the booster first stage six consecutive times, launch amortisation plummeted by thirty-eight percent. Consequently, private satellite constellation operators are reaching their break-even benchmark two fiscal quarters ahead of projections.',
    hint: 'Fai attenzione alla percentuale di risparmio e al raggiungimento del benchmark con due trimestri di anticipo.',
  },
  {
    id: 'clip-b2-6',
    title: 'ADATTAMENTO CARDIOVASCOLARE IN ZERO-G',
    subtitle: 'TELEMETRIA BIOMEDICA DI LUNGA DURATA',
    level: 'B2',
    durationSec: 29,
    text: 'Prolonged microgravity exposure inexorably triggers fluid shifts toward the cranial cavity, which attenuates carotid baroreceptor reflexes. Rigorous resistive exercise counteracts muscle atrophy; nevertheless, post-landing orthostatic intolerance persists.',
    hint: 'Concentrati sul connettore "nevertheless" e sulle risposte fisiologiche descritte con precisione scientifica.',
  },
  {
    id: 'clip-b2-7',
    title: 'RICERCA PROPULSIONE NUCLEARE TERMICA',
    subtitle: 'RIDUZIONE TEMPI DI TRANSITO MARZIANO',
    level: 'B2',
    durationSec: 28,
    text: 'Transitioning from chemical rocketry to nuclear thermal propulsion doubles specific impulse, thereby slashing interplanetary transit time to Mars to less than one hundred days. This radical reduction dramatically mitigates cosmic radiation exposure.',
    hint: 'Ascolta come l\'impulso specifico dimezza i tempi di viaggio e mitiga l\'esposizione alle radiazioni.',
  },
]

// ─────────────────────────────────────────
// 6. VOCAL LINK (PARLATO) — ALMENO 25 FRASI (A1-B2)
// ─────────────────────────────────────────
export interface SpeakingPhrase {
  id: string
  text: string
  translation: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  ipa?: string
}

export const SPEAKING_PHRASES: SpeakingPhrase[] = [
  // ── A1 / A2 ──
  {
    id: 'spk-a1-1',
    text: 'Could you please tell me where the nearest train station is?',
    translation: 'Potresti dirmi per favore dov\'è la stazione dei treni più vicina?',
    level: 'A1',
    ipa: '/kʊd juː pliːz tel miː weər ðə ˈnɪə.rɪst treɪn ˈsteɪ.ʃən ɪz/',
  },
  {
    id: 'spk-a1-2',
    text: 'I would like to order a warm cup of coffee and a glass of water.',
    translation: 'Vorrei ordinare una tazza di caffè caldo e un bicchiere d\'acqua.',
    level: 'A1',
    ipa: '/aɪ wʊd laɪk tuː ˈɔː.dər ə wɔːm kʌp əv ˈkɒf.i/',
  },
  {
    id: 'spk-a2-1',
    text: 'I would like to improve my English speaking skills every single day.',
    translation: 'Vorrei migliorare le mie abilità di conversazione in inglese ogni singolo giorno.',
    level: 'A2',
    ipa: '/aɪ wʊd laɪk tuː ɪmˈpruːv maɪ ˈɪŋ.ɡlɪʃ ˈspiː.kɪŋ skɪlz ˈev.ri ˈsɪŋ.ɡəl deɪ/',
  },
  {
    id: 'spk-a2-2',
    text: 'The weather is exceptionally pleasant this morning in the city.',
    translation: 'Il tempo è eccezionalmente piacevole questa mattina in città.',
    level: 'A2',
    ipa: '/ðə ˈweð.ər ɪz ɪkˈsep.ʃən.əl.i ˈplez.ənt ðɪs ˈmɔːr.nɪŋ ɪn ðə ˈsɪt.i/',
  },
  {
    id: 'spk-a2-3',
    text: 'We bought two return tickets for the express train to London.',
    translation: 'Abbiamo comprato due biglietti di andata e ritorno per il treno espresso per Londra.',
    level: 'A2',
    ipa: '/wiː bɔːt tuː rɪˈtɜːn ˈtɪk.ɪts fɔːr ðiː ɪkˈspres treɪn tuː ˈlʌn.dən/',
  },
  {
    id: 'spk-a2-4',
    text: 'She has worked as an aeronautical engineer for over five years.',
    translation: 'Lavora come ingegnere aeronautico da oltre cinque anni.',
    level: 'A2',
    ipa: '/ʃiː hæz wɜːkt æz æn ˌeə.rəˈnɔː.tɪ.kəl ˌen.dʒɪˈnɪər fɔːr ˈoʊ.vər faɪv jɪəz/',
  },

  // ── B1 (Phrasal verbs, connettori, lavoro) ──
  {
    id: 'spk-b1-1',
    text: 'We need to schedule an important team meeting before Friday afternoon.',
    translation: 'Dobbiamo programmare un\'importante riunione di team prima di venerdì pomeriggio.',
    level: 'B1',
    ipa: '/wiː niːd tuː ˈskedʒ.uːl ən ɪmˈpɔːr.tənt tiːm ˈmiː.tɪŋ bɪˈfɔːr ˈfraɪ.deɪ ˌɑːf.təˈnuːn/',
  },
  {
    id: 'spk-b1-2',
    text: 'Although the launch schedule was tight, the engineering squad delivered on time.',
    translation: 'Sebbene il calendario di lancio fosse serrato, la squadra di ingegneri ha consegnato in orario.',
    level: 'B1',
    ipa: '/ɔːlˈðoʊ ðə lɔːntʃ ˈskedʒ.uːl wɒz taɪt ðə ˌen.dʒɪˈnɪə.rɪŋ skwɒd dɪˈlɪv.əd ɒn taɪm/',
  },
  {
    id: 'spk-b1-3',
    text: 'I am really looking forward to collaborating with your international department.',
    translation: 'Non vedo davvero l\'ora di collaborare con il vostro dipartimento internazionale.',
    level: 'B1',
    ipa: '/aɪ æm ˈrɪə.li ˈlʊk.ɪŋ ˈfɔː.wəd tuː kəˈlæb.ə.reɪt wɪð jɔːr ˌɪn.təˈnæʃ.ən.əl dɪˈpɑːt.mənt/',
  },
  {
    id: 'spk-b1-4',
    text: 'We cannot afford to run out of electrical power during atmospheric testing.',
    translation: 'Non possiamo permetterci di esaurire l\'energia elettrica durante i test atmosferici.',
    level: 'B1',
    ipa: '/wiː ˈkæn.ɒt əˈfɔːd tuː rʌn aʊt əv ɪˈlek.trɪ.kəl paʊər ˈdjʊə.rɪŋ ˌæt.məsˈfer.ɪk ˈtes.tɪŋ/',
  },
  {
    id: 'spk-b1-5',
    text: 'The flight was delayed; however, our contingency protocol prevented any panic.',
    translation: 'Il volo è stato ritardato; tuttavia, il nostro protocollo di emergenza ha prevenuto il panico.',
    level: 'B1',
    ipa: '/ðə flaɪt wɒz dɪˈleɪd haʊˈev.ər ˈaʊə kənˈtɪn.dʒən.si ˈproʊ.tə.kɒl prɪˈven.tɪd ˈen.i ˈpæn.ɪk/',
  },
  {
    id: 'spk-b1-6',
    text: 'Can you please figure out why the communication channel dropped five minutes ago?',
    translation: 'Puoi capire per favore perché il canale di comunicazione è caduto cinque minuti fa?',
    level: 'B1',
    ipa: '/kæn juː pliːz ˈfɪɡ.ər aʊt waɪ ðə kəˌmjuː.nɪˈkeɪ.ʃən ˈtʃæn.əl drɒpt faɪv ˈmɪn.ɪts əˈɡoʊ/',
  },
  {
    id: 'spk-b1-7',
    text: 'Our team prefers agile methodologies, whereas management favors strict milestones.',
    translation: 'Il nostro team preferisce metodologie agili, mentre invece il management predilige tappe rigide.',
    level: 'B1',
    ipa: '/ˈaʊə tiːm prɪˈfɜːz ˈædʒ.aɪl ˌmeθ.əˈdɒl.ə.dʒiz weərˈæz ˈmæn.ɪdʒ.mənt ˈfeɪ.vəz strɪkt ˈmaɪl.stoʊnz/',
  },

  // ── B2 (Idioms professionali, aerospaziale, periodi ipotetici) ──
  {
    id: 'spk-b2-1',
    text: 'Let us touch base tomorrow morning to ensure our entire squad is on the same page.',
    translation: 'Aggiorniamoci domani mattina per assicurarci che tutta la squadra sia sulla stessa lunghezza d\'onda.',
    level: 'B2',
    ipa: '/let ʌs tʌtʃ beɪs təˈmɒr.oʊ ˈmɔː.nɪŋ tuː ɪnˈʃɔːr ˈaʊə ɪnˈtaɪə skwɒd ɪz ɒn ðə seɪm peɪdʒ/',
  },
  {
    id: 'spk-b2-2',
    text: 'Under no circumstances should we cut corners when orbital telemetry indicates anomaly.',
    translation: 'In nessun caso dovremmo prendere scorciatoie quando la telemetria orbitale indica un\'anomalia.',
    level: 'B2',
    ipa: '/ˈʌn.dər noʊ ˈsɜː.kəm.stæn.sɪz ʃʊd wiː kʌt ˈkɔː.nərz wen ˈɔː.bɪ.təl təˈlem.ə.tri ˈɪn.dɪ.keɪts əˈnɒm.ə.li/',
  },
  {
    id: 'spk-b2-3',
    text: 'If we had verified the heat shield density earlier, we would not be facing re-entry risks now.',
    translation: 'Se avessimo verificato prima la densità dello scudo termico, ora non affronteremmo rischi di rientro.',
    level: 'B2',
    ipa: '/ɪf wiː hæd ˈver.ɪ.faɪd ðə hiːt ʃiːld ˈden.sɪ.ti ˈɜː.li.ər wiː wʊd nɒt biː ˈfeɪ.sɪŋ riːˈen.tri rɪsks naʊ/',
  },
  {
    id: 'spk-b2-4',
    text: 'The ion propulsion engines raised the benchmark for deep space autonomous navigation.',
    translation: 'I motori a propulsione ionica hanno alzato l\'asticella per la navigazione autonoma nello spazio profondo.',
    level: 'B2',
    ipa: '/ðiː ˈaɪ.ɒn prəˈpʌl.ʃən ˈen.dʒɪnz reɪzd ðə ˈbentʃ.mɑːk fɔːr diːp speɪs ɔːˈtɒn.ə.məs ˌnæv.ɪˈɡeɪ.ʃən/',
  },
  {
    id: 'spk-b2-5',
    text: 'We must proactively mitigate thermal radiation risks before initiating the lunar descent burn.',
    translation: 'Dobbiamo mitigare proattivamente i rischi di radiazione termica prima di iniziare la frenata di discesa lunare.',
    level: 'B2',
    ipa: '/wiː mʌst ˌproʊˈæk.tɪv.li ˈmɪt.ɪ.ɡeɪt ˈθɜː.məl ˌreɪ.diˈeɪ.ʃən rɪsks bɪˈfɔːr ɪˈnɪʃ.i.eɪ.tɪŋ ðə ˈluː.nər dɪˈsent bɜːn/',
  },
  {
    id: 'spk-b2-6',
    text: 'Triple subsystem redundancy was intentionally implemented to eliminate single points of failure.',
    translation: 'La tripla ridondanza di sottosistema è stata implementata intenzionalmente per eliminare i singoli punti di guasto.',
    level: 'B2',
    ipa: '/ˈtrɪp.əl ˈsʌb.sɪs.təm rɪˈdʌn.dən.si wɒz ɪnˈten.ʃən.əl.i ˈɪm.plɪ.men.tɪd tuː ɪˈlɪm.ɪ.neɪt ˈsɪŋ.ɡəl pɔɪnts əv ˈfeɪ.ljər/',
  },
  {
    id: 'spk-b2-7',
    text: 'Had the orbital computer encountered severe latency, the pilot would have taken manual control.',
    translation: 'Se il computer orbitale avesse riscontrato una forte latenza, il pilota avrebbe preso il controllo manuale.',
    level: 'B2',
    ipa: '/hæd ðiː ˈɔː.bɪ.təl kəmˈpjuː.tər ɪnˈkaʊn.təd sɪˈvɪər ˈleɪ.tən.si ðə ˈpaɪ.lət wʊd hæv ˈteɪ.kən ˈmæn.ju.əl kənˈtroʊl/',
  },
  {
    id: 'spk-b2-8',
    text: 'Cross-functional engineering alignment is indispensable when executing complex orbital maneuvers.',
    translation: 'L\'allineamento ingegneristico interfunzionale è indispensabile quando si eseguono manovre orbitali complesse.',
    level: 'B2',
    ipa: '/krɒs ˈfʌŋk.ʃən.əl ˌen.dʒɪˈnɪə.rɪŋ əˈlaɪn.mənt ɪz ˌɪn.dɪˈspen.sə.bəl wen ˈek.sɪ.kjuː.tɪŋ ˈkɒm.pleks ˈɔː.bɪ.təl məˈnuː.vərz/',
  },
]

// ─────────────────────────────────────────
// 7. SCRITTURA (LOGBOOK) — ALMENO 13 TRACCE (A1-B2)
// ─────────────────────────────────────────
export interface WritingPrompt {
  id: string
  title: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  taskIT: string
  minWords: number
  maxWords: number
  suggestedKeywords: string[]
  exampleSentence: string
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  // ── A1 / A2 ──
  {
    id: 'pr-routine',
    title: 'DAILY ROUTINE',
    level: 'A1',
    taskIT: 'Descrivi la tua routine mattutina tipica in 50-80 parole. Racconta a che ora ti svegli, cosa fai per prima cosa, cosa mangi o bevi a colazione e come ti prepari per la giornata.',
    minWords: 50,
    maxWords: 80,
    suggestedKeywords: ['wake up', 'morning', 'breakfast', 'coffee', 'shower', 'start', 'first'],
    exampleSentence: 'Every morning I wake up early, drink a warm cup of coffee and get ready for work.',
  },
  {
    id: 'pr-travel',
    title: 'TRAVEL MEMORY',
    level: 'A2',
    taskIT: 'Descrivi un viaggio o una città che hai visitato in 50-80 parole. Spiega dove sei andato, quale mezzo di trasporto hai utilizzato e cosa ti ha colpito maggiormente dell\'esperienza.',
    minWords: 50,
    maxWords: 80,
    suggestedKeywords: ['travel', 'visit', 'hotel', 'beautiful', 'city', 'trip', 'enjoy'],
    exampleSentence: 'Last summer I traveled to London and visited several historic museums across the city.',
  },
  {
    id: 'pr-tech',
    title: 'TECH & WORK ENVIRONMENT',
    level: 'A2',
    taskIT: 'Descrivi il tuo ambiente di lavoro o una tecnologia che utilizzi ogni giorno in 50-80 parole. Spiega perché è utile, come collabori con gli altri e quali strumenti preferisci.',
    minWords: 50,
    maxWords: 80,
    suggestedKeywords: ['project', 'technology', 'team', 'software', 'learn', 'computer', 'work'],
    exampleSentence: 'In our software development team we use modern technology to build fast web applications.',
  },

  // ── B1 (Lavoro, Connettori, Viaggi e Relazioni) ──
  {
    id: 'pr-b1-complaint',
    title: 'TRAVEL DELAY COMPLAINT',
    level: 'B1',
    taskIT: 'Scrivi un\'email formale di reclamo alla compagnia aerea in 70-110 parole per un volo cancellato senza preavviso. Richiedi rimborso e spiega i disagi subiti usando connettori (however, although).',
    minWords: 70,
    maxWords: 110,
    suggestedKeywords: ['however', 'although', 'compensation', 'cancelled', 'refund', 'delay', 'inconvenience'],
    exampleSentence: 'Although our flight was cancelled without notice, we received no meal vouchers at the airport; however, we expect a statutory refund.',
  },
  {
    id: 'pr-b1-deadline',
    title: 'PROJECT TIMELINE ADJUSTMENT',
    level: 'B1',
    taskIT: 'Scrivi un aggiornamento al tuo manager in 70-110 parole spiegando perché la scadenza del progetto deve essere posticipata di una settimana. Utilizza phrasal verbs (run into, figure out, look forward).',
    minWords: 70,
    maxWords: 110,
    suggestedKeywords: ['deadline', 'figure out', 'run into', 'schedule', 'deliver', 'look forward', 'milestone'],
    exampleSentence: 'Our development squad ran into unexpected server latency, but we are confident we will figure out a resolution and deliver next Monday.',
  },
  {
    id: 'pr-b1-culture',
    title: 'TRADITION & CONTEMPORARY LIFE',
    level: 'B1',
    taskIT: 'Confronta una festa o tradizione del tuo paese con lo stile di vita moderno in 70-110 parole. Utilizza "whereas" e "furthermore" per strutturare l\'argomentazione.',
    minWords: 70,
    maxWords: 110,
    suggestedKeywords: ['whereas', 'furthermore', 'tradition', 'celebrate', 'family', 'modern', 'community'],
    exampleSentence: 'Younger generations often celebrate holidays through digital gatherings, whereas older relatives value long seated dinners with traditional recipes.',
  },
  {
    id: 'pr-b1-remote-policy',
    title: 'REMOTE WORK HYBRID PROPOSAL',
    level: 'B1',
    taskIT: 'Proponi una policy di lavoro ibrido in 70-110 parole per conciliare produttività da remoto e collaborazione in sede. Argomenta i vantaggi per il benessere e i risultati aziendali.',
    minWords: 70,
    maxWords: 110,
    suggestedKeywords: ['remote', 'flexible', 'productivity', 'colleague', 'office', 'efficient', 'well-being'],
    exampleSentence: 'A hybrid model empowers colleagues to focus without office distractions on analytical tasks, while dedicating collaborative days to strategic alignment.',
  },

  // ── B2 (Report aerospaziali, proposte corporate, analisi di rischio) ──
  {
    id: 'pr-b2-incident-report',
    title: 'MISSION ANOMALY POST-MORTEM',
    level: 'B2',
    taskIT: 'Redigi un rapporto tecnico post-incidente di 90-140 parole su un\'anomalia di telemetria durante il volo orbitale. Spiega la causa principale, come è stata mitigata e le raccomandazioni future.',
    minWords: 90,
    maxWords: 140,
    suggestedKeywords: ['telemetry', 'mitigate', 'trajectory', 'redundancy', 'anomaly', 'investigation', 'benchmark'],
    exampleSentence: 'Following the auxiliary thruster anomaly at altitude four hundred kilometers, automated redundancy systems mitigated immediate trajectory drift before manual intervention was required.',
  },
  {
    id: 'pr-b2-risk-assessment',
    title: 'CORPORATE RISK MITIGATION PROPOSAL',
    level: 'B2',
    taskIT: 'Componi una proposta formale di valutazione del rischio per il consiglio di amministrazione in 90-140 parole. Utilizza idiomi professionali (touch base, cut corners, on the same page).',
    minWords: 90,
    maxWords: 140,
    suggestedKeywords: ['touch base', 'cut corners', 'on the same page', 'mitigate', 'stakeholder', 'compliance', 'benchmark'],
    exampleSentence: 'Under no circumstances should the executive board cut corners regarding cybersecurity compliance; instead, we must touch base with external auditors to ensure all stakeholders remain on the same page.',
  },
  {
    id: 'pr-b2-reentry-debrief',
    title: 'ATMOSPHERIC RE-ENTRY FLIGHT LOG',
    level: 'B2',
    taskIT: 'Scrivi un logbook di rientro atmosferico in 90-140 parole dal punto di vista del comandante di missione. Utilizza strutture ipotetiche (Had we not...) e linguaggio aerospaziale formale.',
    minWords: 90,
    maxWords: 140,
    suggestedKeywords: ['had we not', 'heat shield', 'propulsion', 'plasma', 'velocity', 'deceleration', 'nominal'],
    exampleSentence: 'Had we not executed the de-orbit burn precisely at zero-three-hundred UTC, the thermal heat shield would have experienced supercritical friction during hypersonic atmospheric penetration.',
  },
  {
    id: 'pr-b2-ai-ethics',
    title: 'AUTONOMOUS AVIONICS ETHICAL FRAMEWORK',
    level: 'B2',
    taskIT: 'Argomenta in 90-140 parole l\'integrazione di sistemi di intelligenza artificiale nella navigazione spaziale rispetto al principio del controllo umano ultimo. Usa connettivi complessi (nevertheless, thereby).',
    minWords: 90,
    maxWords: 140,
    suggestedKeywords: ['nevertheless', 'thereby', 'autonomous', 'algorithm', 'oversight', 'redundancy', 'decision-making'],
    exampleSentence: 'Automated algorithms compute planetary trajectories with unprecedented speed, thereby eliminating human calculation fatigue; nevertheless, human veto oversight remains ethically non-negotiable.',
  },
  {
    id: 'pr-b2-commercial-pitch',
    title: 'ORBITAL INFRASTRUCTURE INVESTMENT PITCH',
    level: 'B2',
    taskIT: 'Presenta una proposta commerciale in 90-140 parole rivolta a investitori istituzionali per finanziare una flotta di satelliti riutilizzabili. Evidenzia il break-even point e il vantaggio competitivo.',
    minWords: 90,
    maxWords: 140,
    suggestedKeywords: ['investment', 'amortisation', 'break-even', 'propulsion', 'constellation', 'revenue', 'raise the bar'],
    exampleSentence: 'By capitalizing on multi-flight booster reusability, our orbital deployment architecture slashes launch amortisation by forty percent, raising the bar for sustainable space commercialisation.',
  },
  {
    id: 'pr-b2-scientific-abstract',
    title: 'EXOPLANETARY ATMOSPHERE ABSTRACT',
    level: 'B2',
    taskIT: 'Redigi l\'abstract scientifico di 90-140 parole di una pubblicazione sulla rilevazione di biofirme atmosferiche mediante spettroscopia orbitale ad alta risoluzione.',
    minWords: 90,
    maxWords: 140,
    suggestedKeywords: ['spectroscopy', 'biosignature', 'wavelength', 'observation', 'hypothesis', 'data', 'significant'],
    exampleSentence: 'High-resolution transmission spectroscopy acquired by the orbital observatory confirmed absorption features consistent with atmospheric water vapor and trace methane equilibrium.',
  },
]
