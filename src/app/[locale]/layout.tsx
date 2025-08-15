import { ReactNode } from 'react';

interface LocaleLayoutProps {
    children: ReactNode;
    params: {
        locale: string;
    };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
    return (
        <html lang={params.locale}>
            <body>{children}</body>
        </html>
    );
}

export async function generateStaticParams() {
    return [{ locale: 'ru' }, { locale: 'en' }];
}
