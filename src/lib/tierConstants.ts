export const TIER_FREE = 0;
export const TIER_VERIFIED = 1;
export const TIER_PREMIUM = 2;
export const TIER_BOT = 3;

export const TIER_NAMES: Record<number, string> = {
    [TIER_FREE]: 'Free',
    [TIER_VERIFIED]: 'Verified',
    [TIER_PREMIUM]: 'Premium',
    [TIER_BOT]: 'Bot',
};

export const TIER_RATE_LIMITS: Record<number, number> = {
    [TIER_FREE]: 60,
    [TIER_VERIFIED]: 300,
    [TIER_PREMIUM]: 1000,
    [TIER_BOT]: 10000,
};

export const TIER_FILE_SIZE_LIMITS: Record<number, number> = {
    [TIER_FREE]: 100,
    [TIER_VERIFIED]: 200,
    [TIER_PREMIUM]: 500,
    [TIER_BOT]: 500,
};

export const TIER_API_KEY_LIMITS: Record<number, number> = {
    [TIER_FREE]: 3,
    [TIER_VERIFIED]: 5,
    [TIER_PREMIUM]: 10,
    [TIER_BOT]: 10,
};

export const TIER_TEXT_COLORS: Record<number, string> = {
    [TIER_FREE]: 'text-purple-400',
    [TIER_VERIFIED]: 'text-blue-400',
    [TIER_PREMIUM]: 'text-yellow-400',
    [TIER_BOT]: 'text-green-400',
};

export const TIER_BG_COLORS: Record<number, string> = {
    [TIER_FREE]: 'bg-purple-500/20',
    [TIER_VERIFIED]: 'bg-blue-500/20',
    [TIER_PREMIUM]: 'bg-yellow-500/20',
    [TIER_BOT]: 'bg-green-500/20',
};

export const TIER_BORDER_COLORS: Record<number, string> = {
    [TIER_FREE]: 'border-purple-400',
    [TIER_VERIFIED]: 'border-blue-400',
    [TIER_PREMIUM]: 'border-yellow-400',
    [TIER_BOT]: 'border-green-400',
};

export const TIER_BADGE_COLORS: Record<number, string> = {
    [TIER_FREE]: 'bg-purple-600',
    [TIER_VERIFIED]: 'bg-blue-600',
    [TIER_PREMIUM]: 'bg-yellow-600',
    [TIER_BOT]: 'bg-green-600',
};

export const TIER_TEXT_COLORS_ALT: Record<number, string> = {
    [TIER_FREE]: 'text-slate-400',
    [TIER_VERIFIED]: 'text-blue-400',
    [TIER_PREMIUM]: 'text-purple-400',
};

export const TIER_FEATURES: Record<number, { prioritySupport: boolean }> = {
    [TIER_FREE]: { prioritySupport: false },
    [TIER_VERIFIED]: { prioritySupport: true },
    [TIER_PREMIUM]: { prioritySupport: true },
    [TIER_BOT]: { prioritySupport: true },
};

export const getTierName = (tier: number): string => {
    return TIER_NAMES[tier] || TIER_NAMES[TIER_FREE];
};

export const getTierTextColor = (tier: number): string => {
    return TIER_TEXT_COLORS[tier] || TIER_TEXT_COLORS[TIER_FREE];
};

export const getTierBgColor = (tier: number): string => {
    return TIER_BG_COLORS[tier] || TIER_BG_COLORS[TIER_FREE];
};

export const getTierBorderColor = (tier: number): string => {
    return TIER_BORDER_COLORS[tier] || TIER_BORDER_COLORS[TIER_FREE];
};

export const getTierBadgeColor = (tier: number): string => {
    return TIER_BADGE_COLORS[tier] || TIER_BADGE_COLORS[TIER_FREE];
};

export const getTierTextColorAlt = (tier: number): string => {
    return TIER_TEXT_COLORS_ALT[tier] || TIER_TEXT_COLORS_ALT[TIER_FREE];
};

export const getTierRateLimit = (tier: number): string => {
    const limit = TIER_RATE_LIMITS[tier] || TIER_RATE_LIMITS[TIER_FREE];
    if (limit >= 10000) {
        return `${(limit / 1000).toFixed(0)},000`;
    } else if (limit >= 1000) {
        return `${(limit / 1000).toFixed(0)},000`;
    }
    return limit.toString();
};

export const getTierRateLimitNumber = (tier: number): number => {
    return TIER_RATE_LIMITS[tier] || TIER_RATE_LIMITS[TIER_FREE];
};

export const getTierFileSizeLimit = (tier: number): number => {
    return TIER_FILE_SIZE_LIMITS[tier] || TIER_FILE_SIZE_LIMITS[TIER_FREE];
};

export const getTierApiKeyLimit = (tier: number): number => {
    return TIER_API_KEY_LIMITS[tier] || TIER_API_KEY_LIMITS[TIER_FREE];
};

export const hasPrioritySupport = (tier: number): boolean => {
    return TIER_FEATURES[tier]?.prioritySupport ?? false;
};
