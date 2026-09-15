import { pct } from "@/lib/utils";
import {
  PASS_MARK,
  SKILL_LABEL,
  SUBJECT_LABEL,
  TIER_POINTS,
  type Attempt,
  type Question,
  type Skill,
  type Subject,
  type Tier,
} from "./types";

export function scoreAttempt(questions: Question[], answers: Array<number | null>) {
  const bySubject = {
    english: { correct: 0, total: 0, points: 0, possible: 0 },
    maths: { correct: 0, total: 0, points: 0, possible: 0 },
    gk: { correct: 0, total: 0, points: 0, possible: 0 },
  } satisfies Attempt["bySubject"];
  const byTier = {
    easy: { correct: 0, total: 0, points: 0, possible: 0 },
    hard: { correct: 0, total: 0, points: 0, possible: 0 },
    difficult: { correct: 0, total: 0, points: 0, possible: 0 },
  } satisfies Attempt["byTier"];

  const skillMisses = new Map<Skill, { miss: number; total: number }>();
  let score = 0;
  let total = 0;

  questions.forEach((q, i) => {
    const pts = TIER_POINTS[q.difficulty];
    total += pts;
    const ok = answers[i] === q.correctIndex;
    bySubject[q.subject].total += 1;
    bySubject[q.subject].possible += pts;
    byTier[q.difficulty].total += 1;
    byTier[q.difficulty].possible += pts;
    const rec = skillMisses.get(q.skill) ?? { miss: 0, total: 0 };
    rec.total += 1;
    if (ok) {
      score += pts;
      bySubject[q.subject].correct += 1;
      bySubject[q.subject].points += pts;
      byTier[q.difficulty].correct += 1;
      byTier[q.difficulty].points += pts;
    } else {
      rec.miss += 1;
    }
    skillMisses.set(q.skill, rec);
  });

  const weakSkills = Array.from(skillMisses.entries())
    .filter(([, v]) => v.total > 0 && v.miss / v.total >= 0.4)
    .sort((a, b) => b[1].miss / b[1].total - a[1].miss / a[1].total)
    .map(([k]) => k);

  return {
    score,
    total,
    passed: score >= PASS_MARK,
    bySubject,
    byTier,
    weakSkills,
  };
}

export function buildRecommendations(
  questions: Question[],
  answers: Array<number | null>,
  scored: ReturnType<typeof scoreAttempt>,
): string[] {
  const out: string[] = [];
  const subjectsPresent = Array.from(new Set(questions.map((q) => q.subject))) as Subject[];

  for (const s of subjectsPresent) {
    const row = scored.bySubject[s];
    if (row.possible === 0) continue;
    const p = pct(row.points, row.possible);
    if (p < 85) {
      if (s === "maths") {
        out.push(
          "Mathematics is under 85%. Drill identities (x + 1/x), probability without replacement, and quadratic roots — the traps sit in the second step, not the arithmetic.",
        );
      } else if (s === "english") {
        out.push(
          "English is under 85%. Spend the next sessions on reading comprehension (tone and purpose) and grammar: ignore the prepositional phrase in agreement questions, and hunt for NOT/except.",
        );
      } else {
        out.push(
          "General Knowledge is under 85%. This section rewards breadth you cannot cram in a night — genetics, institutions, regional geography, and short reasoning items. Read a little, widely, every day.",
        );
      }
    }
  }

  const easy = scored.byTier.easy;
  const hard = scored.byTier.hard;
  if (easy.total > 0 && hard.total > 0) {
    const easyPct = pct(easy.correct, easy.total);
    const hardPct = pct(hard.correct, hard.total);
    if (easyPct + 8 < hardPct) {
      out.push(
        "You missed more Easy items than Hard ones. That pattern is a content gap, not exam technique — go back to fundamentals before another full paper.",
      );
    }
  }

  const unanswered = answers.filter((a) => a === null).length;
  if (unanswered >= 6) {
    out.push(
      `You left ${unanswered} questions blank. On a whole-paper clock the skill is abandonment: guess, mark, move. A blank cannot score.`,
    );
  }

  for (const skill of scored.weakSkills.slice(0, 3)) {
    out.push(`Weakest tagged skill: ${SKILL_LABEL[skill]}. Review every miss in that tag before the next sitting.`);
  }

  if (out.length === 0) {
    if (scored.passed) {
      out.push(
        `You cleared ${SUBJECT_LABEL[subjectsPresent[0]!] ?? "the paper"} at or above the 85% line. Keep one timed paper a week so the cutoff does not feel theoretical.`,
      );
    } else {
      out.push(
        "Score is close enough that careless reading is the remaining tax. Slow down on qualifiers: not, except, at least, without replacement.",
      );
    }
  }

  return out.slice(0, 5);
}

export function tierLoss(scored: ReturnType<typeof scoreAttempt>): Tier {
  let worst: Tier = "easy";
  let lost = -1;
  (["easy", "hard", "difficult"] as Tier[]).forEach((t) => {
    const row = scored.byTier[t];
    const miss = row.possible - row.points;
    if (miss > lost) {
      lost = miss;
      worst = t;
    }
  });
  return worst;
}
