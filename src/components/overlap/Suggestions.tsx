'use client';

interface SuggestionsProps {
  suggestions: Array<any>;
  sourceTZ: string;
}

export default function Suggestions({ suggestions, sourceTZ }: SuggestionsProps) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">Suggested slots</h2>
      </div>
      {suggestions.length === 0 ? (
        <div className="text-sm text-muted-foreground">No suggestions yet. Adjust cities, duration, or day.</div>
      ) : (
        <div className="grid gap-2">
          {suggestions.map((s, idx) => (
            <div key={idx} className="rounded-lg border p-3 text-sm">
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


