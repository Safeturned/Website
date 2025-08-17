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
                    <LanguageSwitcher />
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8 relative z-1">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-8">
                    <h1 className="text-3xl font-bold mb-8 text-center">Terms of Service</h1>

                    <div className="space-y-6 text-gray-300">
                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
                            <p>By accessing and using Safeturned, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">2. Description of Service</h2>
                            <p>Safeturned is a security analysis service that scans plugin files (.dll) for potential backdoors, trojans, and other malicious components. The service provides automated code analysis and threat detection for Unturned server plugins.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">3. User Responsibilities</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>File Ownership</strong> - You must only upload files that you own or have permission to analyze</li>
                                <li><strong>No Personal Information</strong> - Do not submit any personal information or sensitive data</li>
                                <li><strong>Legal Use</strong> - Use the service only for legitimate security analysis purposes</li>
                                <li><strong>No Malicious Intent</strong> - Do not use the service to analyze files with the intent to harm others</li>
                                <li><strong>Compliance</strong> - Comply with all applicable laws and regulations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">4. Service Limitations</h2>
                            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-300 mb-2">Important Limitations</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>No Guarantees</strong> - We do not guarantee 100% accuracy of threat detection</li>
                                    <li><strong>False Positives</strong> - Legitimate files may be flagged as suspicious</li>
                                    <li><strong>False Negatives</strong> - Some threats may not be detected</li>
                                    <li><strong>File Size</strong> - Maximum file size is 500MB</li>
                                    <li><strong>File Types</strong> - Only .dll files are supported</li>
                                    <li><strong>Rate Limits</strong> - Upload and analysis requests are rate-limited</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">5. Data Handling</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>No File Storage</strong> - Plugin files are processed in memory and immediately discarded</li>
                                <li><strong>Metadata Only</strong> - Only file metadata (hash, name, size, scan results) is stored</li>
                                <li><strong>No Content Analysis</strong> - We do not store or analyze the actual code content</li>
                                <li><strong>Analytics Data</strong> - Aggregated statistics are collected for service improvement</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">6. Intellectual Property</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Your Files</strong> - You retain all rights to your uploaded files</li>
                                <li><strong>Our Service</strong> - Safeturned and its analysis algorithms are our intellectual property</li>
                                <li><strong>Open Source</strong> - The service is open source and available under appropriate licenses</li>
                                <li><strong>No Claims</strong> - We make no claims on your intellectual property</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">7. Disclaimers</h2>
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                                <h3 className="font-semibold text-red-300 mb-2">Important Disclaimers</h3>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li><strong>No Warranty</strong> - The service is provided "as is" without any warranties</li>
                                    <li><strong>No Liability</strong> - We are not liable for any damages arising from use of the service</li>
                                    <li><strong>Security Decisions</strong> - You are responsible for your own security decisions</li>
                                    <li><strong>Third-Party Content</strong> - We are not responsible for the content of analyzed files</li>
                                    <li><strong>Service Availability</strong> - We do not guarantee uninterrupted service availability</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">8. Prohibited Uses</h2>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Illegal Activities</strong> - Using the service for illegal purposes</li>
                                <li><strong>Spam</strong> - Excessive or automated requests</li>
                                <li><strong>Harassment</strong> - Using the service to harass or harm others</li>
                                <li><strong>Reverse Engineering</strong> - Attempting to reverse engineer our systems</li>
                                <li><strong>Bypassing Security</strong> - Attempting to bypass rate limits or security measures</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">9. Termination</h2>
                            <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">10. Changes to Terms</h2>
                            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">11. Governing Law</h2>
                            <p>These Terms shall be interpreted and governed by the laws of the jurisdiction in which the service operates, without regard to its conflict of law provisions.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3 text-white">12. Contact Information</h2>
                            <p>If you have any questions about these Terms of Service, please contact us through our GitHub repository or other official channels.</p>
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
                             className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-lg font-medium transition-all duration-300"
                         >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
