import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Check, ChevronDown, Rocket, Compass, Globe, Sparkles, X } from 'lucide-react'
import GhostButton from '../components/GhostButton'
import { db, unlockLevel, completeUnit } from '../db/database'
import { useProgress } from '../hooks/useProgress'
import AnimatedCounter from '../components/AnimatedCounter'

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
      { id: 'u-b1-1', title: '01 · Present Perfect vs Past Simple', desc: 'Esperienze di vita con ever/never e specificità temporali.' },
      { id: 'u-b1-2', title: '02 · Periodo Ipotetico (Conditionals)', desc: 'Zero, First e Second Conditional per ipotesi e conseguenze.' },
      { id: 'u-b1-3', title: '03 · Phrasal Verbs e Conversazione Spontanea', desc: 'Espressioni idiomatiche verbali (look forward, give up, set off).' },
      { id: 'u-b1-4', title: '04 · Lavoro, Meeting e Comunicazione Formale', desc: 'Email di lavoro, presentazioni e gestione di deadline.' },
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
      { id: 'u-b2-1', title: '01 · Forma Passiva e Registro Tecnico', desc: 'Enfasi sull\'azione e processi formali (the mission was launched).' },
      { id: 'u-b2-2', title: '02 · Discorso Indiretto (Reported Speech)', desc: 'Riferire dichiarazioni altrui con shift dei tempi verbali.' },
      { id: 'u-b2-3', title: '03 · Modali di Deduzione e Registro Accademico', desc: 'Must have, can\'t have, might have per speculazioni logiche.' },
      { id: 'u-b2-4', title: '04 · Fluency e Argomentazione Complessa', desc: 'Articolare opinioni con connettivi complessi (furthermore, nevertheless).' },
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
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>(['A1'])
  const [completedUnits, setCompletedUnits] = useState<string[]>(['u-a1-1'])
  const [testModalMission, setTestModalMission] = useState<LevelMission | null>(null)
  const [testQuestionIdx, setTestQuestionIdx] = useState(0)
  const [testSelectedOption, setTestSelectedOption] = useState<number | null>(null)
  const [testAnswers, setTestAnswers] = useState<boolean[]>([])
  const [testFinished, setTestFinished] = useState(false)

  // Load progress from DB
  const loadProgress = useCallback(async () => {
    const p = await db.user_progress.toCollection().first()
    if (p) {
      if (p.unlockedLevels) setUnlockedLevels(p.unlockedLevels)
      if (p.completedUnits) setCompletedUnits(p.completedUnits)
    }
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Open unlock test
  const startUnlockTest = (mission: LevelMission) => {
    setTestModalMission(mission)
    setTestQuestionIdx(0)
    setTestSelectedOption(null)
    setTestAnswers([])
    setTestFinished(false)
  }

  // Answer unlock test question
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
        // If passed (all 3 correct)
        if (correctTotal >= 2) {
          // Unlock next level
          const currentIdx = MISSIONS.findIndex((m) => m.levelId === testModalMission.levelId)
          if (currentIdx < MISSIONS.length - 1) {
            const nextLevel = MISSIONS[currentIdx + 1].levelId
            await unlockLevel(nextLevel)
            await addXP(50)
            await loadProgress()
          }
        }
      } else {
        setTestQuestionIdx((q) => q + 1)
        setTestSelectedOption(null)
      }
    }, 800)
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory bg-bg-primary">
      {MISSIONS.map((mission, index) => {
        const isUnlocked = unlockedLevels.includes(mission.levelId)
        const unitsInLevel = mission.units
        const completedInLevel = unitsInLevel.filter((u) => completedUnits.includes(u.id))
        const progressPct = Math.round((completedInLevel.length / unitsInLevel.length) * 100)
        const nextMission = MISSIONS[index + 1]
        const isNextUnlocked = nextMission ? unlockedLevels.includes(nextMission.levelId) : true
        const canTakeUnlockTest = isUnlocked && !isNextUnlocked && nextMission

        const Icon = mission.icon

        return (
          <section
            key={mission.levelId}
            className={`min-h-[calc(100vh-3.5rem)] snap-start flex flex-col justify-between p-6 sm:p-12 border-b border-border-subtle relative transition-opacity duration-300 ${
              isUnlocked ? 'opacity-100' : 'opacity-40'
            }`}
          >
            {/* Top Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-white/30 text-xs tracking-widest" style={{ letterSpacing: '0.22em' }}>
                  MISSIONE {index + 1} DI {MISSIONS.length} · {mission.code}
                </span>
                {isUnlocked ? (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-sm border border-signal-ok text-signal-ok">
                    {progressPct === 100 ? 'COMPLETATA' : 'ATTIVA'}
                  </span>
                ) : (
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-sm border border-border-subtle text-white/30 flex items-center gap-1">
                    <Lock size={11} /> BLOCCATA
                  </span>
                )}
              </div>

              {/* Progress 2px line indicator */}
              <div className="flex items-center gap-3 w-48">
                <span className="font-mono text-xs text-white/30 tabular-nums">
                  <AnimatedCounter value={progressPct} />%
                </span>
                <div className="flex-1 h-0.5 bg-border-subtle overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Central Content */}
            <div className="max-w-5xl my-auto py-8">
              <div className="flex items-center gap-3 mb-2">
                <Icon size={24} className="text-white/60" strokeWidth={1.5} />
                <span className="font-mono text-xs text-white/35 tracking-widest uppercase">
                  {mission.subtitle}
                </span>
              </div>

              {/* Display Title 60-80px in UPPERCASE */}
              <h2
                className="heading-display text-white font-bold leading-none mb-6"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 4.8rem)' }}
              >
                {mission.name}
              </h2>

              <p className="text-text-content/50 font-sans text-sm sm:text-base max-w-2xl mb-10 leading-relaxed">
                {mission.themeDesc}
              </p>

              {/* Units List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                {mission.units.map((unit) => {
                  const isDone = completedUnits.includes(unit.id)
                  return (
                    <div
                      key={unit.id}
                      className="p-4 rounded-sm border border-border-subtle flex items-start justify-between gap-3 group"
                      style={{ background: '#0a0a0a' }}
                    >
                      <div>
                        <p className="font-mono text-xs text-white tracking-wider font-semibold mb-1">
                          {unit.title}
                        </p>
                        <p className="text-text-content/40 text-xs leading-normal">
                          {unit.desc}
                        </p>
                      </div>
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded-sm border shrink-0 text-center"
                        style={{
                          borderColor: isDone ? '#3DDC84' : '#3a3a3f',
                          color: isDone ? '#3DDC84' : 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {isDone ? 'COMPLETATA' : isUnlocked ? 'IN CORSO' : 'BLOCCATA'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Single Ghost CTA Button */}
              <div className="flex flex-wrap items-center gap-4">
                {isUnlocked ? (
                  canTakeUnlockTest ? (
                    <GhostButton size="lg" onClick={() => startUnlockTest(mission)}>
                      TEST DI SBLOCCO {nextMission?.name}
                    </GhostButton>
                  ) : (
                    <GhostButton size="lg" onClick={() => navigate('/lezione')}>
                      CONTINUA MISSIONE
                    </GhostButton>
                  )
                ) : (
                  <button
                    disabled
                    className="font-mono text-xs px-6 py-3 rounded-pill border border-border-subtle text-white/25 cursor-not-allowed flex items-center gap-2"
                  >
                    <Lock size={13} /> MISSIONE BLOCCATA (SUPERA TEST LIVELLO PRECEDENTE)
                  </button>
                )}
              </div>
            </div>

            {/* Bottom snap indicator */}
            <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-white/20 font-mono text-xs">
              <span style={{ letterSpacing: '0.18em' }}>
                SPACEX FLIGHT TRAJECTORY · {mission.levelId}
              </span>
              {index < MISSIONS.length - 1 && (
                <span className="flex items-center gap-1">
                  SCORRI IN BASSO <ChevronDown size={12} />
                </span>
              )}
            </div>
          </section>
        )
      })}

      {/* ── INTERACTIVE UNLOCK TEST MODAL ── */}
      {testModalMission && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-xl p-6 sm:p-8 rounded-sm border border-border-subtle flex flex-col justify-between"
            style={{ background: '#0a0a0a' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
              <div>
                <span className="font-mono text-xs text-white/30 tracking-widest">
                  TEST DI SBLOCCO MISSIONE · {testModalMission.name}
                </span>
                <h3 className="heading-display text-xl text-white mt-0.5">
                  VERIFICA TRAIETTORIA
                </h3>
              </div>
              <button
                onClick={() => setTestModalMission(null)}
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Test Content or Results */}
            {!testFinished ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs text-white/30 tabular-nums">
                    QUESITO {testQuestionIdx + 1} / {testModalMission.unlockTest.length}
                  </span>
                  <div className="w-24 h-0.5 bg-border-subtle overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300"
                      style={{
                        width: `${((testQuestionIdx + 1) / testModalMission.unlockTest.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <p className="font-sans text-base text-white leading-relaxed mb-6">
                  {testModalMission.unlockTest[testQuestionIdx].question}
                </p>

                <div className="space-y-2 mb-6">
                  {testModalMission.unlockTest[testQuestionIdx].options.map((opt, i) => {
                    const isSelected = testSelectedOption === i
                    const isCorrect = i === testModalMission.unlockTest[testQuestionIdx].correctIndex
                    const answered = testSelectedOption !== null

                    let borderColor = '#3a3a3f'
                    let textColor = 'rgba(240,240,250,0.7)'

                    if (answered) {
                      if (isCorrect) {
                        borderColor = '#3DDC84'
                        textColor = '#3DDC84'
                      } else if (isSelected) {
                        borderColor = '#FF5C5C'
                        textColor = '#FF5C5C'
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleTestAnswer(i)}
                        disabled={answered}
                        className="w-full text-left font-sans text-sm p-4 rounded-sm border transition-all duration-150"
                        style={{
                          borderColor,
                          color: textColor,
                          background: 'transparent',
                          cursor: answered ? 'default' : 'pointer',
                        }}
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
                    <div className="w-12 h-12 rounded-full border border-signal-ok flex items-center justify-center mx-auto mb-4 text-signal-ok">
                      <Check size={24} strokeWidth={2} />
                    </div>
                    <h4 className="heading-display text-2xl text-white mb-2">
                      TEST SUPERATO CON SUCCESSO
                    </h4>
                    <p className="text-text-content/50 text-sm mb-6 max-w-sm mx-auto">
                      Hai dimostrato padronanza sufficiente per sbloccare la rotta verso il livello successivo. +50 XP assegnati.
                    </p>
                    <GhostButton
                      size="lg"
                      onClick={() => {
                        setTestModalMission(null)
                      }}
                    >
                      AVVIA NUOVA ORBITA
                    </GhostButton>
                  </>
                ) : (
                  <>
                    <h4 className="heading-display text-2xl text-white mb-2">
                      REQUISITI NON SODDISFATTI
                    </h4>
                    <p className="text-text-content/50 text-sm mb-6 max-w-sm mx-auto">
                      Risposte corrette: {testAnswers.filter(Boolean).length} / {testModalMission.unlockTest.length}. Ripassa le unità per riprovare il test di sblocco.
                    </p>
                    <GhostButton
                      onClick={() => {
                        startUnlockTest(testModalMission)
                      }}
                    >
                      RIPROVA TEST
                    </GhostButton>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
