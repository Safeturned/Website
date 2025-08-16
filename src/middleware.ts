import { NextRequest, NextResponse } from 'next/server';

const locales = ['ru', 'en'];
const defaultLocale = 'ru';

export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        const response = NextResponse.redirect(
            new URL(`/${locale}${pathname}`, request.url)
        );
        
        // Add cache-busting headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    }

    // For existing requests, add cache-busting headers
    const response = NextResponse.next();
    
    // Add cache-busting headers for translation files
    if (pathname.includes('/locales/') || pathname.includes('.json')) {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    // Add cache-busting for main pages
    if (pathname === '/' || 
        pathname.startsWith('/en') || 
        pathname.startsWith('/ru')) {
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

function getLocale(request: NextRequest): string {
    // Check for locale in cookie
    const localeCookie = request.cookies.get('NEXT_LOCALE');
    if (localeCookie && locales.includes(localeCookie.value)) {
        return localeCookie.value;
    }

    // Check for locale in Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
        const preferredLocale = acceptLanguage
            .split(',')
            .map(lang => lang.split(';')[0].trim())
            .find(lang => locales.includes(lang.split('-')[0]));
        
        if (preferredLocale) {
            return preferredLocale.split('-')[0];
        }
    }

    return defaultLocale;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - favicon.jpg (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|favicon.jpg).*)',
    ],
}; 