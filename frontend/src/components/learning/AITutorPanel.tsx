import { useState, type FormEvent } from 'react';
import { BookOpenText, Check, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { askLessonTutor, getApiErrorMessage } from '../../services/api';
import { formatTimestamp } from '../../features/learning/playback';

interface AITutorPanelProps {
  lessonId: string;
  currentTimestamp: number;
}

export default function AITutorPanel({ lessonId, currentTimestamp }: AITutorPanelProps) {
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<Array<{ label: string; timestamp?: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSubmitting) return;

    setError('');
    setAnswer('');
    setCitations([]);
    setIsSubmitting(true);
    try {
      const response = await askLessonTutor({
        lessonId,
        currentTimestamp,
        question: trimmedQuestion,
      });
      setAnswer(response.answer);
      setCitations(response.citations ?? []);
      setQuestion('');
    } catch (requestError: unknown) {
      setError(getApiErrorMessage(requestError, 'The AI Tutor service is not available yet. No answer was generated.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="ai-tutor-heading" className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-20">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-100 text-violet-700"><Sparkles className="h-4 w-4" /></span>
          <div>
            <h2 id="ai-tutor-heading" className="text-xs font-semibold text-slate-900">AI Tutor</h2>
            <p className="mt-0.5 text-[9px] text-slate-500">Lesson context · {formatTimestamp(currentTimestamp)}</p>
          </div>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-amber-800">Preview</span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><Sparkles className="h-3.5 w-3.5" /></span>
          <div className="rounded-xl rounded-tl-sm bg-slate-50 p-3">
            <p className="text-[10px] font-semibold text-slate-800">Ask about the lesson</p>
            <p className="mt-1 text-[9px] leading-4 text-slate-600">Questions are prepared with the lesson ID and your current playback timestamp. The AI service is not connected yet.</p>
          </div>
        </div>

        {answer && (
          <div className="mt-4 flex items-start gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Check className="h-3.5 w-3.5" /></span>
            <div className="min-w-0 rounded-xl rounded-tl-sm bg-emerald-50/70 p-3">
              <p className="whitespace-pre-wrap text-[10px] leading-5 text-slate-700">{answer}</p>
              {citations.map((citation) => (
                <div key={`${citation.label}-${citation.timestamp ?? ''}`} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-white px-2 py-1 text-[8px] text-emerald-800">
                  <BookOpenText className="h-3 w-3" /> {citation.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[9px] leading-4 text-amber-900">
            <X className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-auto pt-6">
          <p className="mb-2 text-[8px] leading-4 text-slate-400">Only lessonId, currentTimestamp, and your question are sent. Transcript content is not included.</p>
          <form onSubmit={submitQuestion} className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
            <label className="sr-only" htmlFor="tutor-question">Ask a question about this lesson</label>
            <textarea
              id="tutor-question"
              value={question}
              onChange={(event) => setQuestion(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={2000}
              rows={2}
              placeholder="Ask a question about this lesson…"
              className="w-full resize-none border-0 bg-transparent px-1 py-1 text-[10px] leading-5 text-slate-800 outline-none placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-[8px] text-slate-400">Enter to send · Shift+Enter for a new line</span>
              <button type="submit" disabled={!question.trim() || isSubmitting} aria-label="Send question to AI Tutor" className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                {isSubmitting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </form>
          <p className="mt-2 inline-flex items-center gap-1 text-[8px] text-slate-400"><MessageCircle className="h-3 w-3" /> Answers will appear here when the tutor API is connected.</p>
        </div>
      </div>
    </section>
  );
}
