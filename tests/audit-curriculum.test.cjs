// ============================================================
// HEADLESS TEST: Curriculum Multiplier Audit (x3) & BBC Schema
// ============================================================

const fs = require('fs');
const assert = require('assert');

console.log('🧪 RUNNING: tests/audit-curriculum.test.cjs\n');

const seedSource = fs.readFileSync('src/db/seed.ts', 'utf8');
const bbcSource = fs.readFileSync('src/db/bbcCurriculum.ts', 'utf8');

function countMatches(str, regex) {
  const m = str.match(regex);
  return m ? m.length : 0;
}

// ── Test 1: Verify Multiplier (x3) on all categories ──
console.log('--- TEST 1: Volume Multipliers (>= 3x baseline) ---');

const testCases = [
  {
    name: 'Carico (Vocabolario)',
    section: seedSource.substring(seedSource.indexOf('export const vocabulary: VocabItem[] = ['), seedSource.indexOf('export type IrregularPattern')),
    b1Init: 8, b1Target: 24,
    b2Init: 7, b2Target: 21
  },
  {
    name: 'Propulsione (Verbi Irregolari & Phrasal)',
    section: seedSource.substring(seedSource.indexOf('export const irregularVerbs: IrregularVerb[] = ['), seedSource.indexOf('export type QuizType')),
    b1Init: 7, b1Target: 21,
    b2Init: 6, b2Target: 18
  },
  {
    name: 'Comunicazioni (Ascolto & Dettato)',
    section: seedSource.substring(seedSource.indexOf('export const LISTENING_CLIPS: AudioClip[] = ['), seedSource.indexOf('export interface SpeakingPhrase')),
    b1Init: 6, b1Target: 18,
    b2Init: 7, b2Target: 21
  },
  {
    name: 'Vocal Link (Parlato & Pronuncia)',
    section: seedSource.substring(seedSource.indexOf('export const SPEAKING_PHRASES: SpeakingPhrase[] = ['), seedSource.indexOf('export interface WritingPrompt')),
    b1Init: 7, b1Target: 21,
    b2Init: 8, b2Target: 24
  },
  {
    name: 'Logbook (Scrittura & Sintassi formale)',
    section: seedSource.substring(seedSource.indexOf('export const WRITING_PROMPTS: WritingPrompt[] = ['), seedSource.indexOf('export interface Exercise')),
    b1Init: 4, b1Target: 12,
    b2Init: 6, b2Target: 18
  },
];

for (const tc of testCases) {
  const b1Count = countMatches(tc.section, /level:\s*'B1'/g);
  const b2Count = countMatches(tc.section, /level:\s*'B2'/g);

  console.log(`Checking ${tc.name}: B1=${b1Count} (target >= ${tc.b1Target}), B2=${b2Count} (target >= ${tc.b2Target})`);
  assert(b1Count >= tc.b1Target, `${tc.name} B1 volume (${b1Count}) did not meet target (>= ${tc.b1Target})`);
  assert(b2Count >= tc.b2Target, `${tc.name} B2 volume (${b2Count}) did not meet target (>= ${tc.b2Target})`);
  console.log(`  ✅ ${tc.name} PASSED`);
}

// ── Test 2: Verify BBC Exercises Volume (>= 45 B1 and >= 45 B2) ──
console.log('\n--- TEST 2: BBC Exercises Volume (>= 45 B1 and >= 45 B2) ---');
const bbcB1 = countMatches(bbcSource, /level:\s*'B1'/g);
const bbcB2 = countMatches(bbcSource, /level:\s*'B2'/g);

console.log(`BBC Exercises: B1=${bbcB1} (target >= 45), B2=${bbcB2} (target >= 45)`);
assert(bbcB1 >= 45, `BBC B1 exercises (${bbcB1}) did not meet minimum 45`);
assert(bbcB2 >= 45, `BBC B2 exercises (${bbcB2}) did not meet minimum 45`);
console.log('  ✅ BBC Exercises Volume PASSED');

// ── Test 3: Verify BBC Curriculum Schema Completeness ──
console.log('\n--- TEST 3: BBC Curriculum Pedagogical Schema Compliance ---');

// Check rule, trapWarning, and bbcExample presence
const ruleCount = countMatches(bbcSource, /rule:\s*['"`]/g);
const trapCount = countMatches(bbcSource, /trapWarning:\s*['"`]/g);
const exampleCount = countMatches(bbcSource, /bbcExample:\s*['"`]/g);
const scenarioCount = countMatches(bbcSource, /contextScenario:\s*['"`]/g);
const dialogueCount = countMatches(bbcSource, /dialogue:\s*\[/g);

console.log(`Rule definitions: ${ruleCount} / 100`);
console.log(`Trap warnings: ${trapCount} / 100`);
console.log(`BBC examples: ${exampleCount} / 100`);
console.log(`Context scenarios: ${scenarioCount} / 100`);
console.log(`Dialogue flows: ${dialogueCount} / 100`);

assert.strictEqual(ruleCount, 100, `Expected 100 rule definitions, got ${ruleCount}`);
assert.strictEqual(trapCount, 100, `Expected 100 trap warnings, got ${trapCount}`);
assert.strictEqual(exampleCount, 100, `Expected 100 BBC examples, got ${exampleCount}`);
assert.strictEqual(scenarioCount, 100, `Expected 100 context scenarios, got ${scenarioCount}`);
assert.strictEqual(dialogueCount, 100, `Expected 100 dialogue flows, got ${dialogueCount}`);

console.log('  ✅ BBC Schema Completeness PASSED');

// ── Test 4: Verify Traps mention "The Trap" and examples mention "BBC in Action" ──
console.log('\n--- TEST 4: Pedagogical Traps & Authentic Examples ---');
const theTrapMentions = countMatches(bbcSource, /The Trap/g);
const bbcInActionMentions = countMatches(bbcSource, /BBC in Action/g);

console.log(`"The Trap" explicit occurrences: ${theTrapMentions}`);
console.log(`"BBC in Action" occurrences: ${bbcInActionMentions}`);
assert(theTrapMentions >= 95, `"The Trap" must be consistently featured in explanations (found ${theTrapMentions})`);
assert(bbcInActionMentions >= 95, `"BBC in Action" must be consistently featured in explanations (found ${bbcInActionMentions})`);

console.log('  ✅ Pedagogical Standards PASSED');

// ── Test 5: Verify Zero Leaks in B1 and B2 exercises ──
console.log('\n--- TEST 5: Zero Answer Leaks in B1 & B2 Exercises ---');
const percorsoSource = fs.readFileSync('src/pages/Percorso.tsx', 'utf8');

// Parse BBC exercises and check each for answer leaks in dialogue or prompt
const exerciseRegex = /{\s*id:\s*['"](bbc-[^'"]+)['"],[\s\S]*?level:\s*['"]([^'"]+)['"],[\s\S]*?type:\s*['"]([^'"]+)['"],[\s\S]*?correctAnswer:\s*([^,\n]+|\[[\s\S]*?\]),/g;
let leakCount = 0;
let match;
while ((match = exerciseRegex.exec(bbcSource)) !== null) {
  const [fullChunk, id, level, type, ansRaw] = match;
  let answers = [];
  if (ansRaw.startsWith('[')) {
    const arrMatches = ansRaw.match(/['"]([^'"]+)['"]/g) || [];
    answers = arrMatches.map(s => s.replace(/['"]/g, '').trim());
  } else {
    answers = [ansRaw.replace(/['"]/g, '').trim()];
  }

  const dialogueMatch = fullChunk.match(/dialogue:\s*\[([\s\S]*?)\]/);
  if (dialogueMatch) {
    const dialogueContent = dialogueMatch[1];
    for (const ans of answers) {
      if (ans.length > 3) {
        const regex = new RegExp('\\b' + ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        if (regex.test(dialogueContent)) {
          console.error(`Leak detected in ${id} (${type}): answer "${ans}" found in dialogue!`);
          leakCount++;
        }
      }
    }
  }
}

console.log(`Detected leaks in BBC exercises: ${leakCount}`);
assert.strictEqual(leakCount, 0, `Expected 0 answer leaks in BBC exercises, found ${leakCount}`);
console.log('  ✅ Zero Answer Leaks PASSED');

// ── Test 6: Verify Tripled Missions in Percorso.tsx (12 B1 & 12 B2) ──
console.log('\n--- TEST 6: Tripled Missions Volume (12 B1 & 12 B2 Units) ---');
const b1Units = (percorsoSource.match(/id:\s*'u-b1-\d+'/g) || []).length;
const b2Units = (percorsoSource.match(/id:\s*'u-b2-\d+'/g) || []).length;

console.log(`B1 Mission units in Percorso: ${b1Units} (target: 12)`);
console.log(`B2 Mission units in Percorso: ${b2Units} (target: 12)`);

assert.strictEqual(b1Units, 12, `Expected 12 B1 mission units, found ${b1Units}`);
assert.strictEqual(b2Units, 12, `Expected 12 B2 mission units, found ${b2Units}`);
console.log('  ✅ Tripled Missions Volume (12 B1 & 12 B2) PASSED');

console.log('\n🎉 ALL CURRICULUM AUDIT TESTS PASSED SUCCESSFULLY!\n');
