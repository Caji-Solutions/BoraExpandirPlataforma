/**
 * Centralized API client for all HTTP requests
 * Handles base URL, authentication, error handling, etc.
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface RequestOptions extends RequestInit {
  skipErrorHandling?: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const { skipErrorHandling = false, ...fetchOptions } = options;

    // ✅ Adicionar token de autenticação automaticamente
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Se tem token e não é FormData, adicionar Authorization
    if (token && !(fetchOptions.body instanceof FormData)) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (token && fetchOptions.body instanceof FormData) {
      // Para FormData, adicionar Authorization sem Content-Type (navegador define)
      delete headers['Content-Type'];
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || errorData.error || `HTTP ${response.status}`;

        // ✅ Tratar erros de autenticação
        if (response.status === 401) {
          // Token expirado ou inválido
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            // Redirecionar para login se estamos em navegador
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
          throw new Error('Token expirado. Por favor, faça login novamente.');
        }

        if (response.status === 403) {
          throw new Error('Você não tem permissão para acessar este recurso.');
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (!skipErrorHandling) {
        console.error(`API Error [${endpoint}]:`, error);
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing/extension
export { ApiClient };
