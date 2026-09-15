import { PASS_MARK } from "@/lib/exam/types";
import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  total,
  size = 168,
}: {
  score: number;
  total: number;
  size?: number;
}) {
  const pct = total > 0 ? score / total : 0;
  const passed = score >= PASS_MARK;
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c * pct;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" className="text-line" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          className={passed ? "text-ok" : "text-bad"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-4xl tabular-nums leading-none", passed ? "text-ok" : "text-ink")}>
          {score}
        </span>
        <span className="mt-1 text-xs text-muted tabular-nums">of {total}</span>
      </div>
    </div>
  );
}
