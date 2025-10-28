/**
 * Formats file size in human-readable format with localization
 * @param bytes - File size in bytes
 * @param t - Translation function
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, t: (key: string) => string): string => {
    if (bytes === 0) return `0 ${t('fileSizeUnits.bytes')}`;
    const k = 1024;
    const sizeKeys = ['bytes', 'kb', 'mb', 'gb'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + t(`fileSizeUnits.${sizeKeys[i]}`)
    );
};

/**
 * Formats scan time in human-readable format with localization
 * @param milliseconds - Time in milliseconds
 * @param t - Translation function
 * @returns Formatted time string
 */
export const formatScanTime = (milliseconds: number, t: (key: string) => string): string => {
    if (milliseconds < 1000) {
        return `${Math.round(milliseconds)}${t('timeUnits.milliseconds')}`;
    } else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(1)}${t('timeUnits.seconds')}`;
    } else {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes}${t('timeUnits.minutes')} ${seconds}${t('timeUnits.seconds')}`;
    }
};

/**
 * Computes SHA-256 hash of a file
 * @param file - File object
 * @returns Promise<string> - Base64 encoded hash
 */
export const computeFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const bytes = Array.from(new Uint8Array(hashBuffer));
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64;
};

/**
 * Gets risk level based on score
 * @param score - Security score (0-100)
 * @param t - Translation function
 * @returns Risk level string
 */
export const getRiskLevel = (score: number, t: (key: string) => string): string => {
    if (score <= 70) return t('results.safe');
    if (score >= 50) return t('results.suspicious');
    return t('results.unsafe');
};

/**
 * Gets risk color class based on score
 * @param score - Security score (0-100)
 * @returns CSS class string
 */
export const getRiskColor = (score: number): string => {
    if (score <= 70) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
};
