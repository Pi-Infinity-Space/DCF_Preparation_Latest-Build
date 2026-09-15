export const SUBJECTS = ["english", "maths", "gk"] as const;
export type Subject = (typeof SUBJECTS)[number];

export const TIERS = ["easy", "hard", "difficult"] as const;
export type Tier = (typeof TIERS)[number];

export const ENGLISH_SKILLS = [
  "vocabulary-in-context",
  "reading-comprehension",
  "subject-verb-agreement",
  "tense-consistency",
  "pronoun-reference",
  "semicolons",
] as const;
export type EnglishSkill = (typeof ENGLISH_SKILLS)[number];

export type Skill =
  | EnglishSkill
  | "percentages"
  | "algebra"
  | "probability"
  | "ratio"
  | "sequences"
  | "geometry"
  | "identities"
  | "number-theory"
  | "word-problems"
  | "functions"
  | "data"
  | "genetics"
  | "government"
  | "economics"
  | "science"
  | "geography"
  | "history"
  | "institutions"
  | "reasoning";

export type Question = {
  id: string;
  subject: Subject;
  difficulty: Tier;
  skill: Skill;
  stem: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  passage?: string;
  passageId?: string;
};

export const TIER_POINTS: Record<Tier, number> = {
  easy: 5,
  hard: 10,
  difficult: 15,
};

export const EXAM_QUESTION_COUNT = 60;
export const EXAM_TOTAL_POINTS = 600;
export const PASS_MARK = 510;
export const EASY_COUNT = 20;
export const HARD_COUNT = 20;
export const DIFFICULT_COUNT = 20;
export const DRILL_QUESTION_COUNT = 20;
export const DRILL_MINUTES = 15;

export const SUBJECT_LABEL: Record<Subject, string> = {
  english: "English",
  maths: "Mathematics",
  gk: "General Knowledge",
};

export const TIER_LABEL: Record<Tier, string> = {
  easy: "Easy",
  hard: "Hard",
  difficult: "Difficult",
};

export const SKILL_LABEL: Record<Skill, string> = {
  "vocabulary-in-context": "Vocabulary in Context",
  "reading-comprehension": "Reading Comprehension",
  "subject-verb-agreement": "Subject–Verb Agreement",
  "tense-consistency": "Tense Consistency",
  "pronoun-reference": "Pronoun Reference",
  semicolons: "Semicolons",
  percentages: "Percentages",
  algebra: "Algebra",
  probability: "Probability",
  ratio: "Ratio & Proportion",
  sequences: "Sequences",
  geometry: "Geometry",
  identities: "Identities",
  "number-theory": "Number Theory",
  "word-problems": "Word Problems",
  functions: "Functions",
  data: "Data Interpretation",
  genetics: "Genetics",
  government: "Government",
  economics: "Economics",
  science: "Science",
  geography: "Geography",
  history: "History",
  institutions: "Institutions",
  reasoning: "Reasoning",
};

export const SKILL_HINT: Record<EnglishSkill, string> = {
  "vocabulary-in-context": "Infer meaning from sentence clues",
  "reading-comprehension": "Tone, purpose, and implication — not fact recall",
  "subject-verb-agreement": "Singular/plural matching; ignore the interrupting phrase",
  "tense-consistency": "Correct verb tense in context",
  "pronoun-reference": "Clear and correct pronoun use",
  semicolons: "Joining independent clauses correctly",
};

export type DurationMin = 45 | 60;

export type Screen =
  | "home"
  | "instructions"
  | "subjects"
  | "test"
  | "results"
  | "review"
  | "drill-pick"
  | "drill"
  | "drill-results"
  | "study";

export type Attempt = {
  id: string;
  at: number;
  durationMin: DurationMin;
  subjects: Subject[];
  score: number;
  total: number;
  passed: boolean;
  bySubject: Record<Subject, { correct: number; total: number; points: number; possible: number }>;
  byTier: Record<Tier, { correct: number; total: number; points: number; possible: number }>;
  weakSkills: Skill[];
};

export type DrillAttempt = {
  id: string;
  at: number;
  skills: EnglishSkill[];
  correct: number;
  total: number;
};

export type DrillStats = Record<EnglishSkill, { correct: number; total: number }>;

export type SavedSession = {
  kind: "exam" | "drill";
  durationMin: DurationMin;
  subjects: Subject[];
  skills: EnglishSkill[];
  questions: Question[];
  answers: Array<number | null>;
  currentIndex: number;
  remainingMs: number;
  startedAt: number;
};

export type ExamResult = {
  score: number;
  total: number;
  passed: boolean;
  answers: Array<number | null>;
  questions: Question[];
  bySubject: Attempt["bySubject"];
  byTier: Attempt["byTier"];
  recommendations: string[];
  durationMin: DurationMin;
  elapsedMs: number;
};
