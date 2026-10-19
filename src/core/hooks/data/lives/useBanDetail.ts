'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { BanDetail } from '@/types/modview'

/**
 * Account and ban of a viewer who asked to be unbanned
 * @param {string | null} liveId - Live, none off a real live
 * @param {string | null} chatterId - Viewer, none while nobody is picked
 * @return {{ detail: BanDetail | null }} - Detail, null while loading
 */

export const useBanDetail = (liveId: string | null, chatterId: string | null) => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.liveBan(liveId ?? '', chatterId ?? ''),
    queryFn: ({ signal }) =>
      apiGet<BanDetail>(API_ROUTES.liveBan(liveId ?? '', chatterId ?? ''), signal),
    enabled: liveId !== null && chatterId !== null,
    retry: false,
  })

  return { detail: data ?? null }
}
