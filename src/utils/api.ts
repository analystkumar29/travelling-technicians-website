import { safeJsonParse } from './errorHandling';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Safely fetch data from an API endpoint
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    // Handle HTTP errors
    if (!response.ok) {
      return {
        data: null,
        error: `HTTP error! Status: ${response.status}`,
        status: response.status,
      };
    }

    // Safely parse JSON
    const text = await response.text();
    const data = safeJsonParse<T>(text, null as unknown as T);
    
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    // Network errors or other exceptions
    console.error('API Error:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 0, // 0 indicates a network error or other non-HTTP issue
    };
  }
}

/**
 * POST data to an API endpoint
 */
export async function postApi<T, D = any>(
  endpoint: string,
  data: D,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * PUT data to an API endpoint
 */
export async function putApi<T, D = any>(
  endpoint: string,
  data: D,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * DELETE data from an API endpoint
 */
export async function deleteApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    method: 'DELETE',
    ...options,
  });
} 