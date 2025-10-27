import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Safeturned',
    description: 'Scan plugins for a backdoor!',
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon.ico',
        apple: '/favicon.ico',
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body suppressHydrationWarning>{children}</body>
        </html>
    );
}
