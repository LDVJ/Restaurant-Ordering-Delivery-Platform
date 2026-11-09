import { History, MessageSquare, Bot } from 'lucide-react';

/**
 * AiSessionHistory Component
 * Displays the session history of questions and answers asked during this visit.
 */
export default function AiSessionHistory({ history = [] }) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-4 pt-6 border-t border-border/80 text-left">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-text uppercase tracking-wider">
        <History className="w-3.5 h-3.5 text-brand" />
        <span>Earlier questions in this session ({history.length})</span>
      </div>

      <div className="space-y-3">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-2.5"
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-text-main">
                {item.question || 'Summarize my last 5 orders'}
              </p>
            </div>
            <div className="flex items-start gap-2 pl-2 border-l-2 border-brand/20">
              <Bot className="w-3.5 h-3.5 text-muted-text shrink-0 mt-0.5" />
              <p className="text-xs text-muted-text whitespace-pre-wrap leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
