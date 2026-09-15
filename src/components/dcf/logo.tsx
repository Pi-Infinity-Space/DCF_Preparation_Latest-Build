import { cn } from "@/lib/utils";

export function ScholarStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("block", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5c3d6e" />
          <stop offset="100%" stopColor="#243652" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#ss-bg)" />
      <path
        d="M10 28 L32 18 L54 28 L32 24 Z"
        fill="#f3e6c4"
      />
      <rect x="20" y="28" width="24" height="4" rx="1" fill="#e8d9a8" />
      <rect x="28" y="32" width="8" height="12" rx="1" fill="#f3e6c4" />
      <circle cx="32" cy="46" r="2.2" fill="#8a6a2c" />
      <path d="M44 14 L45.6 18.2 L50 18.6 L46.6 21.4 L47.6 25.6 L44 23.4 L40.4 25.6 L41.4 21.4 L38 18.6 L42.4 18.2 Z" fill="#c9a44a" />
      <path d="M50 10 L51 12.6 L53.8 12.8 L51.6 14.6 L52.2 17.2 L50 15.8 L47.8 17.2 L48.4 14.6 L46.2 12.8 L49 12.6 Z" fill="#e8d9a8" />
    </svg>
  );
}
