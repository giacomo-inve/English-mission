// ============================================================
//  EXERCISE VALIDATOR — English Mission Control
//  Intelligent normalization & validation for CLOZE & text inputs
// ============================================================

export interface ValidatableExercise {
  type?: string
  prompt?: string
  contextSentence?: string
  audioText?: string
  dialogue?: Array<{ speaker?: string; text?: string }>
  correctAnswer: string | string[]
}

/**
 * Normalizza il testo dell'utente o della risposta target:
 * - .trim().toLowerCase()
 * - Sostituzione virgolette intelligenti (’ ') con apostrofo standard
 * - Rimozione della punteggiatura finale (es. '.', '?', '!', ',', ';', ':')
 * - Rimozione della punteggiatura interna non verbale
 * - Collasso degli spazi multipli
 */
export function normalizeAnswer(text: string): string {
  if (!text) return ''
  return text
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    // Rimuovi punteggiatura finale prima del confronto
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]+$/g, '')
    // Rimuovi punteggiatura interna (conserva l'apostrofo per contrazioni can't, don't, I've)
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Estrae tutti i template con spazio vuoto (indicato da due o più trattini bassi: _____)
 * da prompt, dialoghi, frasi di contesto e relative sotto-clausole.
 */
export function extractBlankTemplates(exercise?: ValidatableExercise): string[] {
  if (!exercise) return []
  const rawTemplates: string[] = []

  // 1. Prompt diretto
  if (exercise.prompt && /_{2,}/.test(exercise.prompt)) {
    rawTemplates.push(exercise.prompt)
  }

  // 2. Frase di contesto
  if (exercise.contextSentence && /_{2,}/.test(exercise.contextSentence)) {
    rawTemplates.push(exercise.contextSentence)
  }

  // 3. Turni di dialogo
  if (exercise.dialogue && Array.isArray(exercise.dialogue)) {
    for (const turn of exercise.dialogue) {
      if (turn.text && /_{2,}/.test(turn.text)) {
        rawTemplates.push(turn.text)
      }
    }
  }

  const allTemplates = new Set<string>()

  for (const t of rawTemplates) {
    allTemplates.add(t)

    // Se il template contiene virgolette con spazio vuoto (es. 'Completa con: "Frase _____ qui."')
    const quoteMatches = t.match(/["“'«]([^"”'»]*_{2,}[^"”'»]*)["”'»]/g)
    if (quoteMatches) {
      for (const q of quoteMatches) {
        const cleaned = q.replace(/^["“'«]|["”'»]$/g, '').trim()
        if (/_{2,}/.test(cleaned)) {
          allTemplates.add(cleaned)
        }
      }
    }

    // Se il template contiene più frasi separate da punto o a capo, estrai la singola frase contenente il blank
    const sentences = t.split(/(?<=[.!?])\s+|\n+/)
    for (const s of sentences) {
      const trimmed = s.trim()
      if (/_{2,}/.test(trimmed) && trimmed !== t) {
        allTemplates.add(trimmed)
      }
    }
  }

  return Array.from(allTemplates)
}

/**
 * Validazione intelligente degli esercizi CLOZE e testuali:
 * 1. Confronto diretto: Se l'utente inserisce la singola parola attesa (es. "yet").
 * 2. Frase completa: Se l'utente riscrive l'intera frase inserendo la parola corretta al posto dello spazio vuoto.
 * 3. AudioText match: Se l'utente scrive l'intera frase nominale dell'esercizio.
 */
export function verifyAnswer(
  userInput: string,
  target: string | string[],
  exercise?: ValidatableExercise
): boolean {
  const normUser = normalizeAnswer(userInput)
  if (!normUser) return false

  const targets = Array.isArray(target) ? target : [target]

  // 1. Validazione diretta (singola parola o frase target esatta)
  const directMatch = targets.some((ans) => normalizeAnswer(ans) === normUser)
  if (directMatch) {
    return true
  }

  // 2. Validazione intelligente per CLOZE con frase intera riscritta
  if (exercise) {
    // 2a. Verifica rispetto alla trascrizione audioText (frase completa di riferimento)
    if (exercise.audioText) {
      const normAudio = normalizeAnswer(exercise.audioText)
      if (normAudio && normAudio === normUser) {
        return true
      }
    }

    // 2b. Ricostruzione dinamica della frase inserendo la risposta attesa nello spazio vuoto (_____)
    const templates = extractBlankTemplates(exercise)
    for (const template of templates) {
      for (const ans of targets) {
        // Sostituisce lo spazio vuoto (due o più trattini bassi) con la risposta target
        const reconstructed = template.replace(/_{2,}/g, ans)
        if (normalizeAnswer(reconstructed) === normUser) {
          return true
        }
      }
    }
  }

  return false
}
