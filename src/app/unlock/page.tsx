'use client';

import { useState } from 'react';

interface UnlockPageProps {
  searchParams?: {
    next?: string;
    error?: string;
  };
}

export default function UnlockPage({ searchParams }: UnlockPageProps) {
  const nextPath = searchParams?.next || '/';
  const initialError = searchParams?.error === '1';
  const [error, setError] = useState(initialError ? 'Incorrect password. Please try again.' : '');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') || '');

    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, next: nextPath }),
        redirect: 'manual',
      });

      if (res.status === 401) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Incorrect password. Please try again.');
        setLoading(false);
        return;
      }

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('Location') || nextPath;
        window.location.assign(location);
        return;
      }

      if (res.ok) {
        window.location.assign(nextPath);
        return;
      }

      setError('Something went wrong. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 shadow-lg shadow-black/5 backdrop-blur-sm p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enter password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This site is protected. Please enter the access password.
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/30 border border-red-200/60 dark:border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-10 w-full px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
