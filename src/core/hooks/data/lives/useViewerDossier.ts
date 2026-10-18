'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { ViewerSanction } from '@/types/lives'

/**
 * Past sanctions of a viewer on the creator's channel
 * @param {string | null} liveId - Live, none off a real live
 * @param {string} chatterId - Viewer
 * @return {{ history: ViewerSanction[] | null }} - History, null while loading
 */

export const useViewerDossier = (liveId: string | null, chatterId: string) => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.liveViewer(liveId ?? '', chatterId),
    queryFn: ({ signal }) =>
      apiGet<ViewerSanction[]>(API_ROUTES.liveViewer(liveId ?? '', chatterId), signal),
    enabled: liveId !== null,
  })

  return { history: data ?? null }
}
