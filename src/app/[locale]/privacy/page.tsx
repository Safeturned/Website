'use client';

import { useTranslation } from '../../../hooks/useTranslation';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
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
                    <div className="flex items-center space-x-4">
                        <a
                            href="https://github.com/Safeturned/Website"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-300 transition-all duration-300 hover:scale-110 group flex items-center"
                            title="View on GitHub"
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
                    <h1 className="text-3xl font-bold mb-8 text-center">Privacy Notice</h1>
                    
                    <div className="space-y-6 text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">1. Introduction</h2>
                            <p>This Privacy Notice explains how Safeturned collects, uses, and protects your information when you use our security analysis service. We are committed to protecting your privacy and being transparent about our data practices.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">2. Information We Do NOT Collect</h2>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <h3 className="font-semibold text-red-300 mb-2">Important: We do NOT store your plugin files</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>Plugin files (.dll)</strong> - Files are processed in memory and immediately discarded</li>
                                    <li><strong>File content</strong> - We never store the actual code or content of your plugins</li>
                                    <li><strong>Personal information</strong> - No names, emails, addresses, or personal identifiers</li>
                                    <li><strong>User accounts</strong> - No registration or login required</li>
                                    <li><strong>IP addresses</strong> - Only used temporarily for rate limiting, not stored</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">3. Information We DO Collect</h2>
                            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                <h3 className="font-semibold text-green-300 mb-2">File Metadata (for analysis purposes)</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>File hash</strong> - SHA-256 hash to identify duplicate files</li>
                                    <li><strong>File name</strong> - Original filename for reference</li>
                                    <li><strong>File size</strong> - Size in bytes for analysis</li>
                                    <li><strong>Detection type</strong> - Type of file detected (e.g., &ldquo;Assembly&rdquo;)</li>
                                    <li><strong>Scan results</strong> - Security score and threat detection results</li>
                                    <li><strong>Scan timestamps</strong> - When the file was first and last scanned</li>
                                    <li><strong>Scan count</strong> - How many times the file has been analyzed</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">4. Analytics Data We Collect</h2>
                            <p>We collect aggregated analytics data to improve our service and understand usage patterns:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Total files scanned</strong> - Number of files processed</li>
                                <li><strong>Threat detection statistics</strong> - Number of threats detected vs safe files</li>
                                <li><strong>Detection accuracy</strong> - Performance metrics of our analysis</li>
                                <li><strong>Average scan time</strong> - Service performance metrics</li>
                                <li><strong>Average security scores</strong> - Overall security trends</li>
                                <li><strong>Scan date ranges</strong> - First and last scan dates for analytics</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">5. How We Use Your Information</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Security Analysis</strong> - To provide plugin security scanning services</li>
                                <li><strong>Service Improvement</strong> - To enhance our detection algorithms and performance</li>
                                <li><strong>Duplicate Detection</strong> - To avoid re-analyzing the same files</li>
                                <li><strong>Rate Limiting</strong> - To prevent abuse and ensure fair usage</li>
                                <li><strong>Error Monitoring</strong> - To identify and fix technical issues (no file content included)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">6. Data Protection</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>No file storage</strong> - Plugin files are never saved to disk</li>
                                <li><strong>Memory-only processing</strong> - Files are processed in RAM and immediately discarded</li>
                                <li><strong>Encrypted transmission</strong> - All data is transmitted over HTTPS</li>
                                <li><strong>Database security</strong> - Only metadata is stored in secure databases</li>
                                <li><strong>Log filtering</strong> - File uploads are filtered from error logs</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">7. Data Retention</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>File metadata</strong> - Retained indefinitely for duplicate detection and analytics</li>
                                <li><strong>Scan records</strong> - Retained for service improvement and analytics</li>
                                <li><strong>Analytics data</strong> - Aggregated statistics retained for service optimization</li>
                                <li><strong>Plugin files</strong> - Never stored, immediately discarded after analysis</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">8. Data Sharing</h2>
                            <p>We do not sell, trade, or otherwise transfer your information to third parties. We may share:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Aggregated analytics</strong> - Public statistics (no individual file data)</li>
                                <li><strong>Service providers</strong> - Only for technical infrastructure (no file content)</li>
                                <li><strong>Legal requirements</strong> - Only if required by law (extremely unlikely given our data practices)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">9. Your Rights</h2>
                            <p>Since we don&apos;t collect personal information, traditional privacy rights don&apos;t apply. However, you can:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Stop using the service</strong> - No account required, simply stop uploading files</li>
                                <li><strong>Contact us</strong> - For questions about our privacy practices</li>
                                <li><strong>Review our code</strong> - All code is open source and publicly available</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">10. Open Source Transparency</h2>
                            <p>Safeturned is completely open source. You can:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Review our code</strong> - All source code is publicly available on GitHub</li>
                                <li><strong>Verify our practices</strong> - Check our actual data handling implementation</li>
                                <li><strong>Contribute</strong> - Help improve our privacy and security practices</li>
                                <li><strong>Self-host</strong> - Run your own instance if you prefer</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">11. Changes to This Notice</h2>
                            <p>We may update this Privacy Notice from time to time. Changes will be posted on this page with an updated date. Your continued use of the service constitutes acceptance of the updated notice.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">12. Contact Information</h2>
                            <p>If you have any questions about this Privacy Notice or our data practices, please contact us through our GitHub repository or other official channels.</p>
                        </section>

                        <div className="mt-8 pt-6 border-t border-purple-500/30">
                            <p className="text-sm text-gray-400">
                                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                                         {/* Back to Home Button */}
                     <div className="mt-8 text-center">
                                                                                                       <Link 
                               href={`/${locale}`}
                               className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                           >
                             Back to Home
                         </Link>
                     </div>
                </div>
            </div>
        </div>
    );
}
