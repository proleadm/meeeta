import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignInButton from '@/components/auth/SignInButton';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">MeetEta</p>
        <h1 className="text-4xl font-bold text-foreground md:text-5xl">Coordinate fair meeting times across time zones</h1>
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          Compare cities, convert time quickly, and find overlap windows that work for your team.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clocks"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Open app
          </Link>
          {session?.user ? (
            <Link
              href="/planner"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Go to Planner
            </Link>
          ) : (
            <SignInButton callbackUrl="/planner" />
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {session?.user ? (
            <p>Signed in as {session.user.email || session.user.name}.</p>
          ) : (
            <p>Planner requires sign-in. Clocks, Convert, and Overlap remain public.</p>
          )}
        </div>
      </div>
    </div>
  );
}
