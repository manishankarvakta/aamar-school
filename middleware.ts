import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

const protectedPaths = ['/api'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (protectedPaths.some(p => path.startsWith(p)) && path !== '/api/auth/login') {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = await verifyToken(token);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set('X-User-Id', decoded.userId);
      requestHeaders.set('X-User-Role', decoded.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
