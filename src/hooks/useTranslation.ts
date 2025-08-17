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
        
        // Clean the pathname to remove any undefined segments
        const cleanPathname = pathname.replace(/\/undefined/g, '');
        const segments = cleanPathname.split('/').filter(Boolean);
        const firstSegment = segments[0] || '';
        
        const detectedLocale = supportedLocales.includes(firstSegment as any) ? (firstSegment as 'ru' | 'en') : 'en';
        
        // Ensure we always return a valid locale
        return detectedLocale || 'en';
    }, [pathname]);

    const messages = locale === 'ru' ? (ru as Record<string, any>) : (en as Record<string, any>);

    const getByPath = (obj: Record<string, any>, path: string) => {
        return path.split('.').reduce<any>((acc, key) => (acc && key in acc ? acc[key] : undefined), obj);
    };

    const t = useCallback((key: string) => {
        const value = getByPath(messages, key);
        return typeof value === 'string' ? value : key;
    }, [messages]);

    const changeLanguage = useCallback((newLocale: 'ru' | 'en') => {
        if (newLocale === locale) return;

        // persist preference for middleware
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

        const segments = (pathname || '/').split('/');
        // ensure leading slash preserved -> ["", "ru", ...]
        if (segments.length > 1 && supportedLocales.includes(segments[1] as any)) {
            segments[1] = newLocale;
        } else {
            segments.splice(1, 0, newLocale);
        }
        const newPath = segments.join('/') || `/${newLocale}`;
        router.push(newPath);
    }, [locale, pathname, router]);

    return {
        t,
        locale,
        changeLanguage,
        isRTL: false,
    };
}
