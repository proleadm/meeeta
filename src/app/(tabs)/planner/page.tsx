import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignInButton from '@/components/auth/SignInButton';

export default async function PlannerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-background via-background to-muted/10 px-6 py-16">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-card/70 px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground">Planner requires sign-in</h1>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Sign in with Google to unlock planning features. We keep Clocks, Convert, and Overlap available without login.
          </p>
          <SignInButton callbackUrl="/planner" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-background via-background to-muted/10 px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Planner</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Signed in as {session.user.email || session.user.name}. Calendar integrations will be added in a future phase.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Planner scaffold</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Auth is active and user records persist in Prisma. This placeholder is reserved for schedule proposals and calendar connection flows.
          </p>
        </div>
      </div>
    </div>
  );
}
