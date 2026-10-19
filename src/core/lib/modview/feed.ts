import { applySceneEvent } from '@/core/lib/modview/scene'
import type { SceneEvent } from '@/core/lib/modview/scene'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { LivePlatformName } from '@/utils/constants/lives'
import type { ChatMessage, ModViewState } from '@/types/modview'

/**
 * One flush of a live's feed
 * @typedef {Object} FeedBatch
 * @property {number} seq - Flush number
 * @property {SceneEvent[]} events - Events in order
 */

export interface FeedBatch {
  seq: number
  events: SceneEvent[]
}

/**
 * Empty Mod View
 * @param {Object} input - Live basics
 * @param {LivePlatformName} input.platform - Platform
 * @param {string} input.name - Channel name
 * @param {string | null} input.avatar - Channel avatar
 * @param {string} input.title - Live title
 * @param {number | null} input.liveconLevel - Level in force
 * @return {ModViewState} - State
 */

export const blankModView = (input: {
  platform: LivePlatformName
  name: string
  avatar: string | null
  title: string
  liveconLevel: number | null
}): ModViewState => ({
  platform: input.platform,
  connection: 'connecting',
  channel: { name: input.name, avatar: input.avatar, category: null, categoryArt: null },
  title: input.title,
  embedUrl: null,
  messages: [],
  acts: [],
  held: [],
  unbanRequests: [],
  blockedTerms: [],
  allowedTerms: [],
  modes: { shield: false, subscribers: false, followers: false, emotes: false, slowSeconds: null },
  community: { broadcaster: [], moderators: [], vips: [], bots: [], viewers: [] },
  liveconLevel: input.liveconLevel,
})

/**
 * Drop chat lines a burst pushes off screen
 * @param {SceneEvent[]} events - Burst
 * @param {number} [kept] - Lines kept
 * @return {SceneEvent[]} - Burst shed
 */

export const shedChatBurst = (
  events: SceneEvent[],
  kept: number = LIVE_SETTINGS.roomMessages
): SceneEvent[] => {
  let surplus = events.filter((event) => event.kind === 'message').length - kept
  if (surplus <= 0) return events

  // Oldest lines go first
  return events.filter((event) => event.kind !== 'message' || surplus-- <= 0)
}

/**
 * Apply a burst in one pass
 * @param {ModViewState} view - Current state
 * @param {SceneEvent[]} events - Burst
 * @param {number} [maxMessages] - Chat lines kept
 * @return {ModViewState} - Next state
 */

export const applySceneBatch = (
  view: ModViewState,
  events: SceneEvent[],
  maxMessages: number = LIVE_SETTINGS.roomMessages
): ModViewState => {
  let current = view
  let lines: ChatMessage[] = []

  // Lines land together
  const settle = () => {
    if (!lines.length) return
    current = { ...current, messages: current.messages.concat(lines).slice(-maxMessages) }
    lines = []
  }

  for (const event of events) {
    if (event.kind === 'message') {
      lines.push(event.message)
      continue
    }
    settle()
    current = applySceneEvent({ view: current, spotlight: null }, event, maxMessages).view
  }
  settle()

  return current
}

/**
 * Events of the batches past a flush
 * @param {FeedBatch[]} batches - Batches received
 * @param {number} afterSeq - Last flush applied
 * @return {{ events: SceneEvent[], seq: number }} - Events and flush reached
 */

export const freshEvents = (
  batches: FeedBatch[],
  afterSeq: number
): { events: SceneEvent[]; seq: number } => {
  const fresh = batches.filter((batch) => batch.seq > afterSeq)

  return {
    events: fresh.flatMap((batch) => batch.events),
    seq: fresh.reduce((reached, batch) => Math.max(reached, batch.seq), afterSeq),
  }
}
