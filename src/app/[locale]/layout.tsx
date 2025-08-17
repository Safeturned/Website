import { ReactNode } from 'react';

interface LocaleLayoutProps {
    children: ReactNode;
    params: Promise<{
        locale: string;
    }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;
    
    return (
        <html lang={locale}>
            <body>{children}</body>
        </html>
    );
}

export async function generateStaticParams() {
    return [{ locale: 'ru' }, { locale: 'en' }];
}
