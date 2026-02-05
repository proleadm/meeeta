import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'meeteta_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSafeNext(next: string | null) {
  if (!next) return '/';
  if (!next.startsWith('/')) return '/';
  return next;
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const password = String(form.get('password') || '');
  const next = getSafeNext(String(form.get('next') || ''));

  const expected = process.env.MEETETA_PASSWORD;
  if (!expected) {
    return NextResponse.redirect(new URL(next, req.url));
  }

  if (password !== expected) {
    const errorUrl = new URL('/unlock', req.url);
    errorUrl.searchParams.set('error', '1');
    errorUrl.searchParams.set('next', next);
    return NextResponse.redirect(errorUrl);
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.set({
    name: AUTH_COOKIE,
    value: '1',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
