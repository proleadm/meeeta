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
    return NextResponse.next();
  }

  const { pathname, search } = req.nextUrl;
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const authed = req.cookies.get(AUTH_COOKIE)?.value === '1';
  if (authed) {
    return NextResponse.next();
  }

  const next = `${pathname}${search}`;
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = UNLOCK_PATH;
  redirectUrl.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: '/:path*',
};
