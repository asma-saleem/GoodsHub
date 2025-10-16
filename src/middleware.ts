import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
  const role = token.role; 
  if (pathname.startsWith('/orders-detail')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/orders') || pathname.startsWith('/shopping-bag')) {
 
    if (role !== 'USER') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/shopping-bag/:path*',
    '/orders-detail/:path*',
    '/admin/:path*',
    '/admin-dashboard/:path*'
  ]
};
