// import { getToken } from 'next-auth/jwt';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// const publicRoutes = [
//   '/auth/login',
//   '/auth/signup',
//   '/auth/reset',
//   '/auth/forgot'
// ];

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   if (publicRoutes.some(route => pathname.startsWith(route))) {
    
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//     if (token) return NextResponse.redirect(new URL('/', req.url));
//     return NextResponse.next();
//   }

//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//   if (!token) {
//     return NextResponse.redirect(new URL('/auth/login', req.url));
//   }
//   const role = token.role; 
//   if (pathname.startsWith('/orders-detail')) {
//     return NextResponse.next();
//   }

//   if (pathname.startsWith('/admin')) {
//     if (role !== 'ADMIN') {
//       return NextResponse.redirect(new URL('/', req.url));
//     }
//   }

//   if (pathname.startsWith('/orders') || pathname.startsWith('/shopping-bag')) {
 
//     if (role !== 'USER') {
//       return NextResponse.redirect(new URL('/', req.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/orders/:path*',
//     '/shopping-bag/:path*',
//     '/orders-detail/:path*',
//     '/admin/:path*',
//     '/admin-dashboard/:path*'
//   ]
// };

import { NextResponse, NextRequest } from 'next/server';
import { ObjectSchema } from 'joi';
import { getToken } from 'next-auth/jwt';
import { schemas } from '@/validations/index';

interface RouteSchema<TBody = unknown, TQuery = unknown, TParams = unknown> {
  path: string;
  method: string;
  body?: ObjectSchema<TBody>;
  query?: ObjectSchema<TQuery>;
  params?: ObjectSchema<TParams>;
}

function extractParamsFromPath(pathname: string, schemaPath: string) {
  const actualParts = pathname.split('/').filter(Boolean);
  const schemaParts = schemaPath.split('/').filter(Boolean);

  const params: Record<string, string> = {};

  schemaParts.forEach((part, i) => {
    const match = part.match(/\[(.*?)\]/);
    if (match) {
      const paramName = match[1];
      params[paramName] = actualParts[i];
    }
  });

  return params;
}

const publicRoutes = ['/auth/login', '/auth/signup', '/auth/reset', '/auth/forgot'];

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const method = req.method.toUpperCase();

  console.log('✅ Middleware triggered for:', pathname);

  const isApiRoute = pathname.startsWith('/api');
  if (isApiRoute) {
    const matchedSchema = schemas.find(
      (schema) =>
        pathname.match(new RegExp(schema.path.replace(/\[.*?\]/g, '[^/]+'))) &&
        schema.method === method
    ) as RouteSchema | undefined;
    const skipValidationRoutes = ['/api/products/upload-image',  '/api/stripe-webhook','/api/stripe/verify'];
  if (skipValidationRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

    if (matchedSchema) {
      try {
        if (matchedSchema.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
          let body: Record<string, unknown> = {};
          try {
            const parsedBody = await req.json();
            if (typeof parsedBody === 'object' && parsedBody !== null) {
              body = parsedBody as Record<string, unknown>;
            } else {
              return NextResponse.json({ error: ['Invalid JSON body'] }, { status: 400 });
            }
          } catch {
            return NextResponse.json({ error: ['Invalid JSON body'] }, { status: 400 });
          }

          const { error } = matchedSchema.body.validate(body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
          });

          if (error) {
            return NextResponse.json(
              { error: error.details.map((d) => d.message) },
              { status: 400 }
            );
          }
        }

        if (matchedSchema.query && method === 'GET') {
          const queryObject: Record<string, string> = Object.fromEntries(searchParams.entries());
          const { error } = matchedSchema.query.validate(queryObject, {
            abortEarly: false,
            allowUnknown: false
          });

          if (error) {
            return NextResponse.json(
              { error: error.details.map((d) => d.message) },
              { status: 400 }
            );
          }
        }
        if (matchedSchema.params) {
          const params = extractParamsFromPath(pathname, matchedSchema.path);
          const { error } = matchedSchema.params.validate(params, {
            abortEarly: false,
            allowUnknown: false
          });

          if (error) {
            return NextResponse.json(
              { error: error.details.map((d) => d.message) },
              { status: 400 }
            );
          }
        }
      } catch (err) {
        console.error('Validation error:', err);
        return NextResponse.json(
          { error: ['Something went wrong during validation'] },
          { status: 400 }
        );
      }
    }

    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (token) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  const role = token.role as string | undefined;

  if (pathname.startsWith('/orders-detail')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (
    (pathname.startsWith('/orders') || pathname.startsWith('/shopping-bag')) &&
    role !== 'USER'
  ) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/orders/:path*',
    '/shopping-bag/:path*',
    '/orders-detail/:path*',
    '/admin/:path*',
    '/admin-dashboard/:path*'
  ]
};
