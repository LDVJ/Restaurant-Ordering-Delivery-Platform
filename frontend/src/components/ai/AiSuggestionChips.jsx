import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'Summarize my last five orders',
  'Which of my orders are still not delivered?',
  'How much did I spend this week?',
  'Which food items have I ordered most?',
];

/**
 * AiSuggestionChips Component
 * Renders 4 clickable suggestion chips that populate and submit example queries.
 */
export default function AiSuggestionChips({ onSelect, disabled = false }) {
  return (
    <div className="space-y-2 text-left">
      <p className="text-xs font-semibold text-muted-text uppercase tracking-wider flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-brand" />
        <span>Try asking</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-border text-text-main hover:border-brand hover:text-brand hover:bg-brand-tint/30 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
