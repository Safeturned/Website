import type { Metadata } from 'next';
import { use } from 'react';
import { cookies, headers } from 'next/headers';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import {
    DEFAULT_LOCALE,
    Locale,
    normalizeLocale,
    pickLocaleFromAcceptLanguage,
} from '@/lib/i18n-config';

export const metadata: Metadata = {
    title: 'Safeturned',
    description: 'Scan plugins for a backdoor!',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
};

const resolveInitialLocale = (): Locale => {
    const cookieLocale = normalizeLocale(use(cookies()).get('NEXT_LOCALE')?.value);
    if (cookieLocale) return cookieLocale;

    const headerLocale = pickLocaleFromAcceptLanguage(use(headers()).get('accept-language'));
    return headerLocale ?? DEFAULT_LOCALE;
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const initialLocale = resolveInitialLocale();

    return (
        <html lang={initialLocale} suppressHydrationWarning>
            <body suppressHydrationWarning>
                <LanguageProvider initialLocale={initialLocale}>
                    <AuthProvider>{children}</AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
