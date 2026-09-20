// ============================================================
// HEADLESS TEST: Progression & State Runner Simulation
// ============================================================

const assert = require('assert');

console.log('🧪 RUNNING: tests/progression-headless.test.cjs\n');

// 1. Text Normalization & Verification Logic (mirrors exerciseValidator.ts)
function normalizeAnswer(text) {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/[’']/g, "'")
    // Rimuovi punteggiatura finale prima del confronto
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]+$/g, '')
    // Rimuovi punteggiatura interna (conserva l'apostrofo per contrazioni)
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractBlankTemplates(exercise) {
  if (!exercise) return [];
  const rawTemplates = [];

  if (exercise.prompt && /_{2,}/.test(exercise.prompt)) {
    rawTemplates.push(exercise.prompt);
  }
  if (exercise.contextSentence && /_{2,}/.test(exercise.contextSentence)) {
    rawTemplates.push(exercise.contextSentence);
  }
  if (exercise.dialogue && Array.isArray(exercise.dialogue)) {
    for (const turn of exercise.dialogue) {
      if (turn.text && /_{2,}/.test(turn.text)) {
        rawTemplates.push(turn.text);
      }
    }
  }

  const allTemplates = new Set();
  for (const t of rawTemplates) {
    allTemplates.add(t);
    const quoteMatches = t.match(/["“'«]([^"”'»]*_{2,}[^"”'»]*)["”'»]/g);
    if (quoteMatches) {
      for (const q of quoteMatches) {
        const cleaned = q.replace(/^["“'«]|["”'»]$/g, '').trim();
        if (/_{2,}/.test(cleaned)) {
          allTemplates.add(cleaned);
        }
      }
    }
    const sentences = t.split(/(?<=[.!?])\s+|\n+/);
    for (const s of sentences) {
      const trimmed = s.trim();
      if (/_{2,}/.test(trimmed) && trimmed !== t) {
        allTemplates.add(trimmed);
      }
    }
  }
  return Array.from(allTemplates);
}

function verifyAnswer(userInput, target, exercise) {
  const normUser = normalizeAnswer(userInput);
  if (!normUser) return false;

  const targets = Array.isArray(target) ? target : [target];

  // 1. Validazione diretta (singola parola o frase target esatta)
  const directMatch = targets.some((ans) => normalizeAnswer(ans) === normUser);
  if (directMatch) return true;

  // 2. Validazione intelligente per CLOZE
  if (exercise) {
    if (exercise.audioText) {
      const normAudio = normalizeAnswer(exercise.audioText);
      if (normAudio && normAudio === normUser) return true;
    }

    const templates = extractBlankTemplates(exercise);
    for (const template of templates) {
      for (const ans of targets) {
        const reconstructed = template.replace(/_{2,}/g, ans);
        if (normalizeAnswer(reconstructed) === normUser) return true;
      }
    }
  }

  return false;
}

// ── Test 1: Answer Verification & Intelligent Cloze Logic ──
console.log('--- TEST 1: Answer Normalization & Intelligent Cloze Verification ---');
assert.strictEqual(verifyAnswer("have been monitoring", "have been monitoring"), true);
assert.strictEqual(verifyAnswer("HAVE BEEN MONITORING!", "have been monitoring"), true);
assert.strictEqual(verifyAnswer("I have lived here for 3 years.", ["I have lived here for 3 years", "I've lived here for 3 years"]), true);
assert.strictEqual(verifyAnswer("I’ve lived here for 3 years.", ["I have lived here for 3 years", "I've lived here for 3 years"]), true); // Smart quote normalization
assert.strictEqual(verifyAnswer("wrong answer", "correct answer"), false);
assert.strictEqual(verifyAnswer("", "correct answer"), false);

// Cloze Single Word vs Full Sentence Test
const sampleClozeExercise = {
  id: 'cloze-test-1',
  type: 'cloze',
  prompt: 'Have you received the updated trajectory coordinates from Houston _____?',
  correctAnswer: 'yet',
  audioText: 'Have you received the updated trajectory coordinates from Houston yet?'
};

// 1a. User enters only the target word
assert.strictEqual(verifyAnswer("yet", sampleClozeExercise.correctAnswer, sampleClozeExercise), true, 'Cloze single word must pass');
assert.strictEqual(verifyAnswer("  YET. ", sampleClozeExercise.correctAnswer, sampleClozeExercise), true, 'Cloze single word with whitespace and trailing punctuation must pass');

// 1b. User enters the full rewritten sentence
assert.strictEqual(
  verifyAnswer("Have you received the updated trajectory coordinates from Houston yet?", sampleClozeExercise.correctAnswer, sampleClozeExercise),
  true,
  'Cloze full rewritten sentence must pass'
);
assert.strictEqual(
  verifyAnswer("have you received the updated trajectory coordinates from houston yet", sampleClozeExercise.correctAnswer, sampleClozeExercise),
  true,
  'Cloze full sentence lowercase no punctuation must pass'
);

// 1c. User enters incorrect word or sentence
assert.strictEqual(
  verifyAnswer("already", sampleClozeExercise.correctAnswer, sampleClozeExercise),
  false,
  'Cloze incorrect word must fail'
);
assert.strictEqual(
  verifyAnswer("Have you received the updated trajectory coordinates from Houston already?", sampleClozeExercise.correctAnswer, sampleClozeExercise),
  false,
  'Cloze incorrect sentence must fail'
);

// 1d. Cloze with dialogue turn
const sampleDialogueCloze = {
  id: 'cloze-dialogue-1',
  type: 'cloze',
  prompt: 'Flight Director feedback:',
  dialogue: [
    { speaker: 'CAPCOM', text: 'Telemetry confirmed.' },
    { speaker: 'FLIGHT', text: 'All systems _____ nominal for re-entry.' }
  ],
  correctAnswer: 'are'
};
assert.strictEqual(verifyAnswer("are", sampleDialogueCloze.correctAnswer, sampleDialogueCloze), true);
assert.strictEqual(verifyAnswer("All systems are nominal for re-entry.", sampleDialogueCloze.correctAnswer, sampleDialogueCloze), true);
assert.strictEqual(verifyAnswer("All systems were nominal for re-entry.", sampleDialogueCloze.correctAnswer, sampleDialogueCloze), false);

console.log('  ✅ Answer Normalization & Intelligent Cloze PASSED');

// ── Test 2: Decoupled Session Runner Simulation ──
console.log('\n--- TEST 2: Session Queue & Index Decoupling Simulation ---');

class MockDatabase {
  constructor() {
    this.completedIds = new Set();
  }
  async markExerciseCompleted(id, level, score) {
    this.completedIds.add(id);
    return true;
  }
  async getCompletedExerciseIds() {
    return Array.from(this.completedIds);
  }
}

class HeadlessLessonSession {
  constructor(exercises, db) {
    this.db = db;
    this.exercises = exercises;
    this.sessionQueue = [];
    this.currentIndex = 0;
    this.score = 0;
    this.isLevelMastered = false;
    this.sessionCompleted = false;
  }

  async init(level, practice = false) {
    const completedIds = await this.db.getCompletedExerciseIds();
    const completedSet = new Set(completedIds);
    const candidates = this.exercises.filter((e) => e.level === level);
    const uncompleted = practice ? candidates : candidates.filter((e) => !completedSet.has(e.id));

    if (uncompleted.length === 0) {
      this.sessionQueue = candidates;
      this.isLevelMastered = true;
      this.currentIndex = 0;
    } else {
      this.sessionQueue = uncompleted;
      this.isLevelMastered = false;
      this.currentIndex = 0;
    }
  }

  async submitAnswer(answer) {
    const currentEx = this.sessionQueue[this.currentIndex];
    const isCorrect = verifyAnswer(answer, currentEx.correctAnswer);

    if (isCorrect) {
      this.score += 15;
      // CRITICAL: DB write must NOT alter this.currentIndex or reload this.sessionQueue!
      await this.db.markExerciseCompleted(currentEx.id, currentEx.level, 15);
    }
    return isCorrect;
  }

  next() {
    // Advancing pointer
    if (this.currentIndex < this.sessionQueue.length - 1) {
      this.currentIndex += 1;
    } else {
      this.sessionCompleted = true;
    }
  }
}

async function runSessionTest() {
  const db = new MockDatabase();
  const mockExercises = [
    { id: 'ex-1', level: 'B1', correctAnswer: 'have been working' },
    { id: 'ex-2', level: 'B1', correctAnswer: 'for' },
    { id: 'ex-3', level: 'B1', correctAnswer: 'unless' },
  ];

  const session = new HeadlessLessonSession(mockExercises, db);
  await session.init('B1');

  assert.strictEqual(session.sessionQueue.length, 3);
  assert.strictEqual(session.currentIndex, 0);
  assert.strictEqual(session.isLevelMastered, false);

  // Exercise 1
  const ex1 = session.sessionQueue[session.currentIndex];
  assert.strictEqual(ex1.id, 'ex-1');
  const corr1 = await session.submitAnswer('have been working');
  assert.strictEqual(corr1, true);
  assert.strictEqual(session.currentIndex, 0, 'Index must not jump during DB write');
  assert.strictEqual(db.completedIds.has('ex-1'), true, 'ex-1 saved in DB');
  session.next();
  assert.strictEqual(session.currentIndex, 1, 'Index must advance to 1');

  // Exercise 2
  const ex2 = session.sessionQueue[session.currentIndex];
  assert.strictEqual(ex2.id, 'ex-2');
  const corr2 = await session.submitAnswer('for');
  assert.strictEqual(corr2, true);
  session.next();
  assert.strictEqual(session.currentIndex, 2, 'Index must advance to 2');

  // Exercise 3
  const ex3 = session.sessionQueue[session.currentIndex];
  assert.strictEqual(ex3.id, 'ex-3');
  const corr3 = await session.submitAnswer('unless');
  assert.strictEqual(corr3, true);
  session.next();

  assert.strictEqual(session.sessionCompleted, true, 'Session must mark completion');
  console.log('  ✅ Sequential progression without repeat loops PASSED');

  // Next session when all are completed -> Level Mastered
  const nextSession = new HeadlessLessonSession(mockExercises, db);
  await nextSession.init('B1');
  assert.strictEqual(nextSession.isLevelMastered, true, 'All exercises completed triggers Mastery mode');
  assert.strictEqual(nextSession.sessionQueue.length, 3, 'Practice queue loaded with candidate exercises');
  console.log('  ✅ Level Mastery & Practice Mode fallback PASSED');
}

runSessionTest().then(() => {
  console.log('\n🎉 ALL PROGRESSION TESTS PASSED SUCCESSFULLY!\n');
}).catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
