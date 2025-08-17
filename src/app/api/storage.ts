// Shared in-memory storage for analysis results
// In production, this should be replaced with a proper database

// Use global variables to ensure persistence across requests in development
declare global {
    var __analysisResults: Map<string, any> | undefined;
    var __fileStorage: Map<string, { fileData: ArrayBuffer, fileName: string, mimeType: string }> | undefined;
}

// Initialize global storage if it doesn't exist
if (!global.__analysisResults) {
    global.__analysisResults = new Map<string, any>();
}
if (!global.__fileStorage) {
    global.__fileStorage = new Map<string, { fileData: ArrayBuffer, fileName: string, mimeType: string }>();
}

export const analysisResults = global.__analysisResults;
export const fileStorage = global.__fileStorage;

export function storeAnalysisResult(id: string, data: any) {
    analysisResults.set(id, {
        ...data,
        id,
        createdAt: new Date().toISOString()
    });
}

export function storeFile(id: string, fileData: ArrayBuffer, fileName: string, mimeType: string) {
    fileStorage.set(id, { fileData, fileName, mimeType });
}

export function getAnalysisResult(id: string) {
    // Try the original ID first
    let result = analysisResults.get(id);
    if (result) {
        return result;
    }

    // Try URL-safe to standard conversion
    const standardHash = id.replace(/-/g, '+').replace(/_/g, '/');
    result = analysisResults.get(standardHash);
    if (result) {
        return result;
    }

    // Try standard to URL-safe conversion
    const urlSafeHash = id.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    result = analysisResults.get(urlSafeHash);
    if (result) {
        return result;
    }

    return null;
}

export function getStoredFile(id: string) {
    const file = fileStorage.get(id);
    return file;
}

export function getAllAnalysisResults() {
    return Array.from(analysisResults.values());
}
