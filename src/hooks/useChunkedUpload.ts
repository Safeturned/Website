import { useState, useCallback, useRef } from 'react';

export interface ChunkedUploadState {
    isUploading: boolean;
    progress: number;
    currentChunk: number;
    totalChunks: number;
    sessionId: string | null;
    error: string | null;
    speed: number;
    eta: number;
    status: string;
    isPreparing: boolean;
}

export interface ChunkedUploadOptions {
    chunkSize?: number;
    maxRetries?: number;
    onProgress?: (state: ChunkedUploadState) => void;
    onComplete?: (result: Record<string, unknown>) => void;
    onError?: (error: string) => void;
}

const DEFAULT_CHUNK_SIZE = 50 * 1024 * 1024;
const DEFAULT_MAX_RETRIES = 3;

// User-friendly messages
const MESSAGES = {
    PREPARING: 'Preparing file...',
    UPLOADING: 'Uploading...',
    PROCESSING: 'Processing...',
    COMPLETED: 'Upload completed',
    CANCELLED: 'Upload cancelled',
    ERROR: 'Upload failed',
} as const;

export function useChunkedUpload(options: ChunkedUploadOptions = {}) {
    const {
        chunkSize = DEFAULT_CHUNK_SIZE,
        maxRetries = DEFAULT_MAX_RETRIES,
        onProgress,
        onComplete,
        onError,
    } = options;

    const [state, setState] = useState<ChunkedUploadState>({
        isUploading: false,
        progress: 0,
        currentChunk: 0,
        totalChunks: 0,
        sessionId: null,
        error: null,
        speed: 0,
        eta: 0,
        status: '',
        isPreparing: false,
    });

    const startTimeRef = useRef<number>(0);
    const uploadedBytesRef = useRef<number>(0);
    const abortControllerRef = useRef<AbortController | null>(null);

    const computeFileHash = useCallback(async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const bytes = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode(...bytes));
        return base64;
    }, []);

    const computeChunkHash = useCallback(async (chunk: Blob): Promise<string> => {
        const arrayBuffer = await chunk.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const bytes = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode(...bytes));
        return base64;
    }, []);

    const updateProgress = useCallback(
        (
            uploadedBytes: number,
            totalBytes: number,
            currentChunk: number,
            totalChunks: number,
            status: string = MESSAGES.UPLOADING
        ) => {
            const progress = (uploadedBytes / totalBytes) * 100;
            const elapsed = Date.now() - startTimeRef.current;
            const speed = elapsed > 0 ? (uploadedBytes / elapsed) * 1000 : 0;
            const remainingBytes = totalBytes - uploadedBytes;
            const eta = speed > 0 ? remainingBytes / speed : 0;

            const newState: ChunkedUploadState = {
                isUploading: true,
                progress,
                currentChunk,
                totalChunks,
                sessionId: state.sessionId,
                error: null,
                speed,
                eta,
                status,
                isPreparing: false,
            };

            setState(newState);
            onProgress?.(newState);
        },
        [state.sessionId, onProgress]
    );

    const uploadChunk = useCallback(
        async (
            sessionId: string,
            chunkIndex: number,
            chunk: Blob,
            chunkHash: string,
            retryCount = 0
        ): Promise<boolean> => {
            try {
                const formData = new FormData();
                formData.append('sessionId', sessionId);
                formData.append('chunkIndex', chunkIndex.toString());
                formData.append('chunk', chunk);
                formData.append('chunkHash', chunkHash);

                const response = await fetch('/api/upload-chunked/chunk', {
                    method: 'POST',
                    body: formData,
                    signal: abortControllerRef.current?.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Upload failed: ${response.status}`);
                }

                return true;
            } catch (error) {
                if (retryCount < maxRetries) {
                    console.warn(
                        `Chunk ${chunkIndex} upload failed, retrying (${retryCount + 1}/${maxRetries})`,
                        error
                    );
                    await new Promise(resolve =>
                        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
                    );
                    return uploadChunk(sessionId, chunkIndex, chunk, chunkHash, retryCount + 1);
                }

                throw error;
            }
        },
        [maxRetries]
    );

    const initiateSession = useCallback(
        async (
            fileName: string,
            fileSizeBytes: number,
            fileHash: string,
            totalChunks: number,
            retryCount = 0
        ): Promise<string> => {
            try {
                const response = await fetch('/api/upload-chunked/initiate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileName,
                        fileSizeBytes,
                        fileHash,
                        totalChunks,
                    }),
                    signal: abortControllerRef.current?.signal,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to initiate upload session');
                }

                const { sessionId } = await response.json();
                return sessionId;
            } catch (error) {
                if (retryCount < maxRetries) {
                    console.warn(
                        `Session initiation failed, retrying (${retryCount + 1}/${maxRetries})`,
                        error
                    );
                    await new Promise(resolve =>
                        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
                    );
                    return initiateSession(
                        fileName,
                        fileSizeBytes,
                        fileHash,
                        totalChunks,
                        retryCount + 1
                    );
                }
                throw error;
            }
        },
        [maxRetries]
    );

    const uploadFile = useCallback(
        async (file: File) => {
            if (state.isUploading) {
                throw new Error('Upload already in progress');
            }

            setState(prev => ({
                ...prev,
                isUploading: true,
                progress: 0,
                currentChunk: 0,
                totalChunks: 0,
                sessionId: null,
                error: null,
                speed: 0,
                eta: 0,
                status: MESSAGES.PREPARING,
                isPreparing: true,
            }));

            startTimeRef.current = Date.now();
            uploadedBytesRef.current = 0;
            abortControllerRef.current = new AbortController();

            try {
                // Show preparing status
                setState(prev => ({ ...prev, status: MESSAGES.PREPARING, isPreparing: true }));

                const fileHash = await computeFileHash(file);
                const totalChunks = Math.ceil(file.size / chunkSize);

                // Update status to uploading
                setState(prev => ({ ...prev, status: MESSAGES.UPLOADING, isPreparing: false }));

                const sessionId = await initiateSession(
                    file.name,
                    file.size,
                    fileHash,
                    totalChunks
                );

                setState(prev => ({ ...prev, sessionId, totalChunks }));

                for (let i = 0; i < totalChunks; i++) {
                    if (abortControllerRef.current?.signal.aborted) {
                        throw new Error(MESSAGES.CANCELLED);
                    }

                    const start = i * chunkSize;
                    const end = Math.min(start + chunkSize, file.size);
                    const chunk = file.slice(start, end);
                    const chunkHash = await computeChunkHash(chunk);

                    await uploadChunk(sessionId, i, chunk, chunkHash);

                    uploadedBytesRef.current += chunk.size;
                    updateProgress(
                        uploadedBytesRef.current,
                        file.size,
                        i + 1,
                        totalChunks,
                        MESSAGES.UPLOADING
                    );
                }

                // Update status to processing
                setState(prev => ({ ...prev, status: MESSAGES.PROCESSING }));

                const completeResponse = await fetch('/api/upload-chunked/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                    signal: abortControllerRef.current.signal,
                });

                if (!completeResponse.ok) {
                    const errorData = await completeResponse.json();
                    throw new Error(errorData.error || 'Failed to complete upload');
                }

                const result = await completeResponse.json();

                setState(prev => ({
                    ...prev,
                    isUploading: false,
                    progress: 100,
                    error: null,
                    status: MESSAGES.COMPLETED,
                }));

                onComplete?.(result);
                return result;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : MESSAGES.ERROR;

                setState(prev => ({
                    ...prev,
                    isUploading: false,
                    error: errorMessage,
                    status: MESSAGES.ERROR,
                }));

                onError?.(errorMessage);
                throw error;
            }
        },
        [
            state.isUploading,
            chunkSize,
            computeFileHash,
            computeChunkHash,
            uploadChunk,
            updateProgress,
            onComplete,
            onError,
            initiateSession,
        ]
    );

    const cancelUpload = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null; // Clean up reference
        }

        setState(prev => ({
            ...prev,
            isUploading: false,
            error: MESSAGES.CANCELLED,
            status: MESSAGES.CANCELLED,
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            isUploading: false,
            progress: 0,
            currentChunk: 0,
            totalChunks: 0,
            sessionId: null,
            error: null,
            speed: 0,
            eta: 0,
            status: '',
            isPreparing: false,
        });
    }, []);

    return {
        ...state,
        uploadFile,
        cancelUpload,
        reset,
    };
}
