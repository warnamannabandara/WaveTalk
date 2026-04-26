import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signup'];
const ADMIN_PREFIX = '/admin';
const USER_DEFAULT = '/dashboard/chat';
const ADMIN_DEFAULT = '/admin/overview';

function decodeJwtPayload(token: string): { role?: string } | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip Next.js internals and static assets
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const token = req.cookies.get('accessToken')?.value;
    const payload = token ? decodeJwtPayload(token) : null;
    const isAuthenticated = !!payload;
    const isAdmin = payload?.role === 'admin';

    const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r));

    // Logged-in users hitting auth pages → redirect to their home
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL(isAdmin ? ADMIN_DEFAULT : USER_DEFAULT, req.url));
    }

    // Unauthenticated users hitting protected pages → signin with callbackUrl
    if (!isAuthenticated && !isAuthRoute && pathname !== '/') {
        const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
        const signinUrl = new URL('/signin', req.url);
        signinUrl.searchParams.set('callbackUrl', callbackUrl);
        return NextResponse.redirect(signinUrl);
    }

    // Non-admin users hitting admin pages → their dashboard
    if (isAuthenticated && !isAdmin && pathname.startsWith(ADMIN_PREFIX)) {
        return NextResponse.redirect(new URL(USER_DEFAULT, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
