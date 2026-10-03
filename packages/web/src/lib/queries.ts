import { QueryClient, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { get } from './api';
import type { Catalog } from './types';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 20_000, retry: (n, e) => n < 2 && (e as { status?: number }).status !== 403 && (e as { status?: number }).status !== 404, refetchOnWindowFocus: true },
  },
});

export function useApi<T>(path: string | null, opts?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>) {
  return useQuery<T>({ queryKey: [path], queryFn: () => get<T>(path as string), enabled: path !== null, ...opts });
}
export const useCatalog = () => useApi<Catalog>('/catalog', { staleTime: 5 * 60_000 });
export const invalidate = (...prefixes: string[]) =>
  queryClient.invalidateQueries({ predicate: (q) => prefixes.some((p) => String(q.queryKey[0] ?? '').startsWith(p)) });
