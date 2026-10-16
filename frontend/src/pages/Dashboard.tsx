import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleHelp,
  FileStack,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react';
import Brand from '../components/Brand';
import { demoLesson } from '../features/learning/lesson';
import { getApiErrorMessage, logout } from '../services/api';
import { useAuthStore } from '../store/authStore';

const navigation = [
  { href: '#overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '#continue-learning', label: 'My learning', icon: <BookOpen className="h-4 w-4" /> },
  { href: '#resources', label: 'Resources', icon: <FileStack className="h-4 w-4" /> },
  { href: '#quizzes', label: 'Practice & quizzes', icon: <BookOpenCheck className="h-4 w-4" /> },
];

export default function Dashboard() {
  const { user, logout: clearAuth } = useAuthStore();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOut(true);
    try {
      await logout();
      clearAuth();
    } catch (error: unknown) {
      setLogoutError(getApiErrorMessage(error, 'Could not sign out. Please try again.'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[236px] flex-col border-r border-slate-200/80 bg-white px-4 py-6 lg:flex">
        <Brand />
        <p className="mb-3 mt-10 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <Navigation />
        <div className="mt-auto rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-indigo-700"><Sparkles className="h-4 w-4" /></span>
          <p className="mt-3 text-xs font-semibold text-slate-800">Learn at your pace</p>
          <p className="mt-1.5 text-[10px] leading-4 text-slate-600">Your courses and learning activity will appear here as you get started.</p>
          <Link to="/#features" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900">
            Explore Learnova <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <ProfileFooter name={user?.full_name || 'Learner'} email={user?.email || ''} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      </aside>

      <main id="overview" className="min-h-screen lg:ml-[236px]">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex h-[62px] items-center justify-between px-5 sm:px-8">
            <p className="text-[11px] text-slate-500">My workspace <span className="mx-2 text-slate-300">/</span><span className="font-semibold text-slate-700">Overview</span></p>
            <div className="flex items-center gap-3">
              <span className="hidden text-[10px] text-slate-500 sm:inline">Signed in as {user?.full_name}</span>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-800">{user?.full_name?.slice(0, 1).toUpperCase() || 'L'}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 px-4 py-2 lg:hidden">
            <Navigation compact />
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
          {logoutError && <p role="alert" className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{logoutError}</p>}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-700"><Sparkles className="h-3 w-3" /> Your learning space</p>
              <h1 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#172033] sm:text-3xl">Welcome back, {user?.full_name?.split(' ')[0] || 'learner'}.</h1>
              <p className="mt-2 text-xs text-slate-600 sm:text-sm">Your progress starts with one lesson. Pick up where you left off or explore something new.</p>
            </div>
            <Link to="/#features" className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-[11px] font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700">
              Explore learning features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Learning activity summary">
            <ActivitySummary icon={<BarChart3 className="h-4 w-4" />} label="Learning progress" />
            <ActivitySummary icon={<BookOpen className="h-4 w-4" />} label="Recent lessons" />
            <ActivitySummary icon={<BookOpenCheck className="h-4 w-4" />} label="Quiz results" />
          </section>

          <div className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="grid content-start gap-5">
              <section id="continue-learning" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionTitle icon={<Play className="h-4 w-4" />} title="Continue learning" />
                <EmptyState
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="Your next lesson starts here"
                  description="There are no courses assigned to your account yet. Explore the learning experience and come back when your course content is ready."
                  action={<div className="flex flex-wrap gap-2">
                    <Link to={`/learn/${demoLesson.id}`} state={{ lesson: demoLesson }} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-[10px] font-semibold text-white transition hover:bg-indigo-700">Open demo workspace <ArrowRight className="h-3 w-3" /></Link>
                    <Link to="/#features" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[10px] font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-700">Explore features</Link>
                  </div>}
                />
              </section>

              <section id="resources" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <SectionTitle icon={<FileStack className="h-4 w-4" />} title="Learning resources" />
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold uppercase tracking-wide text-slate-500">Not connected</span>
                </div>
                <EmptyState
                  icon={<FileStack className="h-5 w-5" />}
                  title="Your resources will live here"
                  description="PDFs, presentations, and lesson materials will appear here when resource management is available."
                  action={<span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500"><Plus className="h-3.5 w-3.5" /> Resource uploads are not available yet</span>}
                />
              </section>

              <section id="recent-lessons" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <SectionTitle icon={<BookOpen className="h-4 w-4" />} title="Recent lessons" />
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-slate-400 shadow-sm"><BookOpen className="h-4 w-4" /></span>
                  <p className="text-[11px] leading-5 text-slate-500">No lessons to show yet. Your recently viewed lessons will appear here.</p>
                </div>
              </section>
            </div>

            <aside className="grid content-start gap-5">
              <section id="ai-tutor" className="scroll-mt-28 overflow-hidden rounded-2xl bg-[#24203e] p-5 text-white">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/10 text-violet-200"><MessageSquareText className="h-4 w-4" /></span>
                <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-violet-200">Study support</p>
                <h2 className="mt-1.5 text-base font-semibold">AI Tutor</h2>
                <p className="mt-2 text-[10px] leading-5 text-slate-300">Lesson-grounded AI help is not connected to this account yet. Preview how it works on the Learnova home page.</p>
                <Link to="/#features" className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-white/15">
                  See AI tutor features <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </section>

              <section id="quizzes" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle icon={<BookOpenCheck className="h-4 w-4" />} title="Practice & quizzes" />
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm"><CircleHelp className="h-4 w-4" /></span>
                  <p className="mt-3 text-xs font-semibold text-slate-800">No quiz results yet</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">Quiz summaries will appear here after you complete practice sessions.</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px]">
                  <span className="text-slate-500">Latest score</span><span className="font-medium text-slate-400">No attempts</span>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <SectionTitle icon={<Check className="h-4 w-4" />} title="A note on your dashboard" />
                <p className="mt-3 text-[10px] leading-5 text-slate-600">This view shows live account details. Course progress, study time, and quiz scores stay empty until the learning data features are available.</p>
              </section>
            </aside>
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-slate-200 pt-4 lg:hidden">
            <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
            <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50">
              <LogOut className="h-3.5 w-3.5" /> {isLoggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Navigation({ compact = false }: { compact?: boolean }) {
  return (
    <nav aria-label="Dashboard navigation" className={compact ? 'flex gap-1 overflow-x-auto' : 'grid gap-1'}>
      {navigation.map((item, index) => (
        <a
          key={item.href}
          href={item.href}
          className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11px] font-medium transition ${index === 0 && !compact ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-700'}`}
        >
          {item.icon}{item.label}
        </a>
      ))}
    </nav>
  );
}

function ProfileFooter({ name, email, onLogout, isLoggingOut }: { name: string; email: string; onLogout: () => void; isLoggingOut: boolean }) {
  return (
    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-800">{name.slice(0, 1).toUpperCase()}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-slate-800">{name}</p>
        <p className="truncate text-[9px] text-slate-500">{email}</p>
      </div>
      <button type="button" onClick={onLogout} disabled={isLoggingOut} aria-label={isLoggingOut ? 'Signing out' : 'Sign out'} title="Sign out" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

function ActivitySummary({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-600">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700">{icon}</span>
        <span className="text-[10px] font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold tracking-tight text-slate-400">—</p>
      <p className="mt-0.5 text-[9px] text-slate-500">No activity recorded yet</p>
    </article>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-700">{icon}</span>
      <h2 className="text-xs font-semibold text-slate-800">{title}</h2>
    </div>
  );
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="mt-4 flex flex-col items-start gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">{icon}</span>
      <div className="min-w-0 flex-1">
        <h3 className="text-xs font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
