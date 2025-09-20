// /middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/reset',
  '/auth/forgot'
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some(route => pathname.startsWith(route))) {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) return NextResponse.redirect(new URL('/', req.url));

    return NextResponse.next();
  }
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/shopping-bag/:path*',
    '/orders-detail/:path*'
  ]
};
