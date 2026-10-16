import { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  CircleHelp,
  FileText,
  MessageCircle,
  Pause,
  Play,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';

const duration = 48 * 60 + 36;

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default function ProductPreview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(4 * 60 + 12);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((time) => (time >= duration ? 0 : time + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const jumpToSource = () => setCurrentTime(4 * 60 + 12);
  const progress = (currentTime / duration) * 100;

  return (
    <section aria-label="Learnova Tutor demo learning workspace" className="relative mx-auto w-full max-w-[670px]">
      <div className="absolute -inset-5 -z-10 rounded-[34px] bg-gradient-to-br from-indigo-100/80 via-violet-100/55 to-emerald-100/70 blur-2xl" />
      <div className="overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-[0_28px_90px_-40px_rgba(38,35,76,0.42)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-600 text-white"><BookOpen className="h-4 w-4" /></span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-slate-800">Introduction to Neural Networks</p>
              <p className="mt-0.5 text-[9px] text-slate-500">Machine Learning · Chapter 04</p>
            </div>
          </div>
          <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Demo
          </span>
        </div>

        <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
          <div className="border-b border-slate-100 p-3 sm:p-4 lg:border-b-0 lg:border-r">
            <div className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl bg-[#111629] p-3.5 text-white sm:p-4">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(129,112,225,0.34),transparent_34%),radial-gradient(ellipse_at_25%_85%,rgba(56,189,154,0.18),transparent_32%)]" />
              <div className="relative flex items-center justify-between">
                <span className="rounded-md bg-white/10 px-2 py-1 text-[8px] font-medium tracking-wide text-slate-200">LESSON 04 · DEMO VIDEO</span>
                <Volume2 className="h-3.5 w-3.5 text-slate-300" />
              </div>
              <div className="relative mx-auto max-w-[270px] text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/20 bg-white/10 text-violet-200 shadow-lg shadow-indigo-950/20">
                  <Sparkles className="h-6 w-6" />
                </span>
                <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-indigo-200">The learning process</p>
                <p className="mt-1 text-xs font-medium leading-relaxed text-white/90">A neural network learns by adjusting its connections.</p>
              </div>
              <div className="relative">
                <div className="mb-2 flex items-center justify-between text-[8px] tabular-nums text-slate-300">
                  <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-violet-300 transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((playing) => !playing)}
                    aria-label={isPlaying ? 'Pause demo video' : 'Play demo video'}
                    className="grid h-7 w-7 place-items-center rounded-full bg-white text-indigo-700 transition hover:scale-105"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                  </button>
                  <span className="text-[8px] text-slate-300">{isPlaying ? 'Demo playing' : 'Demo paused'}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700"><FileText className="h-3.5 w-3.5 text-indigo-600" /> Lesson transcript</div>
                <span className="text-[8px] font-medium text-slate-400">SYNCED</span>
              </div>
              <p className="text-[9px] leading-4 text-slate-600">
                “During training, the network compares its prediction with the expected result, then adjusts its weights to reduce the error.”
              </p>
              <button type="button" onClick={jumpToSource} className="mt-2 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[8px] font-semibold text-indigo-700 transition hover:bg-indigo-100">
                <Play className="h-2.5 w-2.5 fill-current" /> Jump to {formatTime(4 * 60 + 12)}
              </button>
            </div>
          </div>

          <div className="flex min-h-[350px] flex-col p-3 sm:p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-violet-700"><Sparkles className="h-3.5 w-3.5" /></span>
                <div>
                  <p className="text-[10px] font-semibold text-slate-800">AI Study Buddy</p>
                  <p className="mt-0.5 text-[8px] text-emerald-700">Grounded in this lesson</p>
                </div>
              </div>
              <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="flex-1 space-y-3 py-3">
              <div className="max-w-[95%] rounded-xl rounded-tl-sm bg-slate-100 p-2.5 text-[9px] leading-4 text-slate-700">
                What does a neural network change when it learns?
              </div>
              <div className="ml-auto max-w-[97%] rounded-xl rounded-tr-sm bg-indigo-50 p-2.5 text-[9px] leading-4 text-slate-700">
                It adjusts the strength of its connections, called <strong className="font-semibold text-indigo-800">weights</strong>, to make more accurate predictions.
                <button type="button" onClick={jumpToSource} className="mt-2 flex w-full items-center gap-1.5 rounded-lg border border-indigo-100 bg-white px-2 py-1.5 text-left text-[8px] font-medium text-indigo-700 transition hover:border-indigo-300">
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded bg-indigo-50"><Play className="h-2 w-2 fill-current" /></span>
                  <span className="truncate">Lesson video · {formatTime(4 * 60 + 12)}</span>
                  <Check className="ml-auto h-3 w-3 shrink-0 text-emerald-600" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="flex-1 text-[9px] text-slate-400">Ask a question about this lesson…</span>
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-indigo-600 text-white"><Send className="h-3 w-3" /></span>
              </div>
            </div>
            <p className="mt-2 text-center text-[8px] text-slate-400">Sample conversation · AI answers cite lesson sources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
