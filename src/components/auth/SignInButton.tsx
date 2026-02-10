'use client';

import { signIn } from 'next-auth/react';

interface SignInButtonProps {
  callbackUrl: string;
  className?: string;
}

export default function SignInButton({ callbackUrl, className }: SignInButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl })}
      className={
        className ||
        'inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
      }
    >
      Sign in with Google
    </button>
  );
}
