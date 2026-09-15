import { shuffle } from "@/lib/utils";
import { ENGLISH_BANK } from "./english-bank";
import { GK_BANK } from "./gk-bank";
import { generateMathMany } from "./math-gen";
import {
  DIFFICULT_COUNT,
  DRILL_QUESTION_COUNT,
  EASY_COUNT,
  EXAM_QUESTION_COUNT,
  HARD_COUNT,
  type EnglishSkill,
  type Question,
  type Subject,
  type Tier,
} from "./types";

export const STATIC_BANK: Question[] = [...ENGLISH_BANK, ...GK_BANK];

function allocate(total: number, n: number, offset: number): number[] {
  const base = Math.floor(total / n);
  const rem = total % n;
  const arr = Array.from({ length: n }, () => base);
  for (let i = 0; i < rem; i++) arr[(i + offset) % n]! += 1;
  return arr;
}

function shuffleOptions(q: Question): Question {
  const order = shuffle([0, 1, 2, 3] as const);
  const options = order.map((i) => q.options[i]) as Question["options"];
  const correctIndex = order.indexOf(q.correctIndex) as 0 | 1 | 2 | 3;
  return { ...q, options, correctIndex };
}

function takeFromPool(pool: Question[], count: number, used: Set<string>): Question[] {
  if (count <= 0) return [];
  const fresh = shuffle(pool.filter((q) => !used.has(q.id)));
  const stale = shuffle(pool.filter((q) => used.has(q.id)));
  const picked: Question[] = [];

  const byPassage = new Map<string, Question[]>();
  for (const q of fresh) {
    if (!q.passageId) continue;
    const list = byPassage.get(q.passageId) ?? [];
    list.push(q);
    byPassage.set(q.passageId, list);
  }
  const groups = shuffle(Array.from(byPassage.values())).sort((a, b) => b.length - a.length);
  for (const g of groups) {
    if (picked.length + g.length <= count) {
      picked.push(...g);
    }
  }

  const pickedIds = new Set(picked.map((q) => q.id));
  for (const q of fresh) {
    if (picked.length >= count) break;
    if (!pickedIds.has(q.id)) {
      picked.push(q);
      pickedIds.add(q.id);
    }
  }
  for (const q of stale) {
    if (picked.length >= count) break;
    if (!pickedIds.has(q.id)) {
      picked.push(q);
      pickedIds.add(q.id);
    }
  }
  return picked.slice(0, count).map(shuffleOptions);
}

function pickSubjectTier(
  subject: Subject,
  difficulty: Tier,
  count: number,
  used: Set<string>,
): Question[] {
  if (count <= 0) return [];
  if (subject === "maths") return generateMathMany(difficulty, count, used);
  const pool = STATIC_BANK.filter((q) => q.subject === subject && q.difficulty === difficulty);
  const picked = takeFromPool(pool, count, used);
  if (picked.length < count) {
    const any = STATIC_BANK.filter((q) => q.subject === subject);
    const extra = takeFromPool(
      any.filter((q) => !picked.some((p) => p.id === q.id)),
      count - picked.length,
      used,
    );
    return [...picked, ...extra];
  }
  return picked;
}

function interleave(questions: Question[]): Question[] {
  const buckets = new Map<Subject, Question[]>();
  for (const q of questions) {
    const list = buckets.get(q.subject) ?? [];
    list.push(q);
    buckets.set(q.subject, list);
  }
  const keys = shuffle(Array.from(buckets.keys()));
  const out: Question[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const k of keys) {
      const next = buckets.get(k)?.shift();
      if (next) {
        out.push(next);
        added = true;
      }
    }
  }
  return out;
}

export function buildExam(subjects: Subject[], used: Set<string>): Question[] {
  const chosen = subjects.length ? subjects : (["english", "maths", "gk"] as Subject[]);
  const n = chosen.length;
  const easyAlloc = allocate(EASY_COUNT, n, 0);
  const hardAlloc = allocate(HARD_COUNT, n, 1);
  const diffAlloc = allocate(DIFFICULT_COUNT, n, 2);

  const easy: Question[] = [];
  const hard: Question[] = [];
  const difficult: Question[] = [];

  chosen.forEach((s, i) => {
    easy.push(...pickSubjectTier(s, "easy", easyAlloc[i]!, used));
    hard.push(...pickSubjectTier(s, "hard", hardAlloc[i]!, used));
    difficult.push(...pickSubjectTier(s, "difficult", diffAlloc[i]!, used));
  });

  const paper = [...interleave(easy), ...interleave(hard), ...interleave(difficult)];
  if (paper.length > EXAM_QUESTION_COUNT) return paper.slice(0, EXAM_QUESTION_COUNT);
  return paper;
}

export function buildDrill(skills: EnglishSkill[], used: Set<string>): Question[] {
  const wanted = skills.length ? skills : (["reading-comprehension"] as EnglishSkill[]);
  const pool = ENGLISH_BANK.filter((q) => wanted.includes(q.skill as EnglishSkill));
  const picked = takeFromPool(pool, DRILL_QUESTION_COUNT, used);
  if (picked.length < DRILL_QUESTION_COUNT) {
    const extra = takeFromPool(
      ENGLISH_BANK.filter((q) => !picked.some((p) => p.id === q.id)),
      DRILL_QUESTION_COUNT - picked.length,
      used,
    );
    return [...picked, ...extra].slice(0, DRILL_QUESTION_COUNT);
  }
  return picked;
}

export function bankInventory(used: Set<string>) {
  const staticFresh = STATIC_BANK.filter((q) => !used.has(q.id)).length;
  return {
    staticTotal: STATIC_BANK.length,
    staticFresh,
    math: "generated each sitting — unique stems until the parameter space is exhausted",
  };
}
