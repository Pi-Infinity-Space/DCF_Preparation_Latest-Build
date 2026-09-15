import { useCallback, useEffect, useRef, useState } from "react";
import { buildDrill, buildExam, STATIC_BANK } from "@/lib/exam/engine";
import { buildRecommendations, scoreAttempt } from "@/lib/exam/recommendations";
import {
  loadAttempts,
  loadDrillStats,
  loadSession,
  loadUsedIds,
  markServed,
  recordDrillAnswers,
  resetAllProgress,
  saveAttempt,
  saveDrillAttempt,
  saveSession,
} from "@/lib/exam/storage";
import {
  DRILL_MINUTES,
  ENGLISH_SKILLS,
  type Attempt,
  type DrillStats,
  type DurationMin,
  type EnglishSkill,
  type ExamResult,
  type Question,
  type SavedSession,
  type Screen,
  type Subject,
} from "@/lib/exam/types";
import {
  DrillPickerScreen,
  DrillResultsScreen,
  DrillSessionScreen,
  HomeScreen,
  InstructionsScreen,
  ResultsScreen,
  ReviewScreen,
  StudyScreen,
  SubjectPickerScreen,
  TestScreen,
} from "./screens";

const ALL_SUBJECTS: Subject[] = ["english", "maths", "gk"];

export function DcfApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [drillStats, setDrillStats] = useState<DrillStats>(() =>
    Object.fromEntries(ENGLISH_SKILLS.map((s) => [s, { correct: 0, total: 0 }])) as DrillStats,
  );
  const [freshStatic, setFreshStatic] = useState(STATIC_BANK.length);
  const [hasSession, setHasSession] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>(ALL_SUBJECTS);
  const [duration, setDuration] = useState<DurationMin>(45);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Array<number | null>>([]);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(45 * 60 * 1000);
  const [startedAt, setStartedAt] = useState(0);
  const [kind, setKind] = useState<"exam" | "drill">("exam");
  const [skills, setSkills] = useState<EnglishSkill[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [drillSelected, setDrillSelected] = useState<number | null>(null);
  const [drillRevealed, setDrillRevealed] = useState(false);
  const [drillCorrect, setDrillCorrect] = useState(0);

  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  const remainingRef = useRef(remainingMs);
  const screenRef = useRef(screen);
  const finishingRef = useRef(false);
  questionsRef.current = questions;
  answersRef.current = answers;
  remainingRef.current = remainingMs;
  screenRef.current = screen;

  const refreshHome = useCallback(() => {
    setAttempts(loadAttempts());
    setDrillStats(loadDrillStats());
    const used = loadUsedIds();
    setFreshStatic(STATIC_BANK.filter((q) => !used.has(q.id)).length);
    setHasSession(!!loadSession());
  }, []);

  useEffect(() => {
    refreshHome();
  }, [refreshHome]);

  const persist = useCallback(
    (patch: Partial<SavedSession> = {}) => {
      if (screenRef.current !== "test" && screenRef.current !== "drill") return;
      const session: SavedSession = {
        kind,
        durationMin: duration,
        subjects,
        skills,
        questions: questionsRef.current,
        answers: answersRef.current,
        currentIndex: index,
        remainingMs: remainingRef.current,
        startedAt,
        ...patch,
      };
      saveSession(session);
      setHasSession(true);
    },
    [kind, duration, subjects, skills, index, startedAt],
  );

  const finishExam = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const qs = questionsRef.current;
    const ans = answersRef.current;
    const scored = scoreAttempt(qs, ans);
    const elapsed = Math.max(0, duration * 60 * 1000 - remainingRef.current);
    const recs = buildRecommendations(qs, ans, scored);
    const examResult: ExamResult = {
      score: scored.score,
      total: scored.total,
      passed: scored.passed,
      answers: ans,
      questions: qs,
      bySubject: scored.bySubject,
      byTier: scored.byTier,
      recommendations: recs,
      durationMin: duration,
      elapsedMs: elapsed,
    };
    saveAttempt({
      id: `${Date.now()}`,
      at: Date.now(),
      durationMin: duration,
      subjects,
      score: scored.score,
      total: scored.total,
      passed: scored.passed,
      bySubject: scored.bySubject,
      byTier: scored.byTier,
      weakSkills: scored.weakSkills,
    });
    saveSession(null);
    setResult(examResult);
    setHasSession(false);
    setScreen("results");
    setConfirmOpen(false);
    setMapOpen(false);
    refreshHome();
  }, [duration, subjects, refreshHome]);

  const finishDrill = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const qs = questionsRef.current;
    const ans = answersRef.current;
    const rows = qs.map((q, i) => ({
      skill: q.skill as EnglishSkill,
      correct: ans[i] === q.correctIndex,
    }));
    const ok = rows.filter((r) => r.correct).length;
    recordDrillAnswers(rows);
    saveDrillAttempt({
      id: `${Date.now()}`,
      at: Date.now(),
      skills,
      correct: ok,
      total: qs.length,
    });
    saveSession(null);
    setDrillCorrect(ok);
    setHasSession(false);
    setScreen("drill-results");
    refreshHome();
  }, [skills, refreshHome]);

  const persistRef = useRef(persist);
  persistRef.current = persist;
  const finishExamRef = useRef(finishExam);
  finishExamRef.current = finishExam;
  const finishDrillRef = useRef(finishDrill);
  finishDrillRef.current = finishDrill;

  useEffect(() => {
    if (screen !== "test" && screen !== "drill") return;
    const id = window.setInterval(() => {
      setRemainingMs((ms) => {
        const next = ms - 1000;
        remainingRef.current = next;
        if (next <= 0) {
          window.clearInterval(id);
          if (screenRef.current === "test") finishExamRef.current();
          else finishDrillRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
    const saveId = window.setInterval(() => persistRef.current(), 4000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(saveId);
    };
  }, [screen]);

  function applySession(session: SavedSession) {
    finishingRef.current = false;
    setKind(session.kind);
    setDuration(session.durationMin);
    setSubjects(session.subjects);
    setSkills(session.skills);
    setQuestions(session.questions);
    setAnswers(session.answers);
    setIndex(session.currentIndex);
    setRemainingMs(session.remainingMs);
    setStartedAt(session.startedAt);
    setDrillSelected(session.kind === "drill" ? session.answers[session.currentIndex] : null);
    setDrillRevealed(session.kind === "drill" && session.answers[session.currentIndex] !== null);
    setScreen(session.kind === "exam" ? "test" : "drill");
  }

  function startExam() {
    finishingRef.current = false;
    const used = loadUsedIds();
    const paper = buildExam(subjects, used);
    markServed(paper.map((q) => q.id));
    const now = Date.now();
    setKind("exam");
    setQuestions(paper);
    setAnswers(Array(paper.length).fill(null));
    setIndex(0);
    setRemainingMs(duration * 60 * 1000);
    setStartedAt(now);
    setMapOpen(false);
    setConfirmOpen(false);
    setResult(null);
    setScreen("test");
    saveSession({
      kind: "exam",
      durationMin: duration,
      subjects,
      skills,
      questions: paper,
      answers: Array(paper.length).fill(null),
      currentIndex: 0,
      remainingMs: duration * 60 * 1000,
      startedAt: now,
    });
    setHasSession(true);
    setFreshStatic(STATIC_BANK.filter((q) => !loadUsedIds().has(q.id)).length);
  }

  function startDrill() {
    finishingRef.current = false;
    const used = loadUsedIds();
    const paper = buildDrill(skills, used);
    markServed(paper.map((q) => q.id));
    const now = Date.now();
    setKind("drill");
    setQuestions(paper);
    setAnswers(Array(paper.length).fill(null));
    setIndex(0);
    setRemainingMs(DRILL_MINUTES * 60 * 1000);
    setStartedAt(now);
    setDrillSelected(null);
    setDrillRevealed(false);
    setScreen("drill");
    saveSession({
      kind: "drill",
      durationMin: duration,
      subjects,
      skills,
      questions: paper,
      answers: Array(paper.length).fill(null),
      currentIndex: 0,
      remainingMs: DRILL_MINUTES * 60 * 1000,
      startedAt: now,
    });
    setHasSession(true);
  }

  function toggleSubject(s: Subject) {
    setSubjects((cur) => {
      if (cur.includes(s)) {
        const next = cur.filter((x) => x !== s);
        return next.length ? next : cur;
      }
      return [...cur, s];
    });
  }

  function toggleSkill(s: EnglishSkill) {
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  function selectAnswer(i: number) {
    const next = answers.slice();
    next[index] = i;
    answersRef.current = next;
    setAnswers(next);
    persist({ answers: next, currentIndex: index });
  }

  function drillPick(i: number) {
    if (drillRevealed) return;
    setDrillSelected(i);
    setDrillRevealed(true);
    setAnswers((cur) => {
      const next = cur.slice();
      next[index] = i;
      answersRef.current = next;
      return next;
    });
  }

  function drillContinue() {
    if (index >= questions.length - 1) {
      finishDrill();
      return;
    }
    const nextI = index + 1;
    setIndex(nextI);
    setDrillSelected(null);
    setDrillRevealed(false);
    persist({ currentIndex: nextI });
  }

  if (screen === "instructions") {
    return <InstructionsScreen onBack={() => setScreen("home")} onContinue={() => setScreen("subjects")} />;
  }
  if (screen === "subjects") {
    return (
      <SubjectPickerScreen
        subjects={subjects}
        duration={duration}
        onToggle={toggleSubject}
        onDuration={setDuration}
        onBack={() => setScreen("instructions")}
        onStart={startExam}
      />
    );
  }
  if (screen === "test" && questions.length) {
    return (
      <TestScreen
        questions={questions}
        answers={answers}
        index={index}
        remainingMs={remainingMs}
        mapOpen={mapOpen}
        confirmOpen={confirmOpen}
        onSelect={selectAnswer}
        onPrev={() => {
          setIndex((i) => Math.max(0, i - 1));
          persist({ currentIndex: Math.max(0, index - 1) });
        }}
        onNext={() => {
          setIndex((i) => Math.min(questions.length - 1, i + 1));
          persist({ currentIndex: Math.min(questions.length - 1, index + 1) });
        }}
        onJump={(i) => {
          setIndex(i);
          setMapOpen(false);
          persist({ currentIndex: i });
        }}
        onToggleMap={() => setMapOpen((v) => !v)}
        onAskSubmit={() => {
          setMapOpen(false);
          setConfirmOpen(true);
        }}
        onCancelSubmit={() => setConfirmOpen(false)}
        onConfirmSubmit={finishExam}
      />
    );
  }
  if (screen === "results" && result) {
    return (
      <ResultsScreen
        result={result}
        onReview={() => {
          setReviewIndex(0);
          setScreen("review");
        }}
        onHome={() => setScreen("home")}
        onRetake={() => setScreen("subjects")}
      />
    );
  }
  if (screen === "review" && result) {
    return (
      <ReviewScreen
        result={result}
        index={reviewIndex}
        onPrev={() => setReviewIndex((i) => Math.max(0, i - 1))}
        onNext={() => setReviewIndex((i) => Math.min(result.questions.length - 1, i + 1))}
        onHome={() => setScreen("home")}
      />
    );
  }
  if (screen === "drill-pick") {
    return (
      <DrillPickerScreen
        selected={skills}
        onToggle={toggleSkill}
        onBack={() => setScreen("home")}
        onStart={startDrill}
      />
    );
  }
  if (screen === "drill" && questions.length) {
    return (
      <DrillSessionScreen
        questions={questions}
        index={index}
        remainingMs={remainingMs}
        selected={drillSelected}
        revealed={drillRevealed}
        onSelect={drillPick}
        onContinue={drillContinue}
      />
    );
  }
  if (screen === "drill-results") {
    return (
      <DrillResultsScreen
        correct={drillCorrect}
        total={questions.length || 20}
        stats={drillStats}
        onAgain={() => setScreen("drill-pick")}
        onHome={() => setScreen("home")}
      />
    );
  }
  if (screen === "study") {
    return <StudyScreen onBack={() => setScreen("home")} />;
  }

  return (
    <HomeScreen
      attempts={attempts}
      drillStats={drillStats}
      hasSession={hasSession}
      freshStatic={freshStatic}
      staticTotal={STATIC_BANK.length}
      onStart={() => setScreen("instructions")}
      onDrill={() => {
        setSkills([...ENGLISH_SKILLS]);
        setScreen("drill-pick");
      }}
      onStudy={() => setScreen("study")}
      onResume={() => {
        const s = loadSession();
        if (s) applySession(s);
      }}
      onReset={() => {
        if (window.confirm("Erase all scores, drills, and the unseen-question memory on this device?")) {
          resetAllProgress();
          finishingRef.current = false;
          setResult(null);
          setQuestions([]);
          refreshHome();
        }
      }}
    />
  );
}
