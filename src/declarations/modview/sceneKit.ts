import type { ModViewScene, SceneEvent, SceneStep } from '@/core/lib/modview/scene'
import type { ChatMessage, Chatter, ModAct, ModViewState } from '@/types/modview'
import { LivePlatforms } from '@/utils/constants/lives'

// Fixed clock so a scene reads the same every time
export const SCENE_START = '2026-10-03T20:00:00.000Z'

/**
 * Build one chatter
 * @param {string} login - Login
 * @param {Partial<Chatter>} [extra] - Badges, colour, name
 * @return {Chatter} - Chatter
 */

export const chatter = (login: string, extra: Partial<Chatter> = {}): Chatter => ({
  id: `scene-${login}`,
  login,
  name: login,
  colour: null,
  badges: [],
  ...extra,
})

/**
 * Build one chat line
 * @param {string} id - Stable line id
 * @param {Chatter} author - Who writes
 * @param {string} text - Line
 * @param {Partial<ChatMessage>} [extra] - First message, flags
 * @return {ChatMessage} - Message
 */

export const line = (
  id: string,
  author: Chatter,
  text: string,
  extra: Partial<ChatMessage> = {}
): ChatMessage => ({ id, author, text, sentAt: SCENE_START, ...extra })

/**
 * Build one moderation act
 * @param {string} id - Stable act id
 * @param {Omit<ModAct, 'id' | 'at'>} act - Act
 * @return {ModAct} - Act
 */

export const act = (id: string, act: Omit<ModAct, 'id' | 'at'>): ModAct => ({
  id,
  at: SCENE_START,
  ...act,
})

/**
 * Space beats evenly from a start
 * @param {number} start - First beat, milliseconds
 * @param {number} gap - Milliseconds between beats
 * @param {SceneEvent[]} events - Beats in order
 * @return {SceneStep[]} - Timed steps
 */

export const beats = (start: number, gap: number, events: SceneEvent[]): SceneStep[] =>
  events.map((event, index) => ({ at: start + index * gap, event }))

/**
 * Empty Twitch Mod View a scene starts from
 * @param {Partial<ModViewState>} [over] - Parts set by the scene
 * @return {ModViewState} - State
 */

export const twitchStage = (over: Partial<ModViewState> = {}): ModViewState => ({
  platform: LivePlatforms.Twitch,
  connection: 'scripted',
  channel: { name: 'Lumi', avatar: null, category: 'Just Chatting', categoryArt: null },
  title: 'Soirée discussion avec vous, on parle du prochain projet',
  embedUrl: null,
  messages: [],
  acts: [],
  held: [],
  unbanRequests: [],
  blockedTerms: [],
  allowedTerms: [],
  modes: { shield: false, subscribers: false, followers: false, emotes: false, slowSeconds: null },
  community: { broadcaster: [], moderators: [], vips: [], bots: [], viewers: [] },
  liveconLevel: 3,
  ...over,
})

/**
 * Build a scene
 * @param {ModViewState} initial - Starting state
 * @param {SceneStep[]} steps - Beats
 * @return {ModViewScene} - Scene
 */

export const scene = (initial: ModViewState, steps: SceneStep[]): ModViewScene => ({
  initial,
  steps,
})
