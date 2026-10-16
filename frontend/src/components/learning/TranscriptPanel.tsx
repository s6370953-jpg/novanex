import { useMemo, useState, type FormEvent } from 'react';
import { BookOpenText, Clock3, Plus, Radio, X } from 'lucide-react';
import type { TranscriptSegment } from '../../features/learning/lesson';
import { formatTimestamp, parseTimestampInput } from '../../features/learning/playback';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
  activeIndex: number;
  onSeek: (seconds: number) => void;
  onAdd: (segment: TranscriptSegment) => void;
}

export default function TranscriptPanel({ segments, activeIndex, onSeek, onAdd }: TranscriptPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [text, setText] = useState('');
  const [formError, setFormError] = useState('');
  const sortedSegments = useMemo(() => [...segments].sort((a, b) => a.startTime - b.startTime), [segments]);

  const submitSegment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const startTime = parseTimestampInput(start);
    const endTime = parseTimestampInput(end);
    if (startTime === null || endTime === null) {
      setFormError('Enter both timestamps in mm:ss format.');
      return;
    }
    if (endTime <= startTime) {
      setFormError('The end time must be after the start time.');
      return;
    }
    if (!text.trim()) {
      setFormError('Add transcript text before saving this segment.');
      return;
    }

    onAdd({
      id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      startTime,
      endTime,
      text: text.trim(),
    });
    setStart('');
    setEnd('');
    setText('');
    setShowForm(false);
  };

  return (
    <section aria-labelledby="transcript-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><BookOpenText className="h-4 w-4" /></span>
          <div>
            <h2 id="transcript-heading" className="text-xs font-semibold text-slate-900">Lesson transcript</h2>
            <p className="mt-0.5 text-[9px] text-slate-500">{segments.length} {segments.length === 1 ? 'segment' : 'segments'} · click a timestamp to seek</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((shown) => !shown); setFormError(''); }}
          aria-label={showForm ? 'Close transcript segment form' : 'Add transcript segment'}
          aria-expanded={showForm}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-[9px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{showForm ? 'Close' : 'Add segment'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={submitSegment} className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[100px_100px_minmax(0,1fr)_auto] sm:items-end">
          <label className="grid gap-1 text-[9px] font-semibold text-slate-600">
            Start (mm:ss)
            <input value={start} onChange={(event) => setStart(event.currentTarget.value)} placeholder="00:12" inputMode="numeric" aria-label="Segment start time in minutes and seconds" className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="grid gap-1 text-[9px] font-semibold text-slate-600">
            End (mm:ss)
            <input value={end} onChange={(event) => setEnd(event.currentTarget.value)} placeholder="00:24" inputMode="numeric" aria-label="Segment end time in minutes and seconds" className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="grid gap-1 text-[9px] font-semibold text-slate-600">
            Transcript text
            <input value={text} onChange={(event) => setText(event.currentTarget.value)} placeholder="Add a short transcript segment…" aria-label="Transcript segment text" className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <button type="submit" className="rounded-lg bg-indigo-600 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-indigo-700">Save</button>
          {formError && <p role="alert" className="text-[10px] text-rose-700 sm:col-span-full">{formError}</p>}
          <p className="text-[9px] leading-4 text-slate-500 sm:col-span-full">Added to this page only; transcript content is not sent to the AI tutor.</p>
        </form>
      )}

      <div className="max-h-[310px] overflow-y-auto p-2.5 sm:max-h-[360px] sm:p-3" role="list" aria-label="Transcript segments">
        {sortedSegments.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center px-5 text-center">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-400"><Clock3 className="h-4 w-4" /></span>
            <p className="mt-3 text-[11px] font-semibold text-slate-700">No transcript segments yet</p>
            <p className="mt-1 max-w-sm text-[10px] leading-4 text-slate-500">Add timestamped segments to make this lesson easier to review.</p>
          </div>
        ) : (
          sortedSegments.map((segment) => {
            const originalIndex = segments.findIndex((candidate) => candidate.id === segment.id);
            const isActive = originalIndex === activeIndex;
            return (
              <button
                type="button"
                key={segment.id}
                role="listitem"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSeek(segment.startTime)}
                className={`group mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition last:mb-0 ${isActive ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-100' : 'hover:bg-slate-50'}`}
              >
                <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold tabular-nums ${isActive ? 'text-indigo-700' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                  {isActive && <Radio className="h-3 w-3" />}
                  {formatTimestamp(segment.startTime)}
                </span>
                <span className={`text-[10px] leading-5 ${isActive ? 'font-medium text-indigo-950' : 'text-slate-600'}`}>{segment.text}</span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
