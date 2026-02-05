import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'meeteta_auth';
const UNLOCK_PATH = '/unlock';

function isPublicPath(pathname: string) {
  if (pathname === UNLOCK_PATH) return true;
  if (pathname.startsWith('/api/')) return true;
  if (pathname.startsWith('/_next/')) return true;
  if (pathname === '/favicon.ico') return true;
  if (pathname === '/robots.txt') return true;
  if (pathname === '/sitemap.xml') return true;
  return /\.(png|jpe?g|gif|svg|ico|webp|css|js|map|txt)$/i.test(pathname);
}

export function middleware(req: NextRequest) {
  const password = process.env.MEETETA_PASSWORD;
  if (!password) {
    const res = NextResponse.next();
    res.headers.set('x-meeteta-mw', '1');
    return res;
  }

  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) {
    const res = NextResponse.next();
    res.headers.set('x-meeteta-mw', '1');
    return res;
  }

  const authed = req.cookies.get(AUTH_COOKIE)?.value === '1';
  if (authed) {
    const res = NextResponse.next();
    res.headers.set('x-meeteta-mw', '1');
    return res;
  }

  const next = `${pathname}${search}`;
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = UNLOCK_PATH;
  redirectUrl.search = `?next=${encodeURIComponent(next)}`;
  const res = NextResponse.redirect(redirectUrl);
  res.headers.set('x-meeteta-mw', '1');
  return res;
}

export const config = {
  matcher: '/:path*',
};
