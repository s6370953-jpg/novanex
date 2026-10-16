import { useMemo, useReducer, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  CircleHelp,
  FileVideo,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import AITutorPanel from '../components/learning/AITutorPanel';
import TranscriptPanel from '../components/learning/TranscriptPanel';
import VideoPlayer from '../components/learning/VideoPlayer';
import Brand from '../components/Brand';
import { demoLesson, validateLesson, validateVideoUrl, type Lesson, type TranscriptSegment } from '../features/learning/lesson';
import { getActiveTranscriptIndex, initialPlaybackState, playbackReducer } from '../features/learning/playback';

interface LessonLocationState {
  lesson?: unknown;
}

export default function LearningWorkspacePage() {
  const { lessonId } = useParams();
  return <LearningWorkspace key={lessonId} lessonId={lessonId} />;
}

function LearningWorkspace({ lessonId }: { lessonId: string | undefined }) {
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playback, dispatch] = useReducer(playbackReducer, initialPlaybackState);
  const [additionalSegments, setAdditionalSegments] = useState<TranscriptSegment[]>([]);
  const suppliedLesson = (location.state as LessonLocationState | null)?.lesson;

  const lesson: Lesson | null = suppliedLesson
    ? isLesson(suppliedLesson) && suppliedLesson.id === lessonId
      ? suppliedLesson
      : null
    : lessonId === demoLesson.id
      ? demoLesson
      : null;
  const isDemoLesson = lesson?.id === demoLesson.id;
  const lessonError = lesson ? validateLesson(lesson) : 'This lesson could not be found. Open a lesson from the learning dashboard.';
  const sourceError = lesson ? validateVideoUrl(lesson.videoUrl) : null;
  const transcript = useMemo(
    () => [...(lesson?.transcript ?? []), ...additionalSegments].sort((a, b) => a.startTime - b.startTime),
    [lesson?.transcript, additionalSegments],
  );
  const activeTranscriptIndex = getActiveTranscriptIndex(transcript, playback.currentTime);

  const seekTo = (seconds: number) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(seconds)) return;
    const boundedTime = playback.duration > 0 ? Math.min(Math.max(seconds, 0), playback.duration) : Math.max(seconds, 0);
    video.currentTime = boundedTime;
    dispatch({ type: 'seek', currentTime: boundedTime });
  };

  const addTranscriptSegment = (segment: TranscriptSegment) => {
    setAdditionalSegments((current) => [...current, segment]);
  };

  if (!lesson || lessonError || sourceError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8fc] px-5 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700"><FileVideo className="h-5 w-5" /></span>
          <h1 className="mt-4 text-lg font-semibold text-slate-900">Lesson unavailable</h1>
          <p role="alert" className="mt-2 text-xs leading-5 text-slate-600">{lessonError || sourceError}</p>
          <Link to="/dashboard" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Brand />
            <span className="hidden h-6 w-px bg-slate-200 sm:block" />
            <Link to="/dashboard" className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-slate-500 transition hover:text-indigo-700 sm:text-xs">
              <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">My learning</span>
            </Link>
          </div>
          <div className={`flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-wide sm:text-[9px] ${isDemoLesson ? 'border border-amber-200 bg-amber-50 text-amber-800' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isDemoLesson ? 'bg-amber-500' : 'bg-emerald-500'}`} /> {isDemoLesson ? 'Demo lesson' : 'Lesson workspace'}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7">
        <div className="mb-4 flex items-center gap-2 text-[9px] text-slate-500 sm:text-[10px]">
          <Link to="/dashboard" className="transition hover:text-indigo-700">My learning</Link><ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-slate-700">{lesson.title}</span>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="grid min-w-0 content-start gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-indigo-700"><BookOpen className="h-3 w-3" /> Learning workspace</div>
                  <h1 className="text-lg font-bold tracking-tight text-[#172033] sm:text-xl">{lesson.title}</h1>
                  <p className="mt-1.5 max-w-3xl text-[10px] leading-5 text-slate-600 sm:text-xs">{lesson.description}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[8px] font-semibold text-emerald-800"><Sparkles className="h-3 w-3" /> Video + transcript</span>
              </div>
            </section>

            <VideoPlayer
              source={lesson.videoUrl}
              title={lesson.title}
              videoRef={videoRef}
              playback={playback}
              dispatch={dispatch}
            />

            <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-400">About this lesson</p>
                <p className="mt-1.5 text-[10px] leading-5 text-slate-600 sm:text-xs">{lesson.description}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[9px] text-slate-600">
                <span className={`h-1.5 w-1.5 rounded-full ${playback.error ? 'bg-rose-500' : playback.isPlaying ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {playback.error ? 'Playback error' : playback.isPlaying ? 'Lesson in progress' : 'Ready when you are'}
              </div>
            </section>

            <TranscriptPanel
              segments={transcript}
              activeIndex={activeTranscriptIndex}
              onSeek={seekTo}
              onAdd={addTranscriptSegment}
            />
          </div>

          <aside className="grid content-start gap-4">
            <AITutorPanel lessonId={lesson.id} currentTimestamp={playback.currentTime} />
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><PanelLeft className="h-3.5 w-3.5" /></span>
                <h2 className="text-[11px] font-semibold text-slate-800">Lesson navigation</h2>
              </div>
              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-indigo-700">Current lesson{isDemoLesson ? ' · demo' : ''}</p>
                <p className="mt-1.5 text-[10px] font-semibold text-slate-800">{lesson.title}</p>
                <p className="mt-1 text-[9px] text-slate-500">{transcript.length} transcript {transcript.length === 1 ? 'segment' : 'segments'}</p>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-4 text-slate-500"><CircleHelp className="mt-0.5 h-3 w-3 shrink-0" /> More course lessons will appear here when lesson data is connected.</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function isLesson(value: unknown): value is Lesson {
  return Boolean(value && typeof value === 'object' && 'id' in value && typeof value.id === 'string');
}
