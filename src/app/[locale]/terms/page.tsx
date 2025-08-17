'use client';

import { useTranslation } from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TermsPage() {
    const { t, locale } = useTranslation();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <nav className="px-6 py-4 border-b border-purple-800/30 backdrop-blur-sm relative z-100">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href={`/${locale}`} className="flex items-center space-x-3">
                        <div className="w-10 h-10">
                            <Image
                                src="/favicon.jpg"
                                alt="Safeturned Logo"
                                width={40}
                                height={40}
                                className="w-full h-full object-contain rounded-lg"
                            />
                        </div>
                        <span className="text-xl font-bold">{t('hero.title')}</span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-6">
                        <a
                            href="https://github.com/Safeturned/Website"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group flex items-center"
                            title={t('github.tooltip')}
                        >
                            <svg
                                className="w-6 h-6 group-hover:rotate-12 transition-all duration-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </a>
                        <a
                            href="https://discord.gg/JAKWGEabhc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 hover:-translate-y-1 group flex items-center"
                            title="Join our Discord Community"
                        >
                            <svg
                                className="w-6 h-6 group-hover:rotate-12 transition-all duration-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                            </svg>
                        </a>
                        <LanguageSwitcher />
                    </div>
                    
                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center space-x-6">
                        <a
                            href="https://github.com/Safeturned/Website"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                            title={t('github.tooltip')}
                        >
                            <svg
                                className="w-5 h-5 group-hover:rotate-12 transition-all duration-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                        </a>
                        <a
                            href="https://discord.gg/JAKWGEabhc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                            title="Join our Discord Community"
                        >
                            <svg
                                className="w-5 h-5 group-hover:rotate-12 transition-all duration-300"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                            </svg>
                        </a>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8 relative z-1">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-8 text-center">{t('terms.title')}</h1>

                    <div className="space-y-6 text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.acceptance.title')}</h2>
                            <p>{t('terms.acceptance.content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.description.title')}</h2>
                            <p>{t('terms.description.content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.responsibilities.title')}</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>{t('terms.responsibilities.fileOwnership.title')}</strong> - {t('terms.responsibilities.fileOwnership.content')}</li>
                                <li><strong>{t('terms.responsibilities.noPersonalInfo.title')}</strong> - {t('terms.responsibilities.noPersonalInfo.content')}</li>
                                <li><strong>{t('terms.responsibilities.legalUse.title')}</strong> - {t('terms.responsibilities.legalUse.content')}</li>
                                <li><strong>{t('terms.responsibilities.noMaliciousIntent.title')}</strong> - {t('terms.responsibilities.noMaliciousIntent.content')}</li>
                                <li><strong>{t('terms.responsibilities.compliance.title')}</strong> - {t('terms.responsibilities.compliance.content')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.limitations.title')}</h2>
                            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-300 mb-2">{t('terms.limitations.important')}</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>{t('terms.limitations.noGuarantees.title')}</strong> - {t('terms.limitations.noGuarantees.content')}</li>
                                    <li><strong>{t('terms.limitations.falsePositives.title')}</strong> - {t('terms.limitations.falsePositives.content')}</li>
                                    <li><strong>{t('terms.limitations.falseNegatives.title')}</strong> - {t('terms.limitations.falseNegatives.content')}</li>
                                    <li><strong>{t('terms.limitations.fileSize.title')}</strong> - {t('terms.limitations.fileSize.content')}</li>
                                    <li><strong>{t('terms.limitations.fileTypes.title')}</strong> - {t('terms.limitations.fileTypes.content')}</li>
                                    <li><strong>{t('terms.limitations.rateLimits.title')}</strong> - {t('terms.limitations.rateLimits.content')}</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.dataHandling.title')}</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>{t('terms.dataHandling.noFileStorage.title')}</strong> - {t('terms.dataHandling.noFileStorage.content')}</li>
                                <li><strong>{t('terms.dataHandling.metadataOnly.title')}</strong> - {t('terms.dataHandling.metadataOnly.content')}</li>
                                <li><strong>{t('terms.dataHandling.noContentAnalysis.title')}</strong> - {t('terms.dataHandling.noContentAnalysis.content')}</li>
                                <li><strong>{t('terms.dataHandling.analyticsData.title')}</strong> - {t('terms.dataHandling.analyticsData.content')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.intellectualProperty.title')}</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>{t('terms.intellectualProperty.yourFiles.title')}</strong> - {t('terms.intellectualProperty.yourFiles.content')}</li>
                                <li><strong>{t('terms.intellectualProperty.ourService.title')}</strong> - {t('terms.intellectualProperty.ourService.content')}</li>
                                <li><strong>{t('terms.intellectualProperty.openSource.title')}</strong> - {t('terms.intellectualProperty.openSource.content')}</li>
                                <li><strong>{t('terms.intellectualProperty.noClaims.title')}</strong> - {t('terms.intellectualProperty.noClaims.content')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.disclaimers.title')}</h2>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <h3 className="font-semibold text-red-300 mb-2">{t('terms.disclaimers.important')}</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>{t('terms.disclaimers.noWarranty.title')}</strong> - {t('terms.disclaimers.noWarranty.content')}</li>
                                    <li><strong>{t('terms.disclaimers.noLiability.title')}</strong> - {t('terms.disclaimers.noLiability.content')}</li>
                                    <li><strong>{t('terms.disclaimers.securityDecisions.title')}</strong> - {t('terms.disclaimers.securityDecisions.content')}</li>
                                    <li><strong>{t('terms.disclaimers.thirdPartyContent.title')}</strong> - {t('terms.disclaimers.thirdPartyContent.content')}</li>
                                    <li><strong>{t('terms.disclaimers.serviceAvailability.title')}</strong> - {t('terms.disclaimers.serviceAvailability.content')}</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.prohibitedUses.title')}</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>{t('terms.prohibitedUses.illegalActivities.title')}</strong> - {t('terms.prohibitedUses.illegalActivities.content')}</li>
                                <li><strong>{t('terms.prohibitedUses.spam.title')}</strong> - {t('terms.prohibitedUses.spam.content')}</li>
                                <li><strong>{t('terms.prohibitedUses.harassment.title')}</strong> - {t('terms.prohibitedUses.harassment.content')}</li>
                                <li><strong>{t('terms.prohibitedUses.reverseEngineering.title')}</strong> - {t('terms.prohibitedUses.reverseEngineering.content')}</li>
                                <li><strong>{t('terms.prohibitedUses.bypassingSecurity.title')}</strong> - {t('terms.prohibitedUses.bypassingSecurity.content')}</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.termination.title')}</h2>
                            <p>{t('terms.termination.content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.changes.title')}</h2>
                            <p>{t('terms.changes.content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.governingLaw.title')}</h2>
                            <p>{t('terms.governingLaw.content')}</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">{t('terms.contact.title')}</h2>
                            <p>{t('terms.contact.content')}</p>
                        </section>

                        <div className="mt-8 pt-6 border-t border-purple-500/30">
                            <p className="text-sm text-gray-400">
                                <strong>{t('terms.lastUpdated')}:</strong> {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Back to Home Button */}
                    <div className="mt-8 text-center">
                        <Link
                            href={`/${locale}`}
                            className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                        >
                            {t('results.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
