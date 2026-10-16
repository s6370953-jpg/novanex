import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LockKeyhole } from 'lucide-react';
import Brand from './Brand';
import { getApiErrorMessage, login } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);
      setAuth(response.user);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8fc] px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-5 flex items-center justify-between">
          <Brand />
          <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 transition hover:text-indigo-700"><ArrowLeft className="h-3.5 w-3.5" /> Home</Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(30,27,75,0.25)] sm:p-8">
          <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><LockKeyhole className="h-5 w-5" /></span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">Sign in to continue your Learnova Tutor journey.</p>

        {error && (
          <div role="alert" className="mb-5 mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-indigo-600 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          New to Learnova?{' '}
          <Link to="/register" className="font-semibold text-indigo-700 hover:text-indigo-900">
            Sign up
          </Link>
        </p>
        </div>
      </div>
    </main>
  );
}
