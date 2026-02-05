interface UnlockPageProps {
  searchParams?: {
    next?: string;
    error?: string;
  };
}

export default function UnlockPage({ searchParams }: UnlockPageProps) {
  const nextPath = searchParams?.next || '/';
  const hasError = searchParams?.error === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/10 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/80 shadow-lg shadow-black/5 backdrop-blur-sm p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enter password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This site is protected. Please enter the access password.
          </p>
        </div>

        {hasError && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/30 border border-red-200/60 dark:border-red-800/40 rounded-lg px-3 py-2">
            Incorrect password. Please try again.
          </div>
        )}

        <form className="space-y-3" method="POST" action="/api/unlock">
          <input type="hidden" name="next" value={nextPath} />
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
            className="w-full h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
