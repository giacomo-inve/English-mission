import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Rocket, Compass, Globe, Sparkles, X, Award, CheckCircle2 } from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { db, completeUnit } from '../db/database'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'
import SectionGuideModal from '../components/SectionGuideModal'

interface MissionUnit {
  id: string
  title: string
  desc: string
}

interface LevelMission {
  levelId: string
  code: string
  name: string
  subtitle: string
  themeDesc: string
  icon: any
  units: MissionUnit[]
  unlockTest: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
}

const MISSIONS: LevelMission[] = [
  {
    levelId: 'A1',
    code: 'LIVELLO A1',
    name: 'RAMPA DI LANCIO',
    subtitle: 'FONDAMENTA · SALUTI & IDENTITÀ · VERBI BASE',
    themeDesc: 'Accensione dei motori primari. Costruzione delle strutture basilari della lingua inglese, pronomi personali, verbo to be e routine quotidiana.',
    icon: Rocket,
    units: [
      { id: 'u-a1-1', title: '01 · Saluti, Identità e Alfabeto', desc: 'Presentazioni formali e informali, spelling e nazionalità.' },
      { id: 'u-a1-2', title: '02 · Verbo To Be, Pronomi e Articoli', desc: 'Forma affermativa, negativa e interrogativa; a/an e the.' },
      { id: 'u-a1-3', title: '03 · Present Simple e Routine Quotidiana', desc: 'Verbi di frequenza, terza persona singolare e orari.' },
      { id: 'u-a1-4', title: '04 · Vocabolario Fondamentale e Plurali', desc: 'Sostantivi regolari e irregolari, aggettivi possessivi.' },
    ],
    unlockTest: [
      {
        question: 'Qual è la forma corretta al presente per la terza persona singolare?',
        options: ['She live in London', 'She lives in London', 'She living in London', 'She are living in London'],
        correctIndex: 1,
        explanation: 'Al Present Simple, la terza persona singolare (he/she/it) aggiunge la desinenza -s o -es.',
      },
      {
        question: 'Scegli l\'articolo corretto: "I would like _____ apple and _____ book."',
        options: ['a / an', 'an / a', 'a / a', 'the / an'],
        correctIndex: 1,
        explanation: 'Si usa "an" davanti a suoni vocalici (an apple) e "a" davanti a suoni consonantici (a book).',
      },
      {
        question: 'Completa: "They _____ from Italy, they are from Spain."',
        options: ['isn\'t', 'aren\'t', 'not are', 'doesn\'t'],
        correctIndex: 1,
        explanation: 'Il soggetto plurale "They" richiede "aren\'t" (are not) nella forma negativa.',
      },
    ],
  },
  {
    levelId: 'A2',
    code: 'LIVELLO A2',
    name: 'ORBITA TERRESTRE',
    subtitle: 'TEMPI PASSATI · VITA QUOTIDIANA · VIAGGI',
    themeDesc: 'Raggiunta quota orbitale nominale. Narrazione di eventi passati, verbi irregolari, pianificazione di viaggi e comparativi.',
    icon: Globe,
    units: [
      { id: 'u-a2-1', title: '01 · Past Simple e Forme Irregolari', desc: 'Dichiarazioni al passato, verbi frequenti (went, bought, saw).' },
      { id: 'u-a2-2', title: '02 · Viaggi, Spostamenti e Indicazioni', desc: 'Orientamento in aeroporto, stazioni e hotel.' },
      { id: 'u-a2-3', title: '03 · Comparativi, Superlativi e Quantificatori', desc: 'Confronto tra elementi: taller than, the most efficient.' },
      { id: 'u-a2-4', title: '04 · Piani Futuri (Going to & Will)', desc: 'Intenzioni programmate e previsioni immediate.' },
    ],
    unlockTest: [
      {
        question: 'Qual è il Past Simple corretto di "buy"?',
        options: ['buyed', 'bought', 'boughted', 'buying'],
        correctIndex: 1,
        explanation: '"Buy" è un verbo irregolare con pattern ABB: buy → bought → bought.',
      },
      {
        question: 'Completa la frase comparativa: "London is _____ than Oxford."',
        options: ['more big', 'bigger', 'biggest', 'more bigger'],
        correctIndex: 1,
        explanation: 'Gli aggettivi monosillabici raddoppiano la consonante e aggiungono -er (big → bigger).',
      },
      {
        question: 'Come si esprime un\'intenzione pianificata per il futuro?',
        options: ['I will to visit Rome', 'I am going to visit Rome', 'I visit Rome yesterday', 'I went to visit Rome'],
        correctIndex: 1,
        explanation: '"To be going to" esprime piani futuri e intenzioni già decise.',
      },
    ],
  },
  {
    levelId: 'B1',
    code: 'LIVELLO B1',
    name: 'ORBITA LUNARE',
    subtitle: 'PERIODO IPOTETICO · LAVORO · DISCUSSIONE',
    themeDesc: 'Manovra di inserimento translunare. Collegamento tra passato e presente col Present Perfect, conditionals e phrasal verbs professionali.',
    icon: Compass,
    units: [
      { id: 'u-b1-1', title: '01 · Tempo & Durata', desc: 'Present Perfect vs Past Simple; for, since, yet, already, just.' },
      { id: 'u-b1-2', title: '02 · Ipotesi & Probabilità', desc: 'Zero, First e Second Conditional; would + base form vs will.' },
      { id: 'u-b1-3', title: '03 · Modali di Deduzione & Obbligo', desc: 'Must, have to, should, might, can\'t; divieto (mustn\'t) vs assenza obbligo (don\'t have to).' },
      { id: 'u-b1-4', title: '04 · Passivo Base & Relative Clauses', desc: 'Present/Past Simple passive; defining & non-defining clauses (who, which, that, whose, where).' },
    ],
    unlockTest: [
      {
        question: 'Scegli la forma corretta con "since":',
        options: [
          'I know him since three years',
          'I have known him for three years',
          'I had known him since three years',
          'I am knowing him since three years',
        ],
        correctIndex: 1,
        explanation: 'Per periodi continuati fino al presente si usa il Present Perfect ("have known") accompagnato da "for".',
      },
      {
        question: 'Completa il Second Conditional: "If I _____ more time, I _____ travel more."',
        options: ['have / will', 'had / would', 'would have / traveled', 'had / will'],
        correctIndex: 1,
        explanation: 'Il Second Conditional usa Past Simple nella subordinata e "would + forma base" nella principale.',
      },
      {
        question: 'Cosa significa il phrasal verb "to call off"?',
        options: ['Rimandare', 'Cancellare / Annullare', 'Telefonare a qualcuno', 'Continuare'],
        correctIndex: 1,
        explanation: '"To call off" significa annullare un evento o una riunione programmata.',
      },
    ],
  },
  {
    levelId: 'B2',
    code: 'LIVELLO B2',
    name: 'MISSIONE MARTE',
    subtitle: 'FLUENCY AVANZATA · STRUTTURE COMPLESSE',
    themeDesc: 'Avvicinamento alla superficie marziana. Piena autonomia comunicativa, forma passiva avanzata, discorso indiretto e argomentazione accademica.',
    icon: Sparkles,
    units: [
      { id: 'u-b2-1', title: '01 · Condizionali Complessi & Wishes', desc: 'Third Conditional, Mixed Conditionals, strutture con wish e if only.' },
      { id: 'u-b2-2', title: '02 · Reported Speech & Reporting Verbs', desc: 'Verbi reggenti avanzati (admit doing, deny having done, convince, suggest that).' },
      { id: 'u-b2-3', title: '03 · Forme Passive Avanzate & Causativi', desc: 'Modal passives (must have been done); causativo have/get something done.' },
      { id: 'u-b2-4', title: '04 · Inversioni Formali & Discourse Markers', desc: 'Inversioni negative (rarely, under no circumstances); connettori whereas, furthermore.' },
    ],
    unlockTest: [
      {
        question: 'Trasforma in forma passiva: "Engineers designed the spacecraft."',
        options: [
          'The spacecraft designed by engineers.',
          'The spacecraft was designed by engineers.',
          'The spacecraft has been designed by engineers.',
          'The spacecraft were designed by engineers.',
        ],
        correctIndex: 1,
        explanation: 'Al passato passivo singolare: was + past participle ("was designed").',
      },
      {
        question: 'Quale frase esprime una quasi certezza logica passata?',
        options: [
          'He might be at home.',
          'He must have finished the project yesterday.',
          'He could finish the project.',
          'He should finish the project.',
        ],
        correctIndex: 1,
        explanation: '"Must have + past participle" indica una deduzione logica di cui si è quasi certi al passato.',
      },
      {
        question: 'Scegli il connettivo avversativo formale più appropriato:',
        options: ['Nevertheless', 'Because', 'Also', 'So'],
        correctIndex: 0,
        explanation: '"Nevertheless" (nondimeno / ciononostante) introduce una concessione formale.',
      },
    ],
  },
]

export default function Percorso() {
  const navigate = useNavigate()
  const { addXP } = useProgress()
  const [completedUnits, setCompletedUnits] = useState<string[]>(['u-a1-1'])
  const [testModalMission, setTestModalMission] = useState<LevelMission | null>(null)
  const [testQuestionIdx, setTestQuestionIdx] = useState(0)
  const [testSelectedOption, setTestSelectedOption] = useState<number | null>(null)
  const [testAnswers, setTestAnswers] = useState<boolean[]>([])
  const [testFinished, setTestFinished] = useState(false)

  // Load progress from DB
  const loadProgress = useCallback(async () => {
    const p = await db.user_progress.toCollection().first()
    if (p && p.completedUnits) {
      setCompletedUnits(p.completedUnits)
    }
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Open unlock/mastery test
  const startUnlockTest = (mission: LevelMission) => {
    setTestModalMission(mission)
    setTestQuestionIdx(0)
    setTestSelectedOption(null)
    setTestAnswers([])
    setTestFinished(false)
  }

  // Answer test question
  const handleTestAnswer = async (optionIdx: number) => {
    if (testSelectedOption !== null || !testModalMission) return
    setTestSelectedOption(optionIdx)

    const currQ = testModalMission.unlockTest[testQuestionIdx]
    const isCorrect = optionIdx === currQ.correctIndex
    const newAnswers = [...testAnswers, isCorrect]
    setTestAnswers(newAnswers)

    setTimeout(async () => {
      if (testQuestionIdx + 1 >= testModalMission.unlockTest.length) {
        setTestFinished(true)
        const correctTotal = newAnswers.filter(Boolean).length
        if (correctTotal >= 2) {
          await addXP(50)
          await loadProgress()
        }
      } else {
        setTestQuestionIdx((q) => q + 1)
        setTestSelectedOption(null)
      }
    }, 800)
  }

  const handleUnitClick = async (levelId: string, unitId: string) => {
    await completeUnit(unitId)
    await loadProgress()
    navigate(`/lezione?level=${levelId}&unit=${unitId}`)
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col bg-bg-primary px-4 sm:px-6 py-10 max-w-4xl mx-auto">
      {/* ── HEADER ── */}
      <div className="border-b border-border-subtle pb-6 mb-8 flex items-start justify-between">
        <div>
          <p
            className="font-mono text-text-content/40 text-xs tracking-widest mb-1"
            style={{ letterSpacing: '0.22em' }}
          >
            PIANO DI VOLO COMPLETO · SISTEMA PROGRESSIVO A1-B2
          </p>
          <h1 className="heading-display text-3xl sm:text-4xl text-text-display flex items-center gap-3">
            <Rocket size={30} strokeWidth={1.5} className="text-signal-ok" /> MISSIONI
          </h1>
        </div>

        <SectionGuideModal
          sectionTitle="MISSIONI · GUIDA OPERATIVA"
          sectionSubtitle="ALBERO DELLE TAPPE FORMATIVE"
          objective="Seguire o selezionare liberamente le tappe da A1 a B2. Tutti i livelli sono aperti e navigabili liberamente senza vincoli forzati."
          methodology={[
            'Tutti i livelli (A1, A2, B1, B2) sono sbloccati per esplorazione o verifica immediata.',
            'Ogni unità formativa affronta un pilastro grammaticale o lessicale essenziale.',
            'Puoi sostenere l\'esame facoltativo di livello per guadagnare +50 XP bonus.',
          ]}
          controls={[
            { name: 'UNITÀ DI MISSIONE', desc: 'Accesso diretto alla lezione associata.' },
            { name: 'ESAME DI LIVELLO', desc: 'Test rapido a 3 quesiti per verificare la padronanza della tappa.' },
          ]}
        />
      </div>

      {/* Global Unlocked Notice */}
      <div className="mb-8 p-4 rounded bg-signal-ok/10 border border-signal-ok/30 flex items-center justify-between text-xs font-mono">
        <span className="text-signal-ok flex items-center gap-2">
          <CheckCircle2 size={16} /> TUTTI I LIVELLI A1 · A2 · B1 · B2 SONO TOTALMENTE SBLOCCATI
        </span>
        <span className="text-text-content/50 hidden sm:inline">ACCESSO DIRETTO NOMINALE</span>
      </div>

      {/* ── MISSIONS TREE ── */}
      <div className="space-y-8">
        {MISSIONS.map((mission) => {
          const Icon = mission.icon

          return (
            <div
              key={mission.levelId}
              className="bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 shadow-md"
            >
              {/* Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full border border-signal-ok/40 bg-signal-ok/10 flex items-center justify-center text-signal-ok shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-signal-ok/20 text-signal-ok border border-signal-ok/30 font-bold">
                        {mission.code}
                      </span>
                      <span className="font-mono text-xs text-text-content/40 tracking-widest uppercase">
                        TAPPA ORBITALE
                      </span>
                    </div>
                    <h2 className="heading-display text-xl sm:text-2xl text-text-display mt-1">
                      {mission.name}
                    </h2>
                    <p className="font-mono text-xs text-text-content/60 mt-0.5">
                      {mission.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => startUnlockTest(mission)}
                  className="px-4 py-2 rounded-pill border border-border-subtle hover:border-text-display text-text-display font-mono text-xs tracking-wider flex items-center gap-2 self-start sm:self-center transition-colors"
                >
                  <Award size={14} className="text-signal-ok" /> ESAME TAPPA (+50 XP)
                </button>
              </div>

              <p className="text-text-content/70 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
                {mission.themeDesc}
              </p>

              {/* Units Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mission.units.map((unit) => {
                  const isDone = completedUnits.includes(unit.id)

                  return (
                    <button
                      key={unit.id}
                      onClick={() => handleUnitClick(mission.levelId, unit.id)}
                      className="group text-left p-4 rounded bg-bg-primary/60 border border-border-subtle hover:border-text-display transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs text-text-display font-semibold group-hover:text-signal-ok transition-colors">
                          {unit.title}
                        </span>
                        {isDone ? (
                          <span className="text-signal-ok">
                            <Check size={14} strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-text-content/40 uppercase group-hover:text-text-display">
                            AVVIA &rarr;
                          </span>
                        )}
                      </div>
                      <p className="text-text-content/50 text-xs font-sans line-clamp-2">
                        {unit.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── OPTIONAL TEST MODAL ── */}
      {testModalMission && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-bg-section border border-border-subtle rounded-md p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
              <div>
                <p className="font-mono text-xs text-text-content/40 tracking-widest uppercase">
                  VERIFICA TELEMETRICA · {testModalMission.code}
                </p>
                <h3 className="heading-display text-xl text-text-display">
                  {testModalMission.name}
                </h3>
              </div>
              <button
                onClick={() => setTestModalMission(null)}
                className="text-text-content/40 hover:text-text-display"
              >
                <X size={20} />
              </button>
            </div>

            {!testFinished ? (
              <div>
                <div className="flex items-center justify-between mb-4 font-mono text-xs text-text-content/50">
                  <span>QUESITO {testQuestionIdx + 1} DI {testModalMission.unlockTest.length}</span>
                  <span>ESAME DI PADRONANZA</span>
                </div>

                <p className="text-text-display font-sans text-base font-medium mb-6 leading-relaxed">
                  {testModalMission.unlockTest[testQuestionIdx].question}
                </p>

                <div className="space-y-2.5 mb-6">
                  {testModalMission.unlockTest[testQuestionIdx].options.map((opt, i) => {
                    const isSelected = testSelectedOption === i
                    const isCorrect = i === testModalMission.unlockTest[testQuestionIdx].correctIndex

                    let btnStyle = 'border-border-subtle text-text-content hover:border-text-display'
                    if (testSelectedOption !== null) {
                      if (isCorrect) btnStyle = 'border-signal-ok text-signal-ok bg-signal-ok/10'
                      else if (isSelected) btnStyle = 'border-signal-err text-signal-err bg-signal-err/10'
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleTestAnswer(i)}
                        disabled={testSelectedOption !== null}
                        className={`w-full text-left p-3.5 rounded border text-sm font-sans transition-all ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                {testAnswers.filter(Boolean).length >= 2 ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-signal-ok/20 border border-signal-ok text-signal-ok mx-auto flex items-center justify-center mb-4">
                      <Check size={28} strokeWidth={2.5} />
                    </div>
                    <h4 className="heading-display text-2xl text-text-display mb-2">
                      ESAME SUPERATO!
                    </h4>
                    <p className="text-text-content/70 text-sm mb-6">
                      Hai dimostrato ottima padronanza dei concetti chiave di questa tappa. Telemetria aggiornata con +50 XP!
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="heading-display text-2xl text-text-display mb-2">
                      REVISIONE RACCOMANDATA
                    </h4>
                    <p className="text-text-content/70 text-sm mb-6">
                      Hai ottenuto {testAnswers.filter(Boolean).length} risposte corrette su {testModalMission.unlockTest.length}. Rivedi le unità e riprova quando vuoi!
                    </p>
                  </>
                )}

                <button
                  onClick={() => setTestModalMission(null)}
                  className="px-6 py-2.5 rounded-pill bg-text-display text-bg-primary font-mono text-xs font-semibold"
                >
                  CHIUDI ESAME
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
