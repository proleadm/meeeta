import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'meeteta_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSafeNext(next: string | null) {
  if (!next) return '/';
  if (!next.startsWith('/') || next.startsWith('//')) return '/';
  return next;
}

async function readBody(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }
  try {
    const form = await req.formData();
    return Object.fromEntries(form.entries());
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const body = await readBody(req);
  const password = String(body.password || '');
  const next = getSafeNext(String(body.next || ''));

  const expected = process.env.MEETETA_PASSWORD;
  if (!expected) {
    return NextResponse.redirect(new URL(next, req.url), 303);
  }

  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL(next, req.url), 303);
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
