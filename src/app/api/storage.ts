interface AnalysisResult {
    id: string;
    createdAt: string;
    [key: string]: unknown;
}

declare global {
    var __analysisResults: Map<string, AnalysisResult> | undefined;
    var __fileStorage:
        | Map<string, { fileData: ArrayBuffer; fileName: string; mimeType: string }>
        | undefined;
}

if (!global.__analysisResults) {
    global.__analysisResults = new Map<string, AnalysisResult>();
}
if (!global.__fileStorage) {
    global.__fileStorage = new Map<
        string,
        { fileData: ArrayBuffer; fileName: string; mimeType: string }
    >();
}

export const analysisResults = global.__analysisResults;
export const fileStorage = global.__fileStorage;

export function storeAnalysisResult(id: string, data: Record<string, unknown>) {
    analysisResults.set(id, {
        ...data,
        id,
        createdAt: new Date().toISOString(),
    });
}

export function storeFile(id: string, fileData: ArrayBuffer, fileName: string, mimeType: string) {
    fileStorage.set(id, { fileData, fileName, mimeType });
}

export function getAnalysisResult(id: string) {
    let result = analysisResults.get(id);
    if (result) {
        return result;
    }

    const standardHash = id.replace(/-/g, '+').replace(/_/g, '/');
    result = analysisResults.get(standardHash);
    if (result) {
        return result;
    }

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
