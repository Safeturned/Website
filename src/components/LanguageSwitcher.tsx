'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const languages: Array<{ code: 'ru' | 'en'; name: string; flag: string }> = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
];

export default function LanguageSwitcher() {
    const { locale, changeLanguage } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (langCode: 'ru' | 'en') => {
        changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-purple-500/30 hover:bg-slate-800/70 hover:border-purple-500/50 transition-all duration-300 text-white"
            >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="text-sm font-medium">{currentLanguage.name}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-xl z-50">
                    <div className="py-1">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-purple-500/20 transition-colors duration-200 ${
                                    locale === language.code
                                        ? 'bg-purple-500/30 text-purple-300'
                                        : 'text-white'
                                }`}
                            >
                                <span className="text-lg">{language.flag}</span>
                                <span className="text-sm font-medium">{language.name}</span>
                                {locale === language.code && (
                                    <svg
                                        className="w-4 h-4 ml-auto text-purple-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
