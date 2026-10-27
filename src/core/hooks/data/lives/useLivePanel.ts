'use client'

import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { SanctionPanelView } from '@/types/sanctions'

/**
 * Sanctions panel of a live, reread while it runs so an edit reaches the suggestions
 * @param {SanctionPanelView | null} initial - Panel resolved server-side
 * @return {SanctionPanelView | null} - Latest panel
 */

export const useLivePanel = (initial: SanctionPanelView | null): SanctionPanelView | null => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.livePanel(
      initial?.youtuberId ?? '',
      initial?.panel ?? '',
      initial?.levelId ?? null
    ),
    queryFn: ({ signal }) =>
      apiGet<SanctionPanelView>(
        API_ROUTES.sanctions(initial?.youtuberId ?? '', initial?.panel ?? '', initial?.levelId),
        signal
      ),
    initialData: initial ?? undefined,
    enabled: initial !== null,
    refetchInterval: LIVE_SETTINGS.focusPollSeconds * 1000,
  })

  return data ?? initial
}
