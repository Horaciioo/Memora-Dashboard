'use client'

import { startTransition, useCallback, useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { applySceneBatch, freshEvents } from '@/core/lib/modview/feed'
import type { FeedBatch } from '@/core/lib/modview/feed'
import { LIVE_STREAM_EVENTS } from '@/declarations/lives/topics'
import type { ModViewConnection, ModViewState } from '@/types/modview'

// Batches a hidden tab holds before settling
const HIDDEN_QUEUE = 20

/**
 * Snapshot of the Mod View route
 * @typedef {Object} FeedSnapshot
 */

interface FeedSnapshot {
  state: ModViewState
  channelLogin: string | null
  feedSeq: number
}

// Feed buffer between renders
interface FeedCursor {
  seq: number
  queue: FeedBatch[]
  replay: FeedBatch[] | null
  frame: number | null
}

/**
 * Live feed of a Mod View
 * @param {string} liveId - Live
 * @param {Dispatch<SetStateAction<ModViewState>>} setState - State setter
 * @param {(snapshot: FeedSnapshot) => ModViewState} shape - Snapshot to state
 * @return {void}
 */

export const useLiveFeed = (
  liveId: string,
  setState: Dispatch<SetStateAction<ModViewState>>,
  shape: (snapshot: FeedSnapshot) => ModViewState
): void => {
  const cursor = useRef<FeedCursor>({ seq: 0, queue: [], replay: null, frame: null })

  // Batches heard meanwhile join the snapshot
  const load = useCallback(() => {
    cursor.current.replay = []

    return apiGet<FeedSnapshot>(API_ROUTES.liveModView(liveId))
      .then((snapshot) => {
        const caught = freshEvents(cursor.current.replay ?? [], snapshot.feedSeq)
        cursor.current.seq = caught.seq
        setState(applySceneBatch(shape(snapshot), caught.events))
      })
      .catch(() => null)
      .finally(() => {
        cursor.current.replay = null
      })
  }, [liveId, setState, shape])

  // One render per frame
  const flush = useCallback(() => {
    const feed = cursor.current
    if (feed.frame !== null) cancelAnimationFrame(feed.frame)
    feed.frame = null

    const caught = freshEvents(feed.queue, feed.seq)
    feed.queue = []
    feed.seq = caught.seq
    if (!caught.events.length) return

    startTransition(() => setState((current) => applySceneBatch(current, caught.events)))
  }, [setState])

  useEffect(() => {
    void load()
    const source = new EventSource(API_ROUTES.liveFeed(liveId))
    const feed = cursor.current

    source.addEventListener(LIVE_STREAM_EVENTS.batch, (message) => {
      const batch = JSON.parse((message as MessageEvent<string>).data) as FeedBatch
      feed.replay?.push(batch)
      feed.queue.push(batch)
      feed.frame ??= requestAnimationFrame(flush)
      // A hidden tab still settles
      if (feed.queue.length > HIDDEN_QUEUE) flush()
    })
    source.addEventListener(LIVE_STREAM_EVENTS.connection, (message) => {
      const link = JSON.parse((message as MessageEvent<string>).data) as {
        state: ModViewConnection
        notice: string | null
      }
      setState((current) => ({
        ...current,
        connection: link.state,
        // A read-only seat keeps its own reason
        notice: current.readOnly ? current.notice : link.notice,
      }))
    })
    // A reopening after a cut reads the snapshot again to catch up
    let opened = false
    source.addEventListener('open', () => {
      if (opened) void load()
      opened = true
    })

    return () => {
      source.close()
      if (feed.frame !== null) cancelAnimationFrame(feed.frame)
      feed.frame = null
    }
  }, [liveId, load, flush, setState])
}
