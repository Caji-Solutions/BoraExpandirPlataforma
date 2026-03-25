/**
 * Hook para fazer requisições HTTP autenticadas
 * Usa o apiClient centralizado que injeta automaticamente o Bearer token
 */

import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  get: (endpoint: string, options?: UseApiOptions<T>) => Promise<T>;
  post: (endpoint: string, body?: any, options?: UseApiOptions<T>) => Promise<T>;
  patch: (endpoint: string, body?: any, options?: UseApiOptions<T>) => Promise<T>;
  put: (endpoint: string, body?: any, options?: UseApiOptions<T>) => Promise<T>;
  delete: (endpoint: string, options?: UseApiOptions<T>) => Promise<T>;
}

/**
 * Hook reutilizável para requisições autenticadas
 *
 * @example
 * const { data, loading, error, get } = useApi<ClientDocument[]>();
 *
 * useEffect(() => {
 *   get(`/cliente/${clienteId}/documentos`)
 *     .then(docs => console.log(docs))
 *     .catch(err => console.error(err));
 * }, [clienteId]);
 */
export function useApi<T = any>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleRequest = useCallback(
    async (
      method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
      endpoint: string,
      body?: any,
      options?: UseApiOptions<T>
    ): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        let result: T;

        switch (method) {
          case 'GET':
            result = await apiClient.get<T>(endpoint);
            break;
          case 'POST':
            result = await apiClient.post<T>(endpoint, body);
            break;
          case 'PATCH':
            result = await apiClient.patch<T>(endpoint, body);
            break;
          case 'PUT':
            result = await apiClient.put<T>(endpoint, body);
            break;
          case 'DELETE':
            result = await apiClient.delete<T>(endpoint);
            break;
        }

        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    get: (endpoint, options) => handleRequest('GET', endpoint, undefined, options),
    post: (endpoint, body, options) => handleRequest('POST', endpoint, body, options),
    patch: (endpoint, body, options) => handleRequest('PATCH', endpoint, body, options),
    put: (endpoint, body, options) => handleRequest('PUT', endpoint, body, options),
    delete: (endpoint, options) => handleRequest('DELETE', endpoint, undefined, options),
  };
}
