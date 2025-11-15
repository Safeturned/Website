const API_VERSION = 'v1.0';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${API_VERSION}/${cleanEndpoint}`;
}

export function getApiBaseUrl(): string {
    return API_BASE_URL;
}

function getDefaultHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

export async function apiRequest<T = unknown>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        body?: unknown;
        token?: string;
        headers?: HeadersInit;
        signal?: AbortSignal;
    } = {}
): Promise<T> {
    const { method = 'GET', body, token, headers: customHeaders = {}, signal } = options;

    const url = getApiUrl(endpoint);
    const headers: Record<string, string> = {
        ...getDefaultHeaders(token),
        ...(customHeaders as Record<string, string>),
    };

    if (body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const fetchOptions: RequestInit = {
        method,
        headers,
        credentials: 'include',
        signal,
    };

    if (body) {
        if (body instanceof FormData) {
            fetchOptions.body = body;
        } else {
            fetchOptions.body = JSON.stringify(body);
        }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const errorText = await response.text();
        let errorData: { error?: string; [key: string]: unknown };
        try {
            errorData = JSON.parse(errorText) as { error?: string; [key: string]: unknown };
        } catch {
            errorData = { error: errorText || `Request failed: ${response.status}` };
        }

        throw new ApiError(
            errorData.error || `Request failed: ${response.status}`,
            response.status,
            errorData
        );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }

    return null as T;
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: { error?: string; [key: string]: unknown }
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const api = {
    get: <T = unknown>(endpoint: string, options?: { token?: string; signal?: AbortSignal }) =>
        apiRequest<T>(endpoint, { method: 'GET', ...options }),

    post: <T = unknown>(
        endpoint: string,
        body?: unknown,
        options?: { token?: string; headers?: HeadersInit; signal?: AbortSignal }
    ) => apiRequest<T>(endpoint, { method: 'POST', body, ...options }),

    put: <T = unknown>(
        endpoint: string,
        body?: unknown,
        options?: { token?: string; headers?: HeadersInit; signal?: AbortSignal }
    ) => apiRequest<T>(endpoint, { method: 'PUT', body, ...options }),

    delete: <T = unknown>(endpoint: string, options?: { token?: string; signal?: AbortSignal }) =>
        apiRequest<T>(endpoint, { method: 'DELETE', ...options }),

    patch: <T = unknown>(
        endpoint: string,
        body?: unknown,
        options?: { token?: string; headers?: HeadersInit; signal?: AbortSignal }
    ) => apiRequest<T>(endpoint, { method: 'PATCH', body, ...options }),
};
