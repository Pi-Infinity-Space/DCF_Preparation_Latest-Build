import {
  BookOpen,
  Calculator,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  GraduationCap,
  Grid3x3,
  ListChecks,
  RotateCcw,
  Target,
  Timer,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  DRILL_MINUTES,
  ENGLISH_SKILLS,
  EXAM_QUESTION_COUNT,
  EXAM_TOTAL_POINTS,
  PASS_MARK,
  SKILL_HINT,
  SKILL_LABEL,
  SUBJECT_LABEL,
  TIER_LABEL,
  TIER_POINTS,
  type Attempt,
  type DrillStats,
  type DurationMin,
  type EnglishSkill,
  type ExamResult,
  type Question,
  type Subject,
} from "@/lib/exam/types";
import { cn, formatMs, pct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScholarStar } from "./logo";
import { OptionList } from "./option-list";
import { ScoreRing } from "./score-ring";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-8 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        {children}
      </div>
    </div>
  );
}

export function TopBar({
  onBack,
  right,
  title,
}: {
  onBack?: () => void;
  right?: ReactNode;
  title: string;
}) {
  return (
    <header className="mb-5 flex items-center gap-3">
      {onBack ? (
        <Button variant="secondary" size="icon" onClick={onBack} aria-label="Back">
          <ChevronLeft className="size-5" />
        </Button>
      ) : (
        <span className="size-11" />
      )}
      <h1 className="flex-1 text-center font-display text-lg font-medium tracking-tight">{title}</h1>
      <div className="flex min-w-11 justify-end">{right}</div>
    </header>
  );
}

export function HomeScreen({
  attempts,
  drillStats,
  hasSession,
  onStart,
  onDrill,
  onStudy,
  onResume,
  onReset,
  freshStatic,
  staticTotal,
}: {
  attempts: Attempt[];
  drillStats: DrillStats;
  hasSession: boolean;
  onStart: () => void;
  onDrill: () => void;
  onStudy: () => void;
  onResume: () => void;
  onReset: () => void;
  freshStatic: number;
  staticTotal: number;
}) {
  const best = attempts.reduce((m, a) => Math.max(m, a.score), 0);
  const last = attempts[0];
  const passes = attempts.filter((a) => a.passed).length;
  return (
    <Shell>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col items-center pt-6 text-center">
          <ScholarStar className="size-16 rounded-2xl shadow-paper" />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-gold">
            Dreamers College Fund
          </p>
          <h1 className="mt-1 font-display text-[2rem] leading-tight tracking-tight">
            Aptitude Prep
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            60 questions. 600 points. Pass at 510. A discriminator, not a friendly quiz —
            practice the cutoff before it practices on you.
          </p>
        </div>

        {hasSession && (
          <button
            type="button"
            onClick={onResume}
            className="mt-6 rounded-xl border border-gold/40 bg-gold-soft px-4 py-3 text-left"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gold">In progress</p>
            <p className="mt-0.5 text-sm text-ink">Resume the sitting you left open.</p>
          </button>
        )}

        <div className="mt-6 grid grid-cols-3 gap-2">
          <Stat label="Sittings" value={String(attempts.length)} />
          <Stat label="Best" value={attempts.length ? String(best) : "—"} />
          <Stat label="Cleared" value={attempts.length ? `${passes}` : "—"} />
        </div>

        {last && (
          <p className="mt-3 text-center text-sm text-muted">
            Last paper: <span className="tabular-nums text-ink">{last.score}</span> / {last.total}
            {last.passed ? " · passed" : " · below cutoff"}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" onClick={onStart} className="w-full">
            <GraduationCap className="size-4" />
            Full simulated exam
          </Button>
          <Button size="lg" variant="secondary" onClick={onDrill} className="w-full">
            <Target className="size-4" />
            English skill drill
          </Button>
          <Button size="lg" variant="ghost" onClick={onStudy} className="w-full">
            <ListChecks className="size-4" />
            Study plan
          </Button>
        </div>

        <section className="mt-8 rounded-2xl border border-line bg-paper p-4 shadow-paper">
          <h2 className="text-sm font-medium">Lifetime English mastery</h2>
          <p className="mt-1 text-xs text-muted">Built from every drill you have ever finished.</p>
          <div className="mt-4 flex flex-col gap-3">
            {ENGLISH_SKILLS.map((s) => {
              const row = drillStats[s];
              const p = pct(row.correct, row.total);
              return (
                <div key={s}>
                  <div className="flex justify-between text-xs">
                    <span>{SKILL_LABEL[s]}</span>
                    <span className="tabular-nums text-muted">
                      {row.total ? `${p}%` : "—"}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-navy"
                      style={{ width: `${row.total ? p : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-relaxed text-faint">
          Unseen English & GK items remaining:{" "}
          <span className="tabular-nums text-muted">
            {freshStatic}/{staticTotal}
          </span>
          . Mathematics is generated fresh each sitting. Questions are not reused until a
          subject–tier pool is exhausted; options are shuffled when they return.
        </p>

        <button
          type="button"
          onClick={onReset}
          className="mt-4 self-center text-xs text-faint underline-offset-2 hover:text-muted hover:underline"
        >
          Reset all progress on this device
        </button>
      </div>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-2 py-3 text-center">
      <div className="font-display text-xl tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">{label}</div>
    </div>
  );
}

export function InstructionsScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <Shell>
      <TopBar onBack={onBack} title="How this paper works" />
      <div className="flex flex-1 flex-col gap-3 text-sm leading-relaxed text-ink">
        {[
          ["Whole-paper clock", "45 or 60 minutes for all 60 questions — not a per-item timer. At zero the paper submits itself. You decide when to abandon."],
          ["Weighted tiers", "20 Easy (5 pts), 20 Hard (10), 20 Difficult (15). All Easy correct is only 100 points. You cannot pass on Easy alone."],
          ["Cutoff", `${PASS_MARK} / ${EXAM_TOTAL_POINTS} — 85%. You may lose at most 90 points.`],
          ["No calculator", "Arithmetic is mental-friendly. No formula sheet. No partial credit."],
          ["Traps", "Each item has one distractor that is correct under a careless reading. Speed without care is the designed failure mode."],
          ["Interleaving", "Subjects are mixed. There is no warm-up block. Context-switch is part of the tax."],
        ].map(([t, b]) => (
          <article key={t} className="rounded-xl border border-line bg-paper p-4">
            <h2 className="font-medium">{t}</h2>
            <p className="mt-1 text-muted">{b}</p>
          </article>
        ))}
      </div>
      <Button size="lg" className="mt-6 w-full" onClick={onContinue}>
        Choose subjects
      </Button>
    </Shell>
  );
}

export function SubjectPickerScreen({
  subjects,
  duration,
  onToggle,
  onDuration,
  onBack,
  onStart,
}: {
  subjects: Subject[];
  duration: DurationMin;
  onToggle: (s: Subject) => void;
  onDuration: (d: DurationMin) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const items: Array<{ id: Subject; icon: ReactNode; blurb: string }> = [
    { id: "english", icon: <BookOpen className="size-5" />, blurb: "Passages, vocabulary in context, grammar traps" },
    { id: "maths", icon: <Calculator className="size-5" />, blurb: "Word problems, identities, probability — no calculator" },
    { id: "gk", icon: <Globe className="size-5" />, blurb: "Foundations, not current affairs — plus short reasoning" },
  ];
  return (
    <Shell>
      <TopBar onBack={onBack} title="Build your paper" />
      <p className="mb-4 text-sm text-muted">
        Sixty questions split evenly across what you tap. Leave all three on for the real mix.
      </p>
      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const on = subjects.includes(it.id);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onToggle(it.id)}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150",
                on ? "border-navy bg-navy text-navy-fg" : "border-line bg-paper",
              )}
            >
              <span className={cn("grid size-10 place-items-center rounded-md", on ? "bg-navy-fg/10" : "bg-bg")}>
                {it.icon}
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{SUBJECT_LABEL[it.id]}</span>
                <span className={cn("block text-xs", on ? "text-navy-fg/70" : "text-muted")}>{it.blurb}</span>
              </span>
              {on && <Check className="size-4" />}
            </button>
          );
        })}
      </div>

      <h2 className="mt-8 text-sm font-medium">Whole-paper clock</h2>
      <p className="mt-1 text-xs text-muted">The real exam is 45 minutes. 60 is extra breathing room for training.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {([45, 60] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => onDuration(d)}
            className={cn(
              "flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-medium",
              duration === d ? "border-navy bg-navy text-navy-fg" : "border-line bg-paper",
            )}
          >
            <Timer className="size-4" />
            {d} minutes
          </button>
        ))}
      </div>

      <Button size="lg" className="mt-8 w-full" disabled={subjects.length === 0} onClick={onStart}>
        Begin {EXAM_QUESTION_COUNT}-question paper
      </Button>
    </Shell>
  );
}

export function TestScreen({
  questions,
  answers,
  index,
  remainingMs,
  mapOpen,
  confirmOpen,
  onSelect,
  onPrev,
  onNext,
  onJump,
  onToggleMap,
  onAskSubmit,
  onCancelSubmit,
  onConfirmSubmit,
}: {
  questions: Question[];
  answers: Array<number | null>;
  index: number;
  remainingMs: number;
  mapOpen: boolean;
  confirmOpen: boolean;
  onSelect: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  onToggleMap: () => void;
  onAskSubmit: () => void;
  onCancelSubmit: () => void;
  onConfirmSubmit: () => void;
}) {
  const q = questions[index]!;
  const answered = answers.filter((a) => a !== null).length;
  const warn = remainingMs <= 5 * 60 * 1000;
  const danger = remainingMs <= 60 * 1000;
  return (
    <Shell>
      <header className="mb-4 flex items-center gap-2">
        <span className="rounded-md bg-paper px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
          {SUBJECT_LABEL[q.subject]}
        </span>
        <span className="rounded-md bg-paper px-2 py-1 text-[11px] text-muted">{TIER_LABEL[q.difficulty]}</span>
        <span className="ml-auto flex items-center gap-1 font-medium tabular-nums text-sm">
          <Clock className={cn("size-4", danger ? "text-bad" : warn ? "text-warn" : "text-muted")} />
          <span className={cn(danger ? "text-bad" : warn ? "text-warn" : "text-ink")}>{formatMs(remainingMs)}</span>
        </span>
      </header>

      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span className="tabular-nums">
          Question {index + 1} / {questions.length}
        </span>
        <span className="tabular-nums">{answered} answered</span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-line">
        <div
          className="h-full bg-navy"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1">
        {q.passage && (
          <aside className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-line bg-paper p-3 text-sm leading-relaxed text-ink">
            {q.passage}
          </aside>
        )}
        <p className="mb-4 text-[15px] leading-relaxed">{q.stem}</p>
        <OptionList options={q.options} selected={answers[index] ?? null} onSelect={onSelect} />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <Button variant="secondary" size="icon" onClick={onPrev} disabled={index === 0} aria-label="Previous">
          <ChevronLeft className="size-5" />
        </Button>
        <Button variant="secondary" className="flex-1" onClick={onToggleMap}>
          <Grid3x3 className="size-4" />
          Map
        </Button>
        {index === questions.length - 1 ? (
          <Button className="flex-1" onClick={onAskSubmit}>
            Submit
          </Button>
        ) : (
          <Button className="flex-1" onClick={onNext}>
            Next
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>

      {mapOpen && (
        <Modal title="Question map" onClose={onToggleMap}>
          <div className="grid grid-cols-6 gap-2">
            {questions.map((qq, i) => (
              <button
                key={qq.id + i}
                type="button"
                onClick={() => onJump(i)}
                className={cn(
                  "grid h-10 place-items-center rounded-md text-xs tabular-nums",
                  i === index && "ring-2 ring-navy ring-offset-2 ring-offset-paper",
                  answers[i] !== null ? "bg-navy text-navy-fg" : "bg-bg text-muted",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" onClick={onAskSubmit}>
            Submit paper
          </Button>
        </Modal>
      )}

      {confirmOpen && (
        <Modal title="Submit this paper?" onClose={onCancelSubmit}>
          <p className="text-sm text-muted">
            {questions.length - answered} unanswered. Blanks score zero. This cannot be undone.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onCancelSubmit}>
              Keep working
            </Button>
            <Button className="flex-1" onClick={onConfirmSubmit}>
              Submit
            </Button>
          </div>
        </Modal>
      )}
    </Shell>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-md rounded-2xl border border-line bg-paper p-5 shadow-paper"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id="modal-title" className="font-display text-lg">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-md hover:bg-bg" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ResultsScreen({
  result,
  onReview,
  onHome,
  onRetake,
}: {
  result: ExamResult;
  onReview: () => void;
  onHome: () => void;
  onRetake: () => void;
}) {
  const p = pct(result.score, result.total);
  return (
    <Shell>
      <TopBar onBack={onHome} title="Result" />
      <div className="flex flex-col items-center">
        <ScoreRing score={result.score} total={result.total} />
        <p
          className={cn(
            "mt-4 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
            result.passed ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad",
          )}
        >
          {result.passed ? "Pass — at or above 85%" : "Below cutoff"}
        </p>
        <p className="mt-2 text-sm text-muted tabular-nums">
          {p}% · {formatMs(result.elapsedMs)} on a {result.durationMin}-minute clock
        </p>
      </div>

      <h2 className="mt-8 text-sm font-medium">By subject</h2>
      <div className="mt-2 flex flex-col gap-2">
        {(Object.keys(result.bySubject) as Subject[]).map((s) => {
          const row = result.bySubject[s];
          if (!row.total) return null;
          return (
            <BarRow
              key={s}
              label={SUBJECT_LABEL[s]}
              detail={`${row.points}/${row.possible} pts`}
              value={pct(row.points, row.possible)}
            />
          );
        })}
      </div>

      <h2 className="mt-6 text-sm font-medium">By difficulty</h2>
      <div className="mt-2 flex flex-col gap-2">
        {(["easy", "hard", "difficult"] as const).map((t) => {
          const row = result.byTier[t];
          return (
            <BarRow
              key={t}
              label={`${TIER_LABEL[t]} · ${TIER_POINTS[t]} pts each`}
              detail={`${row.correct}/${row.total}`}
              value={pct(row.correct, row.total)}
            />
          );
        })}
      </div>

      <h2 className="mt-6 text-sm font-medium">What to do next</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {result.recommendations.map((r) => (
          <li key={r} className="rounded-xl border border-line bg-paper p-3 text-sm leading-relaxed text-ink">
            {r}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" onClick={onReview}>
          Review every question
        </Button>
        <Button size="lg" variant="secondary" onClick={onRetake}>
          Sit another paper
        </Button>
        <Button size="lg" variant="ghost" onClick={onHome}>
          Home
        </Button>
      </div>
    </Shell>
  );
}

function BarRow({ label, detail, value }: { label: string; detail: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-3 py-2.5">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="tabular-nums text-muted">
          {detail} · {value}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-navy" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function ReviewScreen({
  result,
  index,
  onPrev,
  onNext,
  onHome,
}: {
  result: ExamResult;
  index: number;
  onPrev: () => void;
  onNext: () => void;
  onHome: () => void;
}) {
  const q = result.questions[index]!;
  const chosen = result.answers[index];
  const ok = chosen === q.correctIndex;
  return (
    <Shell>
      <TopBar onBack={onHome} title="Review" />
      <div className="mb-3 flex items-center gap-2 text-xs">
        <span className="rounded-md bg-paper px-2 py-1 text-muted">
          {index + 1}/{result.questions.length}
        </span>
        <span className={cn("rounded-md px-2 py-1", ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad")}>
          {ok ? "Correct" : chosen === null ? "Blank" : "Miss"}
        </span>
        <span className="ml-auto text-muted">{SUBJECT_LABEL[q.subject]} · {TIER_LABEL[q.difficulty]}</span>
      </div>
      {q.passage && (
        <aside className="mb-4 max-h-40 overflow-y-auto rounded-xl border border-line bg-paper p-3 text-sm leading-relaxed">
          {q.passage}
        </aside>
      )}
      <p className="mb-4 text-[15px] leading-relaxed">{q.stem}</p>
      <OptionList
        options={q.options}
        selected={chosen}
        onSelect={() => {}}
        revealed
        correctIndex={q.correctIndex}
        disabled
      />
      <div className="mt-4 rounded-xl border border-line bg-paper p-3 text-sm leading-relaxed text-muted">
        {q.explanation}
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="size-4" /> Prev
        </Button>
        {index === result.questions.length - 1 ? (
          <Button className="flex-1" onClick={onHome}>
            Done
          </Button>
        ) : (
          <Button className="flex-1" onClick={onNext}>
            Next <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </Shell>
  );
}

export function DrillPickerScreen({
  selected,
  onToggle,
  onBack,
  onStart,
}: {
  selected: EnglishSkill[];
  onToggle: (s: EnglishSkill) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <Shell>
      <TopBar onBack={onBack} title="English drill" />
      <p className="mb-4 text-sm text-muted">
        20 questions, {DRILL_MINUTES} minutes, instant feedback, no going back. Tap the skills to load.
      </p>
      <div className="flex flex-col gap-2">
        {ENGLISH_SKILLS.map((s) => {
          const on = selected.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left",
                on ? "border-navy bg-navy text-navy-fg" : "border-line bg-paper",
              )}
            >
              <span className="block text-sm font-medium">{SKILL_LABEL[s]}</span>
              <span className={cn("mt-0.5 block text-xs", on ? "text-navy-fg/70" : "text-muted")}>
                {SKILL_HINT[s]}
              </span>
            </button>
          );
        })}
      </div>
      <Button size="lg" className="mt-6 w-full" disabled={selected.length === 0} onClick={onStart}>
        Start drill
      </Button>
    </Shell>
  );
}

export function DrillSessionScreen({
  questions,
  index,
  remainingMs,
  selected,
  revealed,
  onSelect,
  onContinue,
}: {
  questions: Question[];
  index: number;
  remainingMs: number;
  selected: number | null;
  revealed: boolean;
  onSelect: (i: number) => void;
  onContinue: () => void;
}) {
  const q = questions[index]!;
  const ok = selected === q.correctIndex;
  return (
    <Shell>
      <header className="mb-4 flex items-center justify-between text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          {SKILL_LABEL[q.skill as EnglishSkill] ?? q.skill}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <Clock className="size-4 text-muted" />
          {formatMs(remainingMs)}
        </span>
      </header>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-line">
        <div className="h-full bg-navy" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
      {q.passage && (
        <aside className="mb-4 max-h-44 overflow-y-auto rounded-xl border border-line bg-paper p-3 text-sm leading-relaxed">
          {q.passage}
        </aside>
      )}
      <p className="mb-1 text-xs tabular-nums text-muted">
        {index + 1} / {questions.length}
      </p>
      <p className="mb-4 text-[15px] leading-relaxed">{q.stem}</p>
      <OptionList
        options={q.options}
        selected={selected}
        onSelect={onSelect}
        revealed={revealed}
        correctIndex={q.correctIndex}
        disabled={revealed}
      />
      {revealed && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-3 text-sm leading-relaxed",
            ok ? "border-ok/30 bg-ok-soft text-ok" : "border-bad/30 bg-bad-soft text-ink",
          )}
        >
          <p className="font-medium">{ok ? "Correct" : "Not quite"}</p>
          <p className="mt-1 text-ink">{q.explanation}</p>
        </div>
      )}
      {revealed && (
        <Button size="lg" className="mt-6 w-full" onClick={onContinue}>
          {index === questions.length - 1 ? "See drill results" : "Next question"}
        </Button>
      )}
    </Shell>
  );
}

export function DrillResultsScreen({
  correct,
  total,
  stats,
  onAgain,
  onHome,
}: {
  correct: number;
  total: number;
  stats: DrillStats;
  onAgain: () => void;
  onHome: () => void;
}) {
  return (
    <Shell>
      <TopBar onBack={onHome} title="Drill result" />
      <div className="rounded-2xl border border-line bg-paper p-5 text-center shadow-paper">
        <p className="font-display text-4xl tabular-nums">
          {correct}
          <span className="text-lg text-muted">/{total}</span>
        </p>
        <p className="mt-1 text-sm text-muted">{pct(correct, total)}% this session</p>
      </div>
      <h2 className="mt-6 text-sm font-medium">Lifetime mastery</h2>
      <div className="mt-3 flex flex-col gap-3">
        {ENGLISH_SKILLS.map((s) => {
          const row = stats[s];
          const p = pct(row.correct, row.total);
          return (
            <div key={s} className="rounded-xl border border-line bg-paper px-3 py-2.5">
              <div className="flex justify-between text-xs">
                <span>{SKILL_LABEL[s]}</span>
                <span className="tabular-nums text-muted">{row.total ? `${p}% · ${row.total} items` : "No data"}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-navy" style={{ width: `${row.total ? p : 0}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" onClick={onAgain}>
          <RotateCcw className="size-4" /> Another drill
        </Button>
        <Button size="lg" variant="secondary" onClick={onHome}>
          Home
        </Button>
      </div>
    </Shell>
  );
}

export function StudyScreen({ onBack }: { onBack: () => void }) {
  const weeks = [
    ["Week 1", "Vocabulary in context", "15 drill questions daily. Read one editorial and note five words in context."],
    ["Week 2", "Tone and purpose", "Two passages daily. Write one sentence on tone, one on purpose."],
    ["Week 3", "Subject–verb agreement", "20 drill questions daily. Ignore the prepositional phrase."],
    ["Week 4", "Tense, pronouns, semicolons", "20 mixed drill questions daily."],
    ["Week 5+", "Full simulations", "One 60-question paper a week. Drill the weakest skill between papers."],
  ] as const;
  return (
    <Shell>
      <TopBar onBack={onBack} title="Study plan" />
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Untimed practice builds knowledge. Timed practice builds judgement — and judgement is what the cutoff measures.
      </p>
      <div className="flex flex-col gap-2">
        {weeks.map(([w, t, b]) => (
          <article key={w} className="rounded-xl border border-line bg-paper p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gold">{w}</p>
            <h2 className="mt-1 font-medium">{t}</h2>
            <p className="mt-1 text-sm text-muted">{b}</p>
          </article>
        ))}
      </div>
      <section className="mt-6 rounded-xl border border-line bg-paper p-4">
        <h2 className="font-medium">After every miss, ask</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Not “what is the right answer?” — “why did the wrong answer look right to me?” That is the only question that moves a score at 85%.
        </p>
      </section>
    </Shell>
  );
}
