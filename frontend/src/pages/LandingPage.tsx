import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  FileStack,
  MessageSquareText,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import FeatureCard from '../components/FeatureCard';
import ProductPreview from '../components/ProductPreview';
import { healthCheck } from '../services/api';

type ApiStatus = 'loading' | 'connected' | 'error';

const features = [
  {
    icon: <MessageSquareText className="h-5 w-5" />,
    title: 'Timestamp-aware AI tutor',
    description: 'Ask questions as you learn and follow answers back to the exact lesson moment that explains the idea.',
  },
  {
    icon: <Video className="h-5 w-5" />,
    title: 'Focused video learning',
    description: 'Learn with lessons designed to pair clear explanations with a transcript you can revisit.',
  },
  {
    icon: <FileStack className="h-5 w-5" />,
    title: 'PDF & presentation resources',
    description: 'Keep supporting documents alongside lessons, with answers linked to a page or slide.',
  },
  {
    icon: <BookOpenCheck className="h-5 w-5" />,
    title: 'Knowledge-building quizzes',
    description: 'Check what has stuck with short practice sessions that help reinforce lesson concepts.',
  },
  {
    icon: <RotateCcw className="h-5 w-5" />,
    title: 'Purposeful revision',
    description: 'Return to important moments, revisit key ideas, and make review part of your routine.',
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: 'Learning analytics',
    description: 'Get a clearer picture of your study habits and learning progress over time.',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: 'AI mock interviews',
    description: 'Build confidence by practicing how you explain the knowledge you are learning.',
  },
];

const steps = [
  {
    number: '01',
    icon: <Play className="h-5 w-5" />,
    title: 'Choose a lesson',
    description: 'Pick up a video lesson and its learning resources in one organized space.',
  },
  {
    number: '02',
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Learn with AI',
    description: 'Explore tricky ideas with explanations grounded in your learning materials.',
  },
  {
    number: '03',
    icon: <Target className="h-5 w-5" />,
    title: 'Practise and improve',
    description: 'Strengthen your understanding with quizzes, revision, and reflection.',
  },
];

export default function LandingPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');

  useEffect(() => {
    let active = true;
    healthCheck()
      .then(() => {
        if (active) setApiStatus('connected');
      })
      .catch(() => {
        if (active) setApiStatus('error');
      });
    return () => {
      active = false;
    };
  }, []);

  const statusLabel = apiStatus === 'connected'
    ? 'API connected'
    : apiStatus === 'error'
      ? 'API unavailable'
      : 'Connecting to API';

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f8fc]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <nav aria-label="Main navigation" className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Brand />
          <div className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-xs font-medium text-slate-600 transition hover:text-indigo-700">Features</a>
            <a href="#how-it-works" className="text-xs font-medium text-slate-600 transition hover:text-indigo-700">How it works</a>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden items-center gap-1.5 text-[10px] text-slate-500 xl:inline-flex" role="status" aria-live="polite">
              <span className={`h-1.5 w-1.5 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500' : apiStatus === 'error' ? 'bg-rose-500' : 'animate-pulse bg-amber-500'}`} />
              {statusLabel}
            </span>
            <Link to="/login" className="text-xs font-semibold text-slate-600 transition hover:text-indigo-700">Sign in</Link>
            <Link to="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 sm:px-4">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:pb-24 lg:pt-24">
          <div className="pointer-events-none absolute -left-48 top-20 -z-0 h-[440px] w-[440px] rounded-full bg-violet-200/35 blur-3xl" />
          <div className="relative z-10 max-w-[520px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> A more thoughtful way to learn
            </div>
            <h1 className="mt-6 text-[42px] font-bold leading-[1.06] tracking-[-0.055em] text-[#172033] sm:text-5xl lg:text-[60px]">
              Learn at your pace. <span className="text-indigo-600">Understand for real.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Your lessons, learning resources, and study support—together in a calmer space built to help understanding stick.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-200/70 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700">
                Explore features <ArrowDown className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Learn at your own pace</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Keep progress in view</span>
            </div>
          </div>
          <div className="relative z-10 lg:-mr-8">
            <ProductPreview />
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-y border-slate-200/80 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="A learning toolkit that works together"
              title="Everything you need to keep moving"
              description="From first watch to confident recall, Learnova Tutor is designed around the way understanding grows."
            />
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="Simple by design"
              title="A better rhythm for learning"
              description="A clear path from curiosity to confidence—without losing sight of what matters."
            />
            <div className="relative mt-10 grid gap-4 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-8 hidden border-t border-dashed border-indigo-200 md:block" />
              {steps.map((step) => (
                <article key={step.number} className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="relative z-10 grid h-11 w-11 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">{step.icon}</span>
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-300">{step.number}</span>
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[24px] bg-[#211d3a] px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -right-24 -top-36 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 text-indigo-200"><Sparkles className="h-5 w-5" /></span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">Make your next study session count.</h2>
              <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">Build a learning routine that fits your life. Start with a lesson and take it one idea at a time.</p>
              <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-indigo-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50">
                Start learning <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <Brand />
            <p className="mt-2 text-[10px] text-slate-500">Learn at your pace. Understand for real.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-medium text-slate-600">
            <a href="#features" className="transition hover:text-indigo-700">Features</a>
            <a href="#how-it-works" className="transition hover:text-indigo-700">How it works</a>
            <Link to="/login" className="transition hover:text-indigo-700">Sign in</Link>
            <Link to="/register" className="transition hover:text-indigo-700">Get started</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em] text-[#172033] sm:text-3xl">{title}</h2>
      <p className="mt-3 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{description}</p>
    </div>
  );
}
