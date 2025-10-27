'use client';

import { useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

export function useTranslation() {
    const pathname = usePathname();
    const router = useRouter();

    const supportedLocales = ['ru', 'en'] as const;

    const locale = useMemo(() => {
        if (!pathname) return 'en';

        const cleanPathname = pathname.replace(/\/undefined/g, '');
        const segments = cleanPathname.split('/').filter(Boolean);
        const firstSegment = segments[0] || '';

        const detectedLocale = supportedLocales.includes(firstSegment as 'ru' | 'en')
            ? (firstSegment as 'ru' | 'en')
            : 'en';

        return detectedLocale || 'en';
    }, [pathname]);

    const messages =
        locale === 'ru' ? (ru as Record<string, unknown>) : (en as Record<string, unknown>);

    const getByPath = (obj: Record<string, unknown>, path: string) => {
        return path
            .split('.')
            .reduce<unknown>(
                (acc, key) =>
                    acc && typeof acc === 'object' && acc !== null && key in acc
                        ? (acc as Record<string, unknown>)[key]
                        : undefined,
                obj
            );
    };

    const t = useCallback(
        (key: string, fallback?: string, variables?: Record<string, unknown>) => {
            const value = getByPath(messages, key);
            let result = typeof value === 'string' ? value : fallback || key;

            if (variables) {
                Object.entries(variables).forEach(([varKey, varValue]) => {
                    result = result.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
                });
            }

            return result;
        },
        [messages]
    );

    const changeLanguage = useCallback(
        (newLocale: 'ru' | 'en') => {
            if (newLocale === locale) return;

            document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

            const segments = (pathname || '/').split('/');
            if (segments.length > 1 && supportedLocales.includes(segments[1] as 'ru' | 'en')) {
                segments[1] = newLocale;
            } else {
                segments.splice(1, 0, newLocale);
            }
            const newPath = segments.join('/') || `/${newLocale}`;
            router.push(newPath);
        },
        [locale, pathname, router]
    );

    return {
        t,
        locale,
        changeLanguage,
        isRTL: false,
    };
}
