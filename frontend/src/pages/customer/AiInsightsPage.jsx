import { useState } from 'react';
import { Bot, Send, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { askAi } from '../../api/aiApi';
import { getErrorMessage } from '../../utils/errors';
import { FIELD_LIMITS } from '../../utils/constants';

import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import AiSuggestionChips from '../../components/ai/AiSuggestionChips';
import AiSessionHistory from '../../components/ai/AiSessionHistory';

export default function AiInsightsPage() {
  const [question, setQuestion] = useState('');
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [askedQuestion, setAskedQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [history, setHistory] = useState([]);

  const executeAsk = async (queryToAsk) => {
    setIsLoading(true);
    setErrorInfo(null);
    setAskedQuestion(queryToAsk || 'Summarize my last 5 orders');

    try {
      const data = await askAi(queryToAsk);
      const answerText = data.answer || 'No answer returned.';

      if (activeAnswer) {
        setHistory((prev) => [
          { question: askedQuestion, answer: activeAnswer },
          ...prev,
        ]);
      }

      setActiveAnswer(answerText);
    } catch (err) {
      const status = err?.response?.status;
      let message = getErrorMessage(err);

      if (status === 429) {
        message = 'Too many requests. Please wait a minute and try again.';
      } else if (status === 503) {
        message = 'The AI assistant is not available right now.';
      } else if (status === 504) {
        message = 'The AI assistant took too long. Please try again.';
      }

      setErrorInfo({ message, failedQuery: queryToAsk });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (isLoading || !question.trim()) return;
    const query = question.trim();
    executeAsk(query);
    setQuestion('');
  };

  const handleChipSelect = (suggestion) => {
    setQuestion(suggestion);
    executeAsk(suggestion);
  };

  return (
    <div className="space-y-6 pb-20 text-left max-w-3xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-tint text-brand text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CampusBite Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          AI Order Insights
        </h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1 max-w-xl">
          Ask questions about your meals, spending, or delivery progress. All answers are based only on your own orders.
        </p>
      </div>

      <AiSuggestionChips onSelect={handleChipSelect} disabled={isLoading} />

      <form onSubmit={handleCustomSubmit} className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-3">
        <div>
          <label htmlFor="ai-question" className="block text-xs font-semibold text-text-main mb-1">
            Ask your question
          </label>
          <textarea
            id="ai-question"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which foods have I spent the most on this month?"
            maxLength={FIELD_LIMITS.AI_QUESTION_MAX}
            disabled={isLoading}
            className="w-full p-3 rounded-xl border border-border bg-white text-xs sm:text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors resize-none disabled:bg-gray-50"
          />
          <div className="flex justify-end text-[11px] text-muted-text mt-1">
            <span>{question.length}/{FIELD_LIMITS.AI_QUESTION_MAX}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => executeAsk('')}
            disabled={isLoading}
            className="text-xs text-muted-text hover:text-brand"
          >
            Summarize my last 5 orders
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={isLoading || !question.trim()}
            icon={Send}
            className="h-9 px-4"
          >
            Ask
          </Button>
        </div>
      </form>

      {errorInfo && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-left space-y-2.5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-red-900 font-medium">{errorInfo.message}</p>
          </div>
          <div className="pl-6.5">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={() => executeAsk(errorInfo.failedQuery)}
              className="text-xs h-7 py-0 px-2.5 border-red-300 bg-white hover:bg-red-100/50 text-red-900"
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-6 rounded-2xl bg-white border border-border shadow-2xs flex items-center justify-center gap-3 text-muted-text text-xs sm:text-sm">
          <Spinner size="sm" className="text-brand" />
          <span>Analyzing your CampusBite orders...</span>
        </div>
      )}

      {!isLoading && activeAnswer && (
        <div className="bg-white rounded-2xl border border-brand/30 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-border/70">
            <Bot className="w-5 h-5 text-brand" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Answer for: &ldquo;{askedQuestion}&rdquo;
            </span>
          </div>
          <div className="text-xs sm:text-sm text-text-main leading-relaxed whitespace-pre-wrap font-sans">
            {activeAnswer}
          </div>
        </div>
      )}

      <AiSessionHistory history={history} />
    </div>
  );
}
