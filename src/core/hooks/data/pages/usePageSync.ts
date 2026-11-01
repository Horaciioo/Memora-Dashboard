'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { usePageDraft } from '@/core/hooks/data/pages/usePageDraft'
import type { DraftOpening } from '@/core/hooks/data/pages/usePageDraft'
import { ApiClientError, apiGet, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { PAGE_SETTINGS } from '@/declarations/configurations/pages'
import type { PageDetail, PageDocument, PageSaveResult } from '@/types/pages'
import { ErrorCodes } from '@/utils/constants/errors'

/**
 * Where the edits stand
 * @type {'saved' | 'pending' | 'saving' | 'offline' | 'failed' | 'conflict'}
 */

export type SyncStatus = 'saved' | 'pending' | 'saving' | 'offline' | 'failed' | 'conflict'

/**
 * Two versions to choose from
 * @typedef {Object} SyncConflict
 * @property {PageDocument} mine - Local edit
 * @property {PageDetail} theirs - Server copy
 * @property {boolean} isMineShown - The editor already holds mine
 */

export interface SyncConflict {
  mine: PageDocument
  theirs: PageDetail
  isMineShown: boolean
}

/**
 * Status a failed save leads to
 * @param {unknown} error - Failure
 * @return {SyncStatus} - Status
 */

const statusOf = (error: unknown): SyncStatus => {
  if (error instanceof ApiClientError && error.code === ErrorCodes.ResourceConflict) return 'conflict'
  if (!navigator.onLine || error instanceof TypeError) return 'offline'

  return error instanceof ApiClientError && error.code === ErrorCodes.TimedOut ? 'offline' : 'failed'
}

/**
 * Debounced autosave with device drafts and explicit conflicts
 * @param {PageDetail} page - Page opened
 * @param {string} accountId - Signed-in account
 * @param {(content: PageDocument) => void} replace - Puts a document in the editor
 * @return {Object} - Sync state and gestures
 */

export const usePageSync = (page: PageDetail, accountId: string, replace: (content: PageDocument) => void) => {
  // Draft outcome lands once the device answered
  const openRef = useRef<(opening: DraftOpening) => void>(() => undefined)
  const onOpen = useCallback((opening: DraftOpening) => openRef.current(opening), [])
  const { opening, keep, settle } = usePageDraft(page, accountId, onOpen)
  const [status, setStatus] = useState<SyncStatus>('saved')
  const [conflict, setConflict] = useState<SyncConflict | null>(null)
  const [contentAt, setContentAt] = useState(page.contentAt)
  const version = useRef(page.version)
  const latest = useRef<PageDocument | null>(null)
  const busy = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const firstEditAt = useRef<number | null>(null)
  const flushRef = useRef<() => Promise<void>>(async () => undefined)

  const flush = useCallback(async (): Promise<void> => {
    clearTimeout(timer.current)
    const content = latest.current
    if (!content || busy.current) return
    if (!navigator.onLine) return setStatus('offline')

    busy.current = true
    latest.current = null
    firstEditAt.current = null
    setStatus('saving')

    try {
      const saved = await apiPut<PageSaveResult>(API_ROUTES.pageContent(page.id), { content, baseVersion: version.current })
      version.current = saved.version
      setContentAt(saved.contentAt)
      // Typed meanwhile, next round once this one closes
      if (latest.current) {
        timer.current = setTimeout(() => void flushRef.current(), 0)
        return
      }

      settle(content, saved.version)
      setStatus('saved')
    } catch (error) {
      latest.current ??= content
      const next = statusOf(error)
      setStatus(next)
      // The server copy is fetched for the choice
      if (next === 'conflict') {
        const theirs = await apiGet<PageDetail>(API_ROUTES.page(page.id)).catch(() => null)
        if (theirs) setConflict({ mine: latest.current, theirs, isMineShown: true })
      }
    } finally {
      busy.current = false
    }
  }, [page.id, settle])

  const change = useCallback(
    (content: PageDocument) => {
      latest.current = content
      keep(content, version.current)
      if (conflict) return

      setStatus('pending')
      firstEditAt.current ??= Date.now()
      clearTimeout(timer.current)
      // Pauses save, long typing saves anyway
      const waited = Date.now() - firstEditAt.current
      timer.current = setTimeout(() => void flush(), Math.max(0, Math.min(PAGE_SETTINGS.autosaveMs, PAGE_SETTINGS.autosaveMaxWaitMs - waited)))
    },
    [conflict, flush, keep]
  )

  useEffect(() => {
    flushRef.current = flush
    openRef.current = (found) => {
      if (found.resumed) change(found.resumed)
      if (!found.diverged) return
      latest.current = found.diverged
      setConflict({ mine: found.diverged, theirs: page, isMineShown: false })
      setStatus('conflict')
    }
  }, [change, flush, page])

  // Back online, leaving the page
  useEffect(() => {
    const resume = () => void flush()
    window.addEventListener('online', resume)

    return () => {
      window.removeEventListener('online', resume)
      void flush()
    }
  }, [flush])

  const keepMine = useCallback(() => {
    if (!conflict) return
    version.current = conflict.theirs.version
    latest.current ??= conflict.mine
    if (!conflict.isMineShown) replace(conflict.mine)
    setConflict(null)
    void flush()
  }, [conflict, flush, replace])

  const keepTheirs = useCallback(() => {
    if (!conflict) return
    version.current = conflict.theirs.version
    latest.current = null
    replace(conflict.theirs.content)
    settle(conflict.theirs.content, conflict.theirs.version)
    setConflict(null)
    setStatus('saved')
  }, [conflict, replace, settle])

  return { opening, status, conflict, contentAt, change, retry: flush, keepMine, keepTheirs }
}
