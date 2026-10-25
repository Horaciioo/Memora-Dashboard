'use client'

import { useSignalRefresh } from '@/core/hooks/interaction/state/useSignalRefresh'
import { PLAY_STREAM_EVENTS } from '@/declarations/play/topics'

/**
 * Refresh the page on each Play change
 * @param {Object} props - Stream
 * @param {string} props.url - Stream route
 * @return {null}
 */

export const PlaySignal = ({ url }: { url: string }) => {
  useSignalRefresh(url, PLAY_STREAM_EVENTS.changed)

  return null
}
