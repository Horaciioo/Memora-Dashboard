'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { apiGet, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { isVersionSeen, releaseSeenKey } from '@/declarations/changelog/versions'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Latest note state
 * @typedef {Object} FreshRelease
 * @property {ChangelogRelease | null} release - Latest readable note
 * @property {boolean} isFresh - Not read yet
 * @property {boolean} isNewVersion - Version never met, a new snapshot of it does not count
 * @property {() => void} markSeen - Store as read
 */

export interface FreshRelease {
  release: ChangelogRelease | null
  isFresh: boolean
  isNewVersion: boolean
  markSeen: () => void
}

/**
 * Latest unread note
 * @return {FreshRelease} - Note and handler
 */

export const useFreshRelease = (): FreshRelease => {
  const router = useRouter()
  const { session } = useAuthContext()
  const [seenNow, setSeenNow] = useState<string | null>(null)

  // Notes stay out of the shell
  const { data } = useQuery({
    queryKey: QUERY_KEYS.latestRelease,
    queryFn: ({ signal }) =>
      apiGet<{ release: ChangelogRelease | null }>(API_ROUTES.seenRelease, signal),
    enabled: Boolean(session),
    staleTime: Infinity,
  })
  const release = data?.release ?? null
  const seen = seenNow ?? session?.seenReleaseVersion ?? null
  const key = release ? releaseSeenKey(release) : null
  const isFresh = release !== null && seen !== key
  const isNewVersion = isFresh && release !== null && !isVersionSeen(seen, release)

  const markSeen = useCallback(() => {
    if (!key || seenNow === key) return

    // Hide at once
    setSeenNow(key)
    void apiPost(API_ROUTES.seenRelease, { version: key })
      .then(() => router.refresh())
      .catch(() => setSeenNow(null))
  }, [key, seenNow, router])

  return { release, isFresh, isNewVersion, markSeen }
}
