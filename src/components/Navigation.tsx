'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import UserMenu from '@/components/Auth/UserMenu';
import { GitHubIcon, DiscordIcon } from '@/components/Icons';

export default function Navigation() {
    const { t, locale } = useTranslation();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`px-6 py-4 border-b backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-slate-900/95 border-purple-800/50 shadow-lg shadow-purple-900/20'
                    : 'bg-transparent border-purple-800/20'
            }`}
        >
            <div className='max-w-7xl mx-auto flex justify-between items-center'>
                {pathname === `/${locale}` || pathname === `/${locale}/` ? (
                    <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 select-none flex-shrink-0'>
                            <Image
                                src='/favicon.jpg'
                                alt='Safeturned Logo'
                                width={40}
                                height={40}
                                className='w-full h-full object-contain rounded-lg pointer-events-none'
                                draggable={false}
                                onContextMenu={e => e.preventDefault()}
                                onDragStart={e => e.preventDefault()}
                            />
                        </div>
                        <span className='text-xl font-bold whitespace-nowrap text-white'>
                            {t('hero.title')}
                        </span>
                    </div>
                ) : (
                    <Link
                        href={`/${locale}`}
                        className='flex items-center space-x-3 hover:opacity-80 transition-opacity'
                    >
                        <div className='w-10 h-10 select-none flex-shrink-0'>
                            <Image
                                src='/favicon.jpg'
                                alt='Safeturned Logo'
                                width={40}
                                height={40}
                                className='w-full h-full object-contain rounded-lg pointer-events-none'
                                draggable={false}
                                onContextMenu={e => e.preventDefault()}
                                onDragStart={e => e.preventDefault()}
                            />
                        </div>
                        <span className='text-xl font-bold whitespace-nowrap text-white'>
                            {t('hero.title')}
                        </span>
                    </Link>
                )}
                <div className='flex-1' />
                <div className='flex items-center space-x-3 md:space-x-5'>
                    <Link
                        href={`/${locale}/docs`}
                        className='hidden md:flex items-center gap-1.5 text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm'
                        title={t('nav.apiDocumentation')}
                    >
                        <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
                            />
                        </svg>
                        <span className='hidden lg:inline'>{t('nav.docs')}</span>
                    </Link>
                    <a
                        href='https://github.com/Safeturned'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hidden sm:flex items-center gap-2 text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm'
                        title={t('nav.githubOrganization')}
                    >
                        <GitHubIcon />
                        <span className='hidden lg:inline'>{t('nav.github')}</span>
                    </a>
                    <a
                        href='https://discord.gg/JAKWGEabhc'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='hidden sm:flex items-center gap-2 text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm'
                        title={t('nav.joinDiscord')}
                    >
                        <DiscordIcon className='w-5 h-5' />
                        <span className='hidden lg:inline'>{t('nav.discord')}</span>
                    </a>
                    <LanguageSwitcher />
                    <UserMenu />
                </div>
            </div>
        </nav>
    );
}
