'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function AuthMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="h-9 w-24 animate-pulse rounded-md bg-muted" aria-hidden="true" />
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: pathname || '/clocks' })}
        className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Sign in
      </button>
    );
  }

  const label = session.user.name || session.user.email || 'Account';

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-muted-foreground md:inline">{label}</span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/clocks' })}
        className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
