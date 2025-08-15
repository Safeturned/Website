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
        return NextResponse.redirect(
            new URL(`/${locale}${pathname}`, request.url)
        );
    }
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
        // Skip all internal paths (_next)
        '/((?!_next|api|favicon.ico).*)',
    ],
}; 