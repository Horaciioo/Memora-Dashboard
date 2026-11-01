'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { draftOutcome, keepDraft, readOfflinePage, rememberPage } from '@/core/lib/pages/offline/store'
import type { PageDetail, PageDocument } from '@/types/pages'

/**
 * Draft found when the page opened
 * @typedef {Object} DraftOpening
 * @property {boolean} isReady - Device checked
 * @property {PageDocument | null} resumed - Draft on the same base, picked up
 * @property {PageDocument | null} diverged - Draft on an older base
 */

export interface DraftOpening {
  isReady: boolean
  resumed: PageDocument | null
  diverged: PageDocument | null
}

/**
 * Device copy and unsent draft of a page
 * @param {PageDetail} page - Page opened
 * @param {string} accountId - Signed-in account
 * @param {(opening: DraftOpening) => void} onOpen - Told once the device was checked
 * @return {{ opening: DraftOpening, keep: (content: PageDocument, baseVersion: number) => void, settle: (content: PageDocument, version: number) => void }} - Draft gestures
 */

export const usePageDraft = (page: PageDetail, accountId: string, onOpen: (opening: DraftOpening) => void) => {
  const [opening, setOpening] = useState<DraftOpening>({ isReady: false, resumed: null, diverged: null })
  const pageRef = useRef(page)
  // Device writes in order, a late clear never erases a newer draft
  const queue = useRef<Promise<void>>(Promise.resolve())
  const enqueue = useCallback((write: () => Promise<void>) => {
    queue.current = queue.current.then(write, write)
  }, [])

  // Draft check, then the copy for offline reading
  useEffect(() => {
    let isLive = true

    void readOfflinePage(accountId, page.id).then(async (entry) => {
      const outcome = draftOutcome(entry?.draft ?? null, page.version)
      await rememberPage(accountId, page)
      if (!isLive) return

      const opened = {
        isReady: true,
        resumed: outcome === 'resume' ? (entry?.draft?.content ?? null) : null,
        diverged: outcome === 'conflict' ? (entry?.draft?.content ?? null) : null,
      }
      setOpening(opened)
      onOpen(opened)
    })

    return () => {
      isLive = false
    }
  }, [accountId, page, onOpen])

  const keep = useCallback(
    (content: PageDocument, baseVersion: number) => {
      enqueue(() => keepDraft(accountId, pageRef.current, { content, baseVersion, updatedAt: new Date().toISOString() }))
    },
    [accountId, enqueue]
  )

  // Sent: the copy becomes the new truth
  const settle = useCallback(
    (content: PageDocument, version: number) => {
      pageRef.current = { ...pageRef.current, content, version }
      enqueue(() => rememberPage(accountId, pageRef.current).then(() => keepDraft(accountId, pageRef.current, null)))
    },
    [accountId, enqueue]
  )

  return { opening, keep, settle }
}
