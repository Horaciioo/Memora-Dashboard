'use client'

import { usePlayRefresh } from '@/core/hooks/data/play/usePlayRefresh'

/**
 * Refresh the page on each Play change
 * @param {Object} props - Topic
 * @param {string} props.topic - Play topic
 * @return {null}
 */

export const PlaySignal = ({ topic }: { topic: string }) => {
  usePlayRefresh(topic)

  return null
}
