'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { TrashedPage } from '@/types/pages'

/**
 * Pages in the trash the member may restore
 * @param {TrashedPage[]} initial - Server rendered list
 * @return {TrashedPage[]} - Trash
 */

export const usePageTrash = (initial: TrashedPage[]): TrashedPage[] => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.pageTrash,
    queryFn: ({ signal }) => apiGet<TrashedPage[]>(API_ROUTES.pageTrash, signal),
    initialData: initial,
  })

  return data
}
