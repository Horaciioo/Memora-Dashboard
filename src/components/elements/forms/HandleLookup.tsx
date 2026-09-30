'use client'

import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/core/hooks/interaction/useDebouncedValue'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { SEARCH_SETTINGS } from '@/declarations/configurations/settings'
import { HANDLE_LOOKUP_COPY } from '@/declarations/members/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HANDLE_LOOKUP_STYLES } from '@/declarations/ui/variants'
import type { HandleVerdict } from '@/types/social'
import { cn } from '@/utils/classnames'

export interface HandleLookupProps {
  network: string
  handle: string
}

// Glyph and tone per verdict
const VERDICT_LOOK = {
  found: { icon: ICONS.success, tone: HANDLE_LOOKUP_STYLES.found },
  missing: { icon: ICONS.failure, tone: HANDLE_LOOKUP_STYLES.missing },
  unknown: { icon: ICONS.help, tone: HANDLE_LOOKUP_STYLES.unknown },
} as const

/**
 * Whether a typed handle exists on its network
 * @param {string} network - Network identifier
 * @param {string} handle - Typed handle
 * @return {JSX.Element | null}
 */

export const HandleLookup = ({ network, handle }: HandleLookupProps) => {
  const settled = useDebouncedValue(handle.trim(), SEARCH_SETTINGS.debounceMs)
  const [result, setResult] = useState<{ key: string; verdict: HandleVerdict } | null>(null)
  const key = `${network}:${settled}`

  useEffect(() => {
    if (!settled) return

    // Stale answers are dropped
    const controller = new AbortController()
    apiGet<{ verdict: HandleVerdict }>(API_ROUTES.handleLookup(network, settled), controller.signal)
      .then((answer) => setResult({ key, verdict: answer.verdict }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, verdict: 'unknown' })
      })

    return () => controller.abort()
  }, [network, settled, key])

  if (!handle.trim()) return null

  // Typing or waiting on the answer
  if (settled !== handle.trim() || result?.key !== key) {
    return (
      <p className={cn(HANDLE_LOOKUP_STYLES.line, HANDLE_LOOKUP_STYLES.unknown)} aria-live="polite">
        {HANDLE_LOOKUP_COPY.checking}
      </p>
    )
  }

  const look = VERDICT_LOOK[result.verdict]
  const Icon = look.icon

  return (
    <p className={cn(HANDLE_LOOKUP_STYLES.line, look.tone)} aria-live="polite">
      <Icon className={HANDLE_LOOKUP_STYLES.icon} aria-hidden="true" />
      {HANDLE_LOOKUP_COPY[result.verdict]}
    </p>
  )
}
