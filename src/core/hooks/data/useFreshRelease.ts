'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { changelogFor } from '@/declarations/changelog/helpers'
import type { ChangelogRelease } from '@/declarations/changelog/releases'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * Latest note state
 * @typedef {Object} FreshRelease
 * @property {ChangelogRelease | null} release - Latest readable note
 * @property {boolean} isFresh - Not read yet
 * @property {() => void} markSeen - Store as read
 */

export interface FreshRelease {
  release: ChangelogRelease | null
  isFresh: boolean
  markSeen: () => void
}

/**
 * Latest unread note
 * @return {FreshRelease} - Note and handler
 */

export const useFreshRelease = (): FreshRelease => {
  const router = useRouter()
  const { session, can } = useAuthContext()
  const [seenNow, setSeenNow] = useState<string | null>(null)

  const release = session ? (changelogFor(can)[0] ?? null) : null
  const seen = seenNow ?? session?.seenReleaseVersion ?? null
  const isFresh = release !== null && seen !== release.version

  const markSeen = useCallback(() => {
    if (!release || seenNow === release.version) return

    // Hide at once
    setSeenNow(release.version)
    void apiPost(API_ROUTES.seenRelease, { version: release.version })
      .then(() => router.refresh())
      .catch(() => setSeenNow(null))
  }, [release, seenNow, router])

  return { release, isFresh, markSeen }
}
