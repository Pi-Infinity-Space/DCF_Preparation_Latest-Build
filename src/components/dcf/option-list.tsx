import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"] as const;

export function OptionList({
  options,
  selected,
  onSelect,
  revealed,
  correctIndex,
  disabled,
}: {
  options: readonly string[];
  selected: number | null;
  onSelect: (i: number) => void;
  revealed?: boolean;
  correctIndex?: number;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt, i) => {
        const isSel = selected === i;
        const isCorrect = revealed && i === correctIndex;
        const isWrongSel = revealed && isSel && i !== correctIndex;
        return (
          <button
            key={`${i}-${opt}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(i)}
            className={cn(
              "flex min-h-12 items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm leading-snug transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
              !revealed && !isSel && "border-line bg-paper text-ink hover:border-navy/30",
              !revealed && isSel && "border-navy bg-navy text-navy-fg",
              isCorrect && "border-ok bg-ok-soft text-ok",
              isWrongSel && "border-bad bg-bad-soft text-bad",
              revealed && !isCorrect && !isWrongSel && "border-line bg-paper text-muted",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-6 shrink-0 place-items-center rounded-sm text-xs font-semibold",
                !revealed && !isSel && "bg-bg text-muted",
                !revealed && isSel && "bg-navy-fg/15 text-navy-fg",
                isCorrect && "bg-ok text-paper",
                isWrongSel && "bg-bad text-paper",
                revealed && !isCorrect && !isWrongSel && "bg-bg text-faint",
              )}
            >
              {LETTERS[i]}
            </span>
            <span className="pt-0.5">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}
