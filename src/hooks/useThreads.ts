'use client';

import { useQuery } from '@tanstack/react-query';
import { getThreads, getFeaturedThreads, getThread } from '@/lib/firebase/threads';
import type { ThreadCategory } from '@/types';

/**
 * Hook to fetch threads list with optional filtering
 * @param options - Filter options for category and limit
 * @returns Query result with threads data
 */
export function useThreads(options?: {
  category?: ThreadCategory;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['threads', options],
    queryFn: () => getThreads(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch featured threads for homepage display
 * @param count - Number of featured threads to fetch (default: 4)
 * @returns Query result with featured threads data
 */
export function useFeaturedThreads(count = 4) {
  return useQuery({
    queryKey: ['threads', 'featured', count],
    queryFn: () => getFeaturedThreads(count),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single thread by ID
 * @param id - Thread document ID
 * @returns Query result with thread data
 */
export function useThread(id: string) {
  return useQuery({
    queryKey: ['thread', id],
    queryFn: () => getThread(id),
    enabled: !!id,
  });
}
