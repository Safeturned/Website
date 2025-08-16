// Shared in-memory storage for analysis results
// In production, this should be replaced with a proper database
export const analysisResults = new Map<string, any>();

export function storeAnalysisResult(id: string, data: any) {
    analysisResults.set(id, {
        ...data,
        id,
        createdAt: new Date().toISOString()
    });
}

export function getAnalysisResult(id: string) {
    const result = analysisResults.get(id);
    return result;
}

export function getAllAnalysisResults() {
    return Array.from(analysisResults.values());
}
