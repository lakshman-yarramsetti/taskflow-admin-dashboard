import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../auth/useAuth';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message ?? 'Login failed'
          : 'Login failed';
      setError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-zinc-950 text-white lg:grid-cols-[1fr_460px]">
      <section className="hidden items-end border-r border-white/10 bg-[linear-gradient(135deg,#18181b_0%,#27272a_45%,#0f766e_100%)] p-10 lg:flex">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded bg-white text-zinc-950">
            <ShieldCheck size={26} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight">TaskFlow RBAC Dashboard</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-zinc-200">
            Manage users, roles, task assignment, and delivery status through a clean admin interface connected to the NestJS API.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded bg-white text-zinc-950">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-3xl font-semibold">TaskFlow</h1>
            <p className="mt-2 text-zinc-300">RBAC Admin Dashboard</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-200">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="mt-2 h-11 w-full rounded border border-white/10 bg-white px-3 text-zinc-950 outline-none ring-teal-400 transition focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-zinc-200">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="mt-2 h-11 w-full rounded border border-white/10 bg-white px-3 text-zinc-950 outline-none ring-teal-400 transition focus:ring-2"
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded border border-red-400/40 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-teal-500 font-semibold text-zinc-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={18} />
          </button>

          <p className="mt-5 text-sm leading-6 text-zinc-400">
            Use any registered TaskFlow API user. Admin users can manage roles; managers can assign tasks; employees see their assigned work.
          </p>
        </form>
      </section>
    </main>
  );
}

