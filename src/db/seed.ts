// ============================================================
//  SEED DATA — English Mission Control
//  A1 Vocabulary · Irregular Verbs (38) · Quiz Items · Vocab Categories
// ============================================================

// ─────────────────────────────────────────
// 1. VOCABOLI A1 (15 items) — usati da SRS / Review
// ─────────────────────────────────────────
export interface VocabItem {
  id: string
  term: string
  translation: string
  ipa: string
  category: 'sostantivo' | 'aggettivo' | 'avverbio' | 'verbo' | 'preposizione'
  examples: string[]
  audioHint?: string
}

export const vocabulary: VocabItem[] = [
  { id: 'v01', term: 'apple',     translation: 'mela',               ipa: '/ˈæp.əl/',       category: 'sostantivo', examples: ['I eat an apple every morning.', 'The apple is red and sweet.'] },
  { id: 'v02', term: 'book',      translation: 'libro',              ipa: '/bʊk/',           category: 'sostantivo', examples: ['This book is very interesting.', 'She reads a book before bed.'] },
  { id: 'v03', term: 'cat',       translation: 'gatto',              ipa: '/kæt/',           category: 'sostantivo', examples: ['The cat sleeps on the sofa.', 'My cat is black and white.'] },
  { id: 'v04', term: 'door',      translation: 'porta',              ipa: '/dɔːr/',          category: 'sostantivo', examples: ['Please close the door.', 'The door is made of wood.'] },
  { id: 'v05', term: 'early',     translation: 'presto',             ipa: '/ˈɜːr.li/',       category: 'avverbio',   examples: ['She wakes up early every day.', 'We arrived early at the airport.'] },
  { id: 'v06', term: 'friend',    translation: 'amico / amica',      ipa: '/frɛnd/',         category: 'sostantivo', examples: ['He is my best friend.', 'We met a new friend at school.'] },
  { id: 'v07', term: 'happy',     translation: 'felice / contento',  ipa: '/ˈhæp.i/',        category: 'aggettivo',  examples: ['I am happy to see you.', 'The children look very happy.'] },
  { id: 'v08', term: 'house',     translation: 'casa',               ipa: '/haʊs/',          category: 'sostantivo', examples: ['We live in a small house.', 'The house has a beautiful garden.'] },
  { id: 'v09', term: 'important', translation: 'importante',         ipa: '/ɪmˈpɔːr.tənt/', category: 'aggettivo',  examples: ['It is important to study every day.', 'This is a very important meeting.'] },
  { id: 'v10', term: 'job',       translation: 'lavoro / impiego',   ipa: '/dʒɒb/',          category: 'sostantivo', examples: ['She has a new job in the city.', 'Finding a job can be difficult.'] },
  { id: 'v11', term: 'key',       translation: 'chiave',             ipa: '/kiː/',           category: 'sostantivo', examples: ['I lost my key again.', 'The key is on the table.'] },
  { id: 'v12', term: 'listen',    translation: 'ascoltare',          ipa: '/ˈlɪs.ən/',       category: 'verbo',      examples: ['Please listen carefully.', 'I listen to music while studying.'] },
  { id: 'v13', term: 'morning',   translation: 'mattina',            ipa: '/ˈmɔːr.nɪŋ/',    category: 'sostantivo', examples: ['Good morning! How are you?', 'I go for a run every morning.'] },
  { id: 'v14', term: 'night',     translation: 'notte',              ipa: '/naɪt/',          category: 'sostantivo', examples: ['The stars shine at night.', 'Good night, sleep well.'] },
  { id: 'v15', term: 'open',      translation: 'aprire / aperto',    ipa: '/ˈoʊ.pən/',       category: 'verbo',      examples: ['Can you open the window?', 'The shop is open from nine to six.'] },
]

// ─────────────────────────────────────────
// 2. VERBI IRREGOLARI (38 items, A1–B1)
//    Pattern:
//      AAA  base = past = past participle
//      ABA  base = past participle ≠ past
//      ABB  past = past participle ≠ base
//      ABC  tutte e tre le forme diverse
// ─────────────────────────────────────────
export type IrregularPattern = 'AAA' | 'ABA' | 'ABB' | 'ABC'

export interface IrregularVerb {
  id: string
  base: string
  past: string
  pastParticiple: string
  translation: string
  pattern: IrregularPattern
  level: 'A1' | 'A2' | 'B1'
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

  // ── ABA ─────────────────────────────────
  { id: 'irr08', base: 'come',      past: 'came',     pastParticiple: 'come',      translation: 'venire',                pattern: 'ABA', level: 'A1', example: 'She came home very late last night.' },
  { id: 'irr09', base: 'run',       past: 'ran',      pastParticiple: 'run',       translation: 'correre',               pattern: 'ABA', level: 'A1', example: 'He ran a marathon last year.' },
  { id: 'irr10', base: 'become',    past: 'became',   pastParticiple: 'become',    translation: 'diventare',             pattern: 'ABA', level: 'A2', example: 'She became a doctor after many years.' },

  // ── ABB ─────────────────────────────────
  { id: 'irr11', base: 'buy',       past: 'bought',   pastParticiple: 'bought',    translation: 'comprare',              pattern: 'ABB', level: 'A1', example: 'I bought a new phone yesterday.' },
  { id: 'irr12', base: 'find',      past: 'found',    pastParticiple: 'found',     translation: 'trovare',               pattern: 'ABB', level: 'A1', example: 'We found a great restaurant.' },
  { id: 'irr13', base: 'think',     past: 'thought',  pastParticiple: 'thought',   translation: 'pensare',               pattern: 'ABB', level: 'A1', example: 'I thought about you all day.' },
  { id: 'irr14', base: 'make',      past: 'made',     pastParticiple: 'made',      translation: 'fare / costruire',      pattern: 'ABB', level: 'A1', example: 'She made a delicious cake.' },
  { id: 'irr15', base: 'teach',     past: 'taught',   pastParticiple: 'taught',    translation: 'insegnare',             pattern: 'ABB', level: 'A2', example: 'He taught English for twenty years.' },
  { id: 'irr16', base: 'sell',      past: 'sold',     pastParticiple: 'sold',      translation: 'vendere',               pattern: 'ABB', level: 'A2', example: 'They sold their house last spring.' },
  { id: 'irr17', base: 'tell',      past: 'told',     pastParticiple: 'told',      translation: 'dire / raccontare',     pattern: 'ABB', level: 'A1', example: 'She told me an interesting story.' },
  { id: 'irr18', base: 'feel',      past: 'felt',     pastParticiple: 'felt',      translation: 'sentire / provare',     pattern: 'ABB', level: 'A2', example: 'I felt very tired after the game.' },
  { id: 'irr19', base: 'keep',      past: 'kept',     pastParticiple: 'kept',      translation: 'tenere / mantenere',    pattern: 'ABB', level: 'A2', example: 'He kept his promise to the end.' },
  { id: 'irr20', base: 'leave',     past: 'left',     pastParticiple: 'left',      translation: 'lasciare / partire',    pattern: 'ABB', level: 'A2', example: 'She left the office at six.' },
  { id: 'irr21', base: 'catch',     past: 'caught',   pastParticiple: 'caught',    translation: 'prendere / afferrare', pattern: 'ABB', level: 'A2', example: 'He caught the ball with one hand.' },
  { id: 'irr22', base: 'win',       past: 'won',      pastParticiple: 'won',       translation: 'vincere',               pattern: 'ABB', level: 'A2', example: 'Our team won the championship.' },
  { id: 'irr23', base: 'meet',      past: 'met',      pastParticiple: 'met',       translation: 'incontrare',            pattern: 'ABB', level: 'A1', example: 'I met my best friend at university.' },
  { id: 'irr24', base: 'pay',       past: 'paid',     pastParticiple: 'paid',      translation: 'pagare',                pattern: 'ABB', level: 'A2', example: 'He paid the bill in cash.' },
  { id: 'irr25', base: 'build',     past: 'built',    pastParticiple: 'built',     translation: 'costruire',             pattern: 'ABB', level: 'B1', example: 'They built a new school in the town.' },
  { id: 'irr26', base: 'lose',      past: 'lost',     pastParticiple: 'lost',      translation: 'perdere',               pattern: 'ABB', level: 'A2', example: 'She lost her keys this morning.' },
  { id: 'irr27', base: 'send',      past: 'sent',     pastParticiple: 'sent',      translation: 'inviare / mandare',     pattern: 'ABB', level: 'A2', example: 'He sent an email to the manager.' },
  { id: 'irr28', base: 'spend',     past: 'spent',    pastParticiple: 'spent',     translation: 'spendere / trascorrere',pattern: 'ABB', level: 'A2', example: 'We spent the weekend at the beach.' },

  // ── ABC ─────────────────────────────────
  { id: 'irr29', base: 'go',        past: 'went',     pastParticiple: 'gone',      translation: 'andare',                pattern: 'ABC', level: 'A1', example: 'We went to the park last Sunday.' },
  { id: 'irr30', base: 'speak',     past: 'spoke',    pastParticiple: 'spoken',    translation: 'parlare',               pattern: 'ABC', level: 'A1', example: 'He spoke English very well.' },
  { id: 'irr31', base: 'write',     past: 'wrote',    pastParticiple: 'written',   translation: 'scrivere',              pattern: 'ABC', level: 'A1', example: 'She wrote a long letter to her friend.' },
  { id: 'irr32', base: 'begin',     past: 'began',    pastParticiple: 'begun',     translation: 'cominciare',            pattern: 'ABC', level: 'A2', example: 'The concert began at eight o\'clock.' },
  { id: 'irr33', base: 'drink',     past: 'drank',    pastParticiple: 'drunk',     translation: 'bere',                  pattern: 'ABC', level: 'A1', example: 'He drank two cups of coffee.' },
  { id: 'irr34', base: 'take',      past: 'took',     pastParticiple: 'taken',     translation: 'prendere / portare',    pattern: 'ABC', level: 'A1', example: 'She took the bus to work today.' },
  { id: 'irr35', base: 'give',      past: 'gave',     pastParticiple: 'given',     translation: 'dare',                  pattern: 'ABC', level: 'A1', example: 'He gave her a beautiful gift.' },
  { id: 'irr36', base: 'see',       past: 'saw',      pastParticiple: 'seen',      translation: 'vedere',                pattern: 'ABC', level: 'A1', example: 'I saw a great film last night.' },
  { id: 'irr37', base: 'break',     past: 'broke',    pastParticiple: 'broken',    translation: 'rompere / spezzare',    pattern: 'ABC', level: 'A2', example: 'He broke his leg skiing.' },
  { id: 'irr38', base: 'choose',    past: 'chose',    pastParticiple: 'chosen',    translation: 'scegliere',             pattern: 'ABC', level: 'B1', example: 'She chose the blue dress for the party.' },
]

// ─────────────────────────────────────────
// 3. QUIZ ITEMS per il Core Loop (8 quesiti)
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
}

export const quizItems: QuizItem[] = [
  { id: 'q01', type: 'translate',   question: 'Come si dice "mela" in inglese?',        options: ['orange', 'apple', 'pear', 'grape'],            correctIndex: 1, explanation: '"Apple" significa mela. Pronuncia: /ˈæp.əl/',              audioText: 'apple',                              relatedId: 'v01' },
  { id: 'q02', type: 'translate',   question: 'What does "happy" mean?',                options: ['triste', 'arrabbiato', 'felice', 'stanco'],    correctIndex: 2, explanation: '"Happy" significa felice o contento.',                    audioText: 'happy',                              relatedId: 'v07' },
  { id: 'q03', type: 'fill-blank',  question: 'Please _____ the door.',                 options: ['close', 'listen', 'find', 'write'],            correctIndex: 0, explanation: '"Close the door" — chiudi la porta.',                    audioText: 'Please close the door.' },
  { id: 'q04', type: 'choose-form', question: 'Qual è il past simple di "go"?',         options: ['goed', 'gone', 'went', 'going'],               correctIndex: 2, explanation: '"Go" è ABC: go → went → gone.',                          audioText: 'went',                               relatedId: 'irr29' },
  { id: 'q05', type: 'translate',   question: 'What does "important" mean?',            options: ['possibile', 'importante', 'interessante', 'impossibile'], correctIndex: 1, explanation: '"Important" significa importante.',         audioText: 'important',                          relatedId: 'v09' },
  { id: 'q06', type: 'choose-form', question: 'Qual è il past participle di "write"?',  options: ['writed', 'wrote', 'written', 'writing'],       correctIndex: 2, explanation: '"Write" è ABC: write → wrote → written.',                audioText: 'written',                            relatedId: 'irr31' },
  { id: 'q07', type: 'fill-blank',  question: 'She _____ a new phone yesterday.',       options: ['buyed', 'buys', 'bought', 'buying'],           correctIndex: 2, explanation: '"Buy" è ABB: buy → bought → bought.',                   audioText: 'She bought a new phone yesterday.',  relatedId: 'irr11' },
  { id: 'q08', type: 'translate',   question: 'Come si dice "mattina" in inglese?',     options: ['night', 'evening', 'afternoon', 'morning'],    correctIndex: 3, explanation: '"Morning" significa mattina. /ˈmɔːr.nɪŋ/',              audioText: 'morning',                            relatedId: 'v13' },
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
  example: string   // English example sentence
}

export interface VocabCategory {
  id: string
  name: string     // MAIUSCOLO
  nameIT: string   // Italiano
  emoji: string
  items: CategoryVocabItem[]
}

export const vocabCategories: VocabCategory[] = [
  // ── TRAVEL ──────────────────────────────
  {
    id: 'travel',
    name: 'TRAVEL',
    nameIT: 'Viaggi',
    emoji: '✈',
    items: [
      { id: 'tr01', term: 'airport',       translation: 'aeroporto',        ipa: '/ˈeər.pɔːrt/',       partOfSpeech: 'noun',      example: 'We arrived at the airport two hours early.' },
      { id: 'tr02', term: 'passport',      translation: 'passaporto',       ipa: '/ˈpɑːs.pɔːrt/',      partOfSpeech: 'noun',      example: 'Don\'t forget your passport when you travel abroad.' },
      { id: 'tr03', term: 'luggage',       translation: 'bagaglio',         ipa: '/ˈlʌɡ.ɪdʒ/',         partOfSpeech: 'noun',      example: 'She packed her luggage the night before the flight.' },
      { id: 'tr04', term: 'boarding pass', translation: 'carta d\'imbarco', ipa: '/ˈbɔːr.dɪŋ pæs/',    partOfSpeech: 'noun',      example: 'Please have your boarding pass ready at the gate.' },
      { id: 'tr05', term: 'destination',   translation: 'destinazione',     ipa: '/ˌdes.tɪˈneɪ.ʃən/',  partOfSpeech: 'noun',      example: 'Paris was our final destination on the tour.' },
      { id: 'tr06', term: 'reservation',   translation: 'prenotazione',     ipa: '/ˌrez.ər.ˈveɪ.ʃən/', partOfSpeech: 'noun',      example: 'I made a reservation at the hotel for three nights.' },
      { id: 'tr07', term: 'customs',       translation: 'dogana',           ipa: '/ˈkʌs.təmz/',         partOfSpeech: 'noun',      example: 'We had to wait in line at customs for an hour.' },
      { id: 'tr08', term: 'departure',     translation: 'partenza',         ipa: '/dɪˈpɑːr.tʃər/',     partOfSpeech: 'noun',      example: 'The departure gate is on the third floor.' },
      { id: 'tr09', term: 'itinerary',     translation: 'itinerario',       ipa: '/aɪˈtɪn.ər.er.i/',   partOfSpeech: 'noun',      example: 'The travel agent sent us the full itinerary by email.' },
      { id: 'tr10', term: 'souvenir',      translation: 'souvenir / ricordo', ipa: '/ˌsuː.vəˈnɪər/',   partOfSpeech: 'noun',      example: 'She bought a souvenir from every city she visited.' },
    ],
  },

  // ── WORK ────────────────────────────────
  {
    id: 'work',
    name: 'WORK',
    nameIT: 'Lavoro',
    emoji: '💼',
    items: [
      { id: 'wk01', term: 'meeting',     translation: 'riunione',       ipa: '/ˈmiː.tɪŋ/',      partOfSpeech: 'noun',      example: 'We have a team meeting every Monday morning.' },
      { id: 'wk02', term: 'deadline',    translation: 'scadenza',       ipa: '/ˈded.laɪn/',     partOfSpeech: 'noun',      example: 'The deadline for the report is Friday at noon.' },
      { id: 'wk03', term: 'colleague',   translation: 'collega',        ipa: '/ˈkɒl.iːɡ/',      partOfSpeech: 'noun',      example: 'A colleague helped me with the presentation.' },
      { id: 'wk04', term: 'salary',      translation: 'stipendio',      ipa: '/ˈsæl.ər.i/',     partOfSpeech: 'noun',      example: 'She negotiated a higher salary with her boss.' },
      { id: 'wk05', term: 'interview',   translation: 'colloquio',      ipa: '/ˈɪn.tə.vjuː/',   partOfSpeech: 'noun',      example: 'He prepared carefully for the job interview.' },
      { id: 'wk06', term: 'contract',    translation: 'contratto',      ipa: '/ˈkɒn.trækt/',    partOfSpeech: 'noun',      example: 'Please read the contract before you sign it.' },
      { id: 'wk07', term: 'promotion',   translation: 'promozione',     ipa: '/prəˈmoʊ.ʃən/',   partOfSpeech: 'noun',      example: 'She got a promotion after two years in the company.' },
      { id: 'wk08', term: 'overtime',    translation: 'straordinario',  ipa: '/ˈoʊ.vər.taɪm/',  partOfSpeech: 'noun',      example: 'He worked overtime to finish the project on time.' },
      { id: 'wk09', term: 'remote',      translation: 'da remoto',      ipa: '/rɪˈmoʊt/',       partOfSpeech: 'adjective', example: 'Many people work remote from home now.' },
    ],
  },

  // ── FOOD ────────────────────────────────
  {
    id: 'food',
    name: 'FOOD',
    nameIT: 'Cibo',
    emoji: '🍽',
    items: [
      { id: 'fd01', term: 'breakfast',   translation: 'colazione',      ipa: '/ˈbrek.fəst/',    partOfSpeech: 'noun',      example: 'I always have breakfast before going to work.' },
      { id: 'fd02', term: 'recipe',      translation: 'ricetta',        ipa: '/ˈres.ɪ.pi/',     partOfSpeech: 'noun',      example: 'She found a great recipe for chocolate cake online.' },
      { id: 'fd03', term: 'ingredient',  translation: 'ingrediente',    ipa: '/ɪnˈɡriː.di.ənt/',partOfSpeech: 'noun',      example: 'The main ingredient in this dish is garlic.' },
      { id: 'fd04', term: 'flavour',     translation: 'sapore / gusto', ipa: '/ˈfleɪ.vər/',     partOfSpeech: 'noun',      example: 'This soup has a rich, deep flavour.' },
      { id: 'fd05', term: 'appetiser',   translation: 'antipasto',      ipa: '/ˈæp.ɪ.taɪ.zər/', partOfSpeech: 'noun',      example: 'We ordered an appetiser while waiting for the main course.' },
      { id: 'fd06', term: 'portion',     translation: 'porzione',       ipa: '/ˈpɔːr.ʃən/',     partOfSpeech: 'noun',      example: 'The portions at this restaurant are very generous.' },
      { id: 'fd07', term: 'dessert',     translation: 'dolce / dessert', ipa: '/dɪˈzɜːrt/',     partOfSpeech: 'noun',      example: 'For dessert, I had a piece of tiramisu.' },
      { id: 'fd08', term: 'spicy',       translation: 'piccante',       ipa: '/ˈspaɪ.si/',      partOfSpeech: 'adjective', example: 'Be careful — this sauce is very spicy.' },
      { id: 'fd09', term: 'vegetarian',  translation: 'vegetariano',    ipa: '/ˌvedʒ.ɪˈteər.i.ən/', partOfSpeech: 'adjective', example: 'Do you have any vegetarian options on the menu?' },
      { id: 'fd10', term: 'takeaway',    translation: 'cibo da asporto', ipa: '/ˈteɪk.ə.weɪ/',  partOfSpeech: 'noun',      example: 'Let\'s order a takeaway tonight — I\'m too tired to cook.' },
    ],
  },

  // ── TECHNOLOGY ──────────────────────────
  {
    id: 'technology',
    name: 'TECHNOLOGY',
    nameIT: 'Tecnologia',
    emoji: '⚡',
    items: [
      { id: 'tc01', term: 'application',  translation: 'applicazione',   ipa: '/ˌæp.lɪˈkeɪ.ʃən/', partOfSpeech: 'noun',      example: 'Download the application from the app store.' },
      { id: 'tc02', term: 'password',     translation: 'password',        ipa: '/ˈpɑːs.wɜːrd/',    partOfSpeech: 'noun',      example: 'Make sure your password is at least twelve characters.' },
      { id: 'tc03', term: 'database',     translation: 'database / archivio', ipa: '/ˈdeɪ.tə.beɪs/', partOfSpeech: 'noun', example: 'All customer data is stored in a secure database.' },
      { id: 'tc04', term: 'software',     translation: 'software',        ipa: '/ˈsɒft.weər/',     partOfSpeech: 'noun',      example: 'The new software update includes several bug fixes.' },
      { id: 'tc05', term: 'network',      translation: 'rete',            ipa: '/ˈnet.wɜːrk/',     partOfSpeech: 'noun',      example: 'The office network went down for two hours yesterday.' },
      { id: 'tc06', term: 'wireless',     translation: 'senza fili',      ipa: '/ˈwaɪər.ləs/',     partOfSpeech: 'adjective', example: 'We connected to the wireless internet at the café.' },
      { id: 'tc07', term: 'backup',       translation: 'copia di backup', ipa: '/ˈbæk.ʌp/',        partOfSpeech: 'noun',      example: 'Always create a backup before updating your system.' },
      { id: 'tc08', term: 'bandwidth',    translation: 'larghezza di banda', ipa: '/ˈbænd.wɪdθ/',  partOfSpeech: 'noun',      example: 'Streaming video uses a lot of bandwidth.' },
      { id: 'tc09', term: 'encryption',   translation: 'crittografia',    ipa: '/ɪnˈkrɪp.ʃən/',   partOfSpeech: 'noun',      example: 'Encryption protects your data from unauthorised access.' },
    ],
  },

  // ── DAILY LIFE ───────────────────────────
  {
    id: 'daily-life',
    name: 'DAILY LIFE',
    nameIT: 'Vita Quotidiana',
    emoji: '🕐',
    items: [
      { id: 'dl01', term: 'routine',      translation: 'routine / abitudine', ipa: '/ruːˈtiːn/',    partOfSpeech: 'noun',      example: 'My morning routine takes about thirty minutes.' },
      { id: 'dl02', term: 'appointment',  translation: 'appuntamento',     ipa: '/əˈpɔɪnt.mənt/', partOfSpeech: 'noun',      example: 'I have a dentist appointment at four o\'clock.' },
      { id: 'dl03', term: 'commute',      translation: 'pendolarismo / tragitto', ipa: '/kəˈmjuːt/', partOfSpeech: 'noun',   example: 'His daily commute takes over an hour each way.' },
      { id: 'dl04', term: 'grocery',      translation: 'spesa alimentare', ipa: '/ˈɡroʊ.sər.i/',   partOfSpeech: 'noun',      example: 'I do the grocery shopping every Saturday morning.' },
      { id: 'dl05', term: 'laundry',      translation: 'bucato',           ipa: '/ˈlɔːn.dri/',      partOfSpeech: 'noun',      example: 'She does the laundry once a week.' },
      { id: 'dl06', term: 'schedule',     translation: 'programma / orario', ipa: '/ˈʃed.juːl/',   partOfSpeech: 'noun',      example: 'Can you check your schedule for next week?' },
      { id: 'dl07', term: 'neighbourhood', translation: 'quartiere / vicinato', ipa: '/ˈneɪ.bər.hʊd/', partOfSpeech: 'noun', example: 'We live in a quiet neighbourhood near the park.' },
      { id: 'dl08', term: 'errand',       translation: 'commissione',      ipa: '/ˈer.ənd/',        partOfSpeech: 'noun',      example: 'I have a few errands to run before lunch.' },
      { id: 'dl09', term: 'habit',        translation: 'abitudine',        ipa: '/ˈhæb.ɪt/',        partOfSpeech: 'noun',      example: 'Reading before bed is a good habit to have.' },
    ],
  },
]
