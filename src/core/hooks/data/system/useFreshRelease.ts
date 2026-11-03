'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { changelogFor, isVersionSeen, releaseSeenKey } from '@/declarations/changelog/helpers'
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
  const { session, can, isResponsable } = useAuthContext()
  const [seenNow, setSeenNow] = useState<string | null>(null)

  const release = session ? (changelogFor({ can, isResponsable })[0] ?? null) : null
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
