'use client';

interface BestWindowBannerProps {
  suggestion: null | { label: string; lines: { city: string; local: string }[]; score: number };
  onCopy: () => void;
}

export default function BestWindowBanner({ suggestion, onCopy }: BestWindowBannerProps) {
  if (!suggestion) return null;
  const quality = suggestion.score >= 2 * 3 ? 'Comfortable' : suggestion.score >= 3 ? 'Mixed' : 'Borderline';
  const qualityClass = quality === 'Comfortable' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : quality === 'Mixed' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400';
  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-muted-foreground">Best Overlap</div>
        <div className="text-sm font-medium">{suggestion.label}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs ${qualityClass}`}>{quality}</span>
        </div>
      </div>
      <button
        className="inline-flex items-center h-9 px-4 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground"
        onClick={onCopy}
        aria-label="Copy best overlap"
      >
        Copy
      </button>
    </div>
  );
}


