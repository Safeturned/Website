'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getTierName, TIER_BADGE_COLORS } from '@/lib/tierConstants';
import { useTranslation } from '@/hooks/useTranslation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

interface User {
    id: string;
    email: string;
    discordUsername: string | null;
    discordAvatarUrl: string | null;
    steamUsername: string | null;
    steamAvatarUrl: string | null;
    tier: number;
    isAdmin: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    apiKeysCount: number;
    scannedFilesCount: number;
}

interface UsersResponse {
    page: number;
    pageSize: number;
    totalUsers: number;
    totalPages: number;
    users: User[];
}

export default function AdminUsersPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [usersData, setUsersData] = useState<UsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [tierFilter, setTierFilter] = useState<number | ''>('');
    const [adminFilter, setAdminFilter] = useState<boolean | ''>('');
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        title: string;
        message: string;
        action: () => void;
        type: 'danger' | 'warning';
    } | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showBotKeyModal, setShowBotKeyModal] = useState<{
        show: boolean;
        userId: string;
        userName: string;
    }>({ show: false, userId: '', userName: '' });
    const [botKeyForm, setBotKeyForm] = useState({
        name: '',
        tier: 3,
        requestsPerHour: 2147483647,
        expiresAt: '',
        scopes: ['read', 'analyze'],
        ipWhitelist: ''
    });
    const [createdBotKey, setCreatedBotKey] = useState<string | null>(null);
    const [botKeyError, setBotKeyError] = useState<string | null>(null);

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [search]);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
            router.push(`/${locale}`);
            return;
        }

        if (user?.isAdmin) {
            loadUsers();
        }
    }, [user, isAuthenticated, isLoading, router, locale, page, debouncedSearch, tierFilter, adminFilter]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: '20',
            });

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (tierFilter !== '') params.append('tier', tierFilter.toString());
            if (adminFilter !== '') params.append('isAdmin', adminFilter.toString());

            const response = await fetch(`${apiUrl}/v1.0/admin/users?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(t('admin.userManagement.failedToLoad'));
            }

            const data = await response.json();
            setUsersData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('admin.userManagement.failedToLoad'));
        } finally {
            setLoading(false);
        }
    };

    const updateUserTier = async (userId: string, newTier: number) => {
        try {
            setActionLoading(`tier-${userId}`);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const response = await fetch(`${apiUrl}/v1.0/admin/users/${userId}/tier`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier: newTier }),
            });

            if (!response.ok) {
                throw new Error(t('admin.userManagement.failedToUpdateTier'));
            }

            await loadUsers();
            setSuccessMessage('User tier updated successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : t('admin.userManagement.failedToUpdateTier'));
        } finally {
            setActionLoading(null);
        }
    };

    const toggleAdmin = async (userId: string, isCurrentlyAdmin: boolean, username: string) => {
        const action = async () => {
            try {
                setActionLoading(`admin-${userId}`);
                setConfirmDialog(null);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const endpoint = isCurrentlyAdmin ? 'revoke-admin' : 'grant-admin';
                const method = isCurrentlyAdmin ? 'DELETE' : 'POST';

                const response = await fetch(`${apiUrl}/v1.0/admin/users/${userId}/${endpoint}`, {
                    method,
                    credentials: 'include',
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || t('admin.userManagement.failedToUpdateAdmin'));
                }

                await loadUsers();
                setSuccessMessage(isCurrentlyAdmin ? 'Admin status revoked successfully' : 'Admin status granted successfully');
            } catch (err) {
                setError(err instanceof Error ? err.message : t('admin.userManagement.failedToUpdateAdmin'));
            } finally {
                setActionLoading(null);
            }
        };

        setConfirmDialog({
            show: true,
            title: isCurrentlyAdmin ? 'Revoke Admin Status' : 'Grant Admin Status',
            message: isCurrentlyAdmin
                ? `Are you sure you want to revoke admin privileges from ${username}? They will lose access to all administrative features.`
                : `Are you sure you want to grant admin privileges to ${username}? They will have full access to user management and system settings.`,
            action,
            type: isCurrentlyAdmin ? 'warning' : 'danger',
        });
    };

    const toggleActive = async (userId: string, isCurrentlyActive: boolean, username: string) => {
        const action = async () => {
            try {
                setActionLoading(`active-${userId}`);
                setConfirmDialog(null);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;
                const response = await fetch(`${apiUrl}/v1.0/admin/users/${userId}/toggle-active`, {
                    method: 'PATCH',
                    credentials: 'include',
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || t('admin.userManagement.failedToToggleStatus'));
                }

                await loadUsers();
                setSuccessMessage(isCurrentlyActive ? 'User deactivated successfully' : 'User activated successfully');
            } catch (err) {
                setError(err instanceof Error ? err.message : t('admin.userManagement.failedToToggleStatus'));
            } finally {
                setActionLoading(null);
            }
        };

        setConfirmDialog({
            show: true,
            title: isCurrentlyActive ? 'Deactivate User' : 'Activate User',
            message: isCurrentlyActive
                ? `Are you sure you want to deactivate ${username}? They will no longer be able to log in or use the service.`
                : `Are you sure you want to activate ${username}? They will regain access to the service.`,
            action,
            type: 'danger',
        });
    };

    const createBotApiKey = async () => {
        setBotKeyError(null);

        if (!botKeyForm.name.trim()) {
            setBotKeyError('API key name is required');
            return;
        }

        try {
            setActionLoading(`botkey-${showBotKeyModal.userId}`);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 365);

            const payload: any = {
                name: botKeyForm.name,
                tier: botKeyForm.tier,
                requestsPerHour: botKeyForm.requestsPerHour,
                scopes: botKeyForm.scopes,
                expiresAt: expiresAt.toISOString(),
            };

            if (botKeyForm.ipWhitelist.trim()) {
                payload.ipWhitelist = botKeyForm.ipWhitelist.trim();
            }

            const response = await fetch(`${apiUrl}/v1.0/admin/users/${showBotKeyModal.userId}/api-keys`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create Bot API key');
            }

            const data = await response.json();
            setCreatedBotKey(data.key);
            setSuccessMessage(`Bot API key created for ${showBotKeyModal.userName}`);
            setBotKeyForm({
                name: '',
                tier: 3,
                requestsPerHour: 2147483647,
                expiresAt: '',
                scopes: ['read', 'analyze'],
                ipWhitelist: ''
            });
        } catch (err) {
            setBotKeyError(err instanceof Error ? err.message : 'Failed to create Bot API key');
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading || loading) {
        return (
            <div className='min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800'>
                <Navigation />
                <div className='flex-1 flex items-center justify-center'>
                    <div className='text-white'>{t('common.loading')}</div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!isAuthenticated || !user?.isAdmin) {
        return null;
    }

    return (
        <div className='min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800'>
            <Navigation />
            <div className='flex-1 px-6 py-8'>
                <div className='max-w-7xl mx-auto'>
                    <div className='mb-8'>
                        <Link
                            href={`/${locale}/admin`}
                            className='text-purple-400 hover:text-purple-300 transition-colors mb-4 inline-flex items-center gap-2'
                        >
                            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                            </svg>
                            {t('admin.backToDashboard')}
                        </Link>
                        <h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent pb-1 leading-tight'>
                            {t('admin.userManagement.title')}
                        </h1>
                        <p className='text-gray-400'>{t('admin.userManagement.description')}</p>
                    </div>

                    {error && (
                        <div className='bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6'>
                            <p className='text-red-300'>{error}</p>
                        </div>
                    )}

                    <div className='bg-slate-800/40 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 mb-6'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                            <div>
                                <label className='text-gray-400 text-sm mb-2 block'>{t('admin.userManagement.search')}</label>
                                <input
                                    type='text'
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                    }}
                                    placeholder={t('admin.userManagement.searchPlaceholder', 'Email or username...')}
                                    className='w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500'
                                />
                            </div>
                            <div>
                                <label className='text-gray-400 text-sm mb-2 block'>{t('admin.userManagement.tier')}</label>
                                <select
                                    value={tierFilter}
                                    onChange={(e) => {
                                        setTierFilter(e.target.value === '' ? '' : parseInt(e.target.value));
                                        setPage(1);
                                    }}
                                    className='w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500'
                                >
                                    <option value=''>{t('admin.userManagement.allTiers')}</option>
                                    <option value='0'>Free</option>
                                    <option value='1'>Verified</option>
                                    <option value='2'>Premium</option>
                                </select>
                            </div>
                            <div>
                                <label className='text-gray-400 text-sm mb-2 block'>{t('admin.userManagement.adminStatus')}</label>
                                <select
                                    value={adminFilter.toString()}
                                    onChange={(e) => {
                                        setAdminFilter(e.target.value === '' ? '' : e.target.value === 'true');
                                        setPage(1);
                                    }}
                                    className='w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500'
                                >
                                    <option value=''>{t('admin.userManagement.allUsers')}</option>
                                    <option value='true'>{t('admin.userManagement.adminsOnly')}</option>
                                    <option value='false'>{t('admin.userManagement.nonAdmins')}</option>
                                </select>
                            </div>
                            <div className='flex items-end'>
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setDebouncedSearch('');
                                        setTierFilter('');
                                        setAdminFilter('');
                                        setPage(1);
                                    }}
                                    className='w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white hover:bg-slate-700 transition-colors'
                                >
                                    {t('admin.userManagement.clearFilters')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {usersData && (
                        <>
                            <div className='bg-slate-800/40 backdrop-blur-md border border-purple-500/20 rounded-xl overflow-hidden mb-6'>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead className='bg-slate-700/50'>
                                            <tr>
                                                <th className='text-left p-4 pr-6 text-gray-400 font-medium'>{t('admin.userManagement.user')}</th>
                                                <th className='text-left p-4 text-gray-400 font-medium'>{t('admin.userManagement.tier')}</th>
                                                <th className='text-left p-4 text-gray-400 font-medium'>{t('admin.userManagement.status')}</th>
                                                <th className='text-left p-4 text-gray-400 font-medium'>{t('admin.userManagement.activity')}</th>
                                                <th className='text-left p-4 text-gray-400 font-medium'>{t('admin.userManagement.actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-700/50'>
                                            {usersData.users.map((u) => (
                                                <tr key={u.id} className='hover:bg-slate-700/20 transition-colors'>
                                                    <td className='p-4 pr-6'>
                                                        <div className='flex items-center gap-3'>
                                                            {(u.discordAvatarUrl || u.steamAvatarUrl) && (
                                                                <img
                                                                    src={u.discordAvatarUrl || u.steamAvatarUrl || ''}
                                                                    alt=''
                                                                    className='w-10 h-10 rounded-full'
                                                                />
                                                            )}
                                                            <div className='flex flex-col gap-0.5'>
                                                                <p className='text-white font-medium'>
                                                                    {u.discordUsername || u.steamUsername || u.email}
                                                                </p>
                                                                <p className='text-gray-400 text-sm'>{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <select
                                                            value={u.tier}
                                                            onChange={(e) => updateUserTier(u.id, parseInt(e.target.value))}
                                                            className={`${TIER_BADGE_COLORS[u.tier]} text-white rounded-lg px-3 py-1 text-sm font-medium`}
                                                        >
                                                            <option value='0'>Free</option>
                                                            <option value='1'>Verified</option>
                                                            <option value='2'>Premium</option>
                                                            <option value='3'>Bot</option>
                                                        </select>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='flex flex-col gap-1'>
                                                            {u.isAdmin && (
                                                                <span className='bg-yellow-600 text-white text-xs px-2 py-1 rounded w-fit'>
                                                                    {t('admin.stats.admins')}
                                                                </span>
                                                            )}
                                                            <span
                                                                className={`${u.isActive ? 'bg-green-600' : 'bg-red-600'} text-white text-xs px-2 py-1 rounded w-fit`}
                                                            >
                                                                {u.isActive ? t('admin.userManagement.active') : t('admin.userManagement.inactive')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='text-sm'>
                                                            <p className='text-gray-400'>
                                                                Scans: <span className='text-white'>{u.scannedFilesCount}</span>
                                                            </p>
                                                            <p className='text-gray-400'>
                                                                API Keys: <span className='text-white'>{u.apiKeysCount}</span>
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className='p-4'>
                                                        <div className='flex gap-2 flex-wrap'>
                                                            <button
                                                                onClick={() => toggleAdmin(u.id, u.isAdmin, u.discordUsername || u.steamUsername || u.email)}
                                                                disabled={actionLoading === `admin-${u.id}`}
                                                                className='bg-yellow-600/20 border border-yellow-600/50 text-yellow-300 px-3 py-1 rounded-lg text-sm hover:bg-yellow-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                            >
                                                                {actionLoading === `admin-${u.id}` ? '...' : (u.isAdmin ? t('admin.userManagement.revokeAdmin') : t('admin.userManagement.grantAdmin'))}
                                                            </button>
                                                            <button
                                                                onClick={() => toggleActive(u.id, u.isActive, u.discordUsername || u.steamUsername || u.email)}
                                                                disabled={actionLoading === `active-${u.id}`}
                                                                className='bg-slate-600/20 border border-slate-600/50 text-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-slate-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                                            >
                                                                {actionLoading === `active-${u.id}` ? '...' : (u.isActive ? t('admin.userManagement.deactivate') : t('admin.userManagement.activate'))}
                                                            </button>
                                                            <button
                                                                onClick={() => setShowBotKeyModal({ show: true, userId: u.id, userName: u.discordUsername || u.steamUsername || u.email })}
                                                                className='bg-green-600/20 border border-green-600/50 text-green-300 px-3 py-1 rounded-lg text-sm hover:bg-green-600/30 transition-colors'
                                                            >
                                                                🤖 Create Bot Key
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {confirmDialog && (
                                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4'>
                                    <div className='bg-slate-800 border border-purple-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl'>
                                        <h3 className={`text-xl font-bold mb-3 ${confirmDialog.type === 'danger' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {confirmDialog.title}
                                        </h3>
                                        <p className='text-gray-300 mb-6 leading-relaxed'>
                                            {confirmDialog.message}
                                        </p>
                                        <div className='flex gap-3 justify-end'>
                                            <button
                                                onClick={() => setConfirmDialog(null)}
                                                className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmDialog.action}
                                                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                                                    confirmDialog.type === 'danger'
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                }`}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showBotKeyModal.show && (
                                <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 overflow-y-auto'>
                                    <div className='bg-slate-800 border border-green-500/30 rounded-xl p-6 max-w-2xl w-full shadow-2xl my-8'>
                                        <div className='flex items-center justify-between mb-4'>
                                            <h3 className='text-2xl font-bold text-green-400'>🤖 Create Bot API Key</h3>
                                            <button
                                                onClick={() => {
                                                    setShowBotKeyModal({ show: false, userId: '', userName: '' });
                                                    setCreatedBotKey(null);
                                                }}
                                                className='text-gray-400 hover:text-white transition-colors'
                                            >
                                                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                                </svg>
                                            </button>
                                        </div>

                                        {createdBotKey ? (
                                            <div className='space-y-4'>
                                                <div className='bg-green-900/20 border border-green-500/50 rounded-lg p-4'>
                                                    <p className='text-green-300 font-medium mb-2'>✅ Bot API Key Created Successfully!</p>
                                                    <p className='text-gray-300 text-sm mb-4'>Save this key securely. It will not be shown again!</p>
                                                    <div className='bg-slate-900 border border-green-500/30 rounded-lg p-4'>
                                                        <code className='text-green-400 text-sm break-all font-mono'>{createdBotKey}</code>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(createdBotKey);
                                                        setSuccessMessage('API key copied to clipboard!');
                                                    }}
                                                    className='w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium'
                                                >
                                                    📋 Copy to Clipboard
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowBotKeyModal({ show: false, userId: '', userName: '' });
                                                        setCreatedBotKey(null);
                                                    }}
                                                    className='w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors'
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className='text-gray-300 mb-6'>
                                                    Create a Bot tier API key for <strong className='text-white'>{showBotKeyModal.userName}</strong>
                                                </p>

                                                {botKeyError && (
                                                    <div className='mb-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg'>
                                                        <div className='flex items-center gap-2'>
                                                            <svg className='w-5 h-5 text-red-400 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                                                                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                                                            </svg>
                                                            <span className='text-red-300 text-sm'>{botKeyError}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className='space-y-4'>
                                                    <div>
                                                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                            Key Name *
                                                        </label>
                                                        <input
                                                            type='text'
                                                            value={botKeyForm.name}
                                                            onChange={(e) => setBotKeyForm({...botKeyForm, name: e.target.value})}
                                                            placeholder='Discord Bot, CI/CD Pipeline, etc.'
                                                            className='w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500'
                                                        />
                                                    </div>

                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div>
                                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                                Tier
                                                            </label>
                                                            <select
                                                                value={botKeyForm.tier}
                                                                onChange={(e) => setBotKeyForm({...botKeyForm, tier: parseInt(e.target.value)})}
                                                                className='w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500'
                                                            >
                                                                <option value='0'>Free (60/hour)</option>
                                                                <option value='1'>Verified (300/hour)</option>
                                                                <option value='2'>Premium (1000/hour)</option>
                                                                <option value='3'>Bot (Unlimited)</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                                Requests/Hour
                                                            </label>
                                                            <input
                                                                type='number'
                                                                value={botKeyForm.requestsPerHour}
                                                                onChange={(e) => setBotKeyForm({...botKeyForm, requestsPerHour: parseInt(e.target.value)})}
                                                                className='w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500'
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                            IP Whitelist (Optional)
                                                        </label>
                                                        <input
                                                            type='text'
                                                            value={botKeyForm.ipWhitelist}
                                                            onChange={(e) => setBotKeyForm({...botKeyForm, ipWhitelist: e.target.value})}
                                                            placeholder='192.168.1.1, 10.0.0.0/24'
                                                            className='w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-green-500'
                                                        />
                                                        <p className='text-xs text-gray-400 mt-1'>Comma-separated IPs or CIDR ranges</p>
                                                    </div>

                                                    <div className='bg-blue-900/20 border border-blue-500/30 rounded-lg p-4'>
                                                        <p className='text-blue-300 text-sm'>
                                                            💡 <strong>Bot tier</strong> bypasses rate limiting completely. API key will expire in 365 days.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className='flex gap-3 mt-6'>
                                                    <button
                                                        onClick={() => setShowBotKeyModal({ show: false, userId: '', userName: '' })}
                                                        className='flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors'
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={createBotApiKey}
                                                        disabled={actionLoading === `botkey-${showBotKeyModal.userId}`}
                                                        className='flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                                                    >
                                                        {actionLoading === `botkey-${showBotKeyModal.userId}` ? 'Creating...' : 'Create Bot API Key'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className='flex items-center justify-between'>
                                <p className='text-gray-400'>
                                    {t('admin.userManagement.showing', undefined, { count: usersData.users.length, total: usersData.totalUsers })}
                                </p>
                                {usersData.totalPages > 0 ? (
                                    <div className='flex gap-2'>
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className='bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors'
                                        >
                                            {t('admin.userManagement.previous', 'Previous')}
                                        </button>
                                        <span className='text-white px-4 py-2'>
                                            {t('admin.userManagement.page', undefined, { current: page, total: usersData.totalPages })}
                                        </span>
                                        <button
                                            onClick={() => setPage(p => Math.min(usersData.totalPages, p + 1))}
                                            disabled={page === usersData.totalPages}
                                            className='bg-slate-700/50 border border-slate-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors'
                                        >
                                            {t('admin.userManagement.next', 'Next')}
                                        </button>
                                    </div>
                                ) : (
                                    <span className='text-gray-400 px-4 py-2'>No pages</span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />

            {successMessage && (
                <div className='fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl border border-green-500 flex items-center gap-3 animate-slide-up z-50'>
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    <span className='font-medium'>{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className='ml-2 hover:bg-green-700 rounded p-1 transition-colors'
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
