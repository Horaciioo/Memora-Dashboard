'use client'

import { createContext } from 'react'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import type { PlayFeedLine } from '@/composites/play/session/PlaySessionFeed'

/**
 * What a game feed hands to the chat box
 * @typedef {Object} PlayFeedSource
 */

export interface PlayFeedSource {
  feed: PlayFeedLine[]
  copy: Record<string, string>
  players: PlayFace[]
}

// Set by the chat box, feeds hand it their lines instead of drawing them
export const PlayFeedBridge = createContext<((source: PlayFeedSource) => void) | null>(null)
