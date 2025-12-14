import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { LanguageProvider } from '@/lib/language-context';
import { DEFAULT_LOCALE } from '@/lib/i18n-config';

export const metadata: Metadata = {
    title: 'Safeturned',
    description: 'Scan plugins for a backdoor!',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const initialLocale = DEFAULT_LOCALE;

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
