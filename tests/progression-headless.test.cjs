// ============================================================
// HEADLESS TEST: Progression & State Runner Simulation
// ============================================================

const assert = require('assert');

console.log('🧪 RUNNING: tests/progression-headless.test.cjs\n');

// 1. Text Normalization & Verification Logic (mirrors Lesson.tsx)
function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function verifyAnswer(userInput, target) {
  const normUser = normalizeAnswer(userInput);
  if (!normUser) return false;
  if (Array.isArray(target)) {
    return target.some((ans) => normalizeAnswer(ans) === normUser);
  }
  return normalizeAnswer(target) === normUser;
}

// ── Test 1: Answer Verification Logic ──
console.log('--- TEST 1: Answer Normalization & Verification ---');
assert.strictEqual(verifyAnswer("have been monitoring", "have been monitoring"), true);
assert.strictEqual(verifyAnswer("HAVE BEEN MONITORING!", "have been monitoring"), true);
assert.strictEqual(verifyAnswer("I have lived here for 3 years.", ["I have lived here for 3 years", "I've lived here for 3 years"]), true);
assert.strictEqual(verifyAnswer("I’ve lived here for 3 years.", ["I have lived here for 3 years", "I've lived here for 3 years"]), true); // Smart quote normalization
assert.strictEqual(verifyAnswer("wrong answer", "correct answer"), false);
assert.strictEqual(verifyAnswer("", "correct answer"), false);
console.log('  ✅ Answer Normalization PASSED');

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
