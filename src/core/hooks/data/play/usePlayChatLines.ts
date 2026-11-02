'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { listenRealtime } from '@/core/lib/realtime/socket'
import { PLAY_CHAT } from '@/declarations/play/chat'
import { PLAY_STREAM_EVENTS, PLAY_TOPICS } from '@/declarations/play/topics'
import type { PlayMessageView } from '@/types/play'

/**
 * Lines of the page and the pushed ones, once each, oldest first
 * @param {PlayMessageView[]} rendered - Lines of the page render
 * @param {PlayMessageView[]} pushed - Lines heard since
 * @return {PlayMessageView[]} - Lines
 */

const mergeLines = (rendered: PlayMessageView[], pushed: PlayMessageView[]): PlayMessageView[] => {
  const known = new Set(rendered.map((line) => line.id))
  const fresh = pushed.filter((line) => !known.has(line.id))
  if (!fresh.length) return rendered

  return [...rendered, ...fresh]
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .slice(-PLAY_CHAT.history)
}

/**
 * Chat lines of a game, each new one pushed by the socket
 * @param {string} sessionId - Game
 * @param {PlayMessageView[]} rendered - Lines of the page render
 * @return {{ lines: PlayMessageView[], add: (line: PlayMessageView) => void }} - Lines and a local add
 */

export const usePlayChatLines = (sessionId: string, rendered: PlayMessageView[]) => {
  const [pushed, setPushed] = useState<PlayMessageView[]>([])
  const add = useCallback(
    (line: PlayMessageView) => setPushed((lines) =>
        lines.some((entry) => entry.id === line.id)
          ? lines
          : [...lines, line].slice(-PLAY_CHAT.history)),
    []
  )

  useEffect(
    () =>
      listenRealtime(PLAY_TOPICS.session(sessionId), (event, data) => {
        const line = (data as { message?: PlayMessageView } | null)?.message
        if (event === PLAY_STREAM_EVENTS.chat && line) add(line)
      }),
    [sessionId, add]
  )

  return { lines: useMemo(() => mergeLines(rendered, pushed), [rendered, pushed]), add }
}
