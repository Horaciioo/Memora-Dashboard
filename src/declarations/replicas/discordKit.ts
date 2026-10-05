import type {
  DiscordAuthor,
  DiscordReplicaMessage,
  DiscordReplicaState,
  DiscordSceneEvent,
  DiscordSceneStep,
} from '@/types/replicas'

// Typing speed of the composer
const DRAFT_MS_PER_CHAR = 32

// Floor of a typed line
const DRAFT_MIN_MS = 700

/**
 * One beat waiting after the previous one
 * @typedef {[number, DiscordSceneEvent]} Beat
 */

export type Beat = [wait: number, event: DiscordSceneEvent]

/**
 * Build one author
 * @param {string} id - Stable identifier
 * @param {Partial<DiscordAuthor>} [extra] - Name
 * @return {DiscordAuthor} - Author
 */

export const author = (id: string, extra: Partial<DiscordAuthor> = {}): DiscordAuthor => ({
  id,
  name: id,
  colour: null,
  ...extra,
})

/**
 * Lay beats on a clock
 * @param {Beat[]} beats - Beats in order
 * @param {number} [start] - First beat offset
 * @return {DiscordSceneStep[]} - Timed steps
 */

export const timeline = (beats: Beat[], start: number = 0): DiscordSceneStep[] => {
  let at = start

  return beats.map(([wait, event]) => {
    at += wait

    return { at, event }
  })
}

/**
 * Someone types then posts
 * @param {DiscordReplicaMessage} message - Message posted
 * @param {Object} [options] - Timing
 * @param {number} [options.before] - Pause before typing
 * @param {number} [options.typing] - Typing length
 * @return {Beat[]} - Beats
 */

export const say = (
  message: DiscordReplicaMessage,
  { before = 900, typing = 1600 }: { before?: number; typing?: number } = {}
): Beat[] => [
  [before, { kind: 'typing', author: message.author, on: true }],
  [typing, { kind: 'message', message }],
]

/**
 * The learner's seat types in the composer
 * @param {DiscordReplicaMessage} message - Message sent
 * @param {number} [before] - Pause before typing
 * @return {Beat[]} - Beats
 */

export const write = (message: DiscordReplicaMessage, before: number = 900): Beat[] => [
  [before, { kind: 'draft', text: message.content ?? '' }],
  [
    Math.max(DRAFT_MIN_MS, (message.content ?? '').length * DRAFT_MS_PER_CHAR + 500),
    { kind: 'message', message },
  ],
]

/**
 * Light a step of the support guide
 * @param {number | null} step - Step index
 * @param {number} [before] - Pause before
 * @return {Beat} - Beat
 */

export const guide = (step: number | null, before: number = 0): Beat => [
  before,
  { kind: 'guide', step },
]

/**
 * Build one message
 * @param {string} id - Stable identifier
 * @param {DiscordAuthor} by - Author
 * @param {string} time - Clock shown
 * @param {string} [content] - Text
 * @param {Partial<DiscordReplicaMessage>} [extra] - Embeds
 * @return {DiscordReplicaMessage} - Message
 */

export const message = (
  id: string,
  by: DiscordAuthor,
  time: string,
  content?: string,
  extra: Partial<DiscordReplicaMessage> = {}
): DiscordReplicaMessage => ({ id, author: by, time, content, ...extra })

/**
 * Empty server a ticket scene starts from
 * @param {Partial<DiscordReplicaState>} [over] - Parts set by the scene
 * @return {DiscordReplicaState} - State
 */

export const discordStage = (over: Partial<DiscordReplicaState> = {}): DiscordReplicaState => ({
  server: '',
  categories: [],
  channel: null,
  messages: [],
  typing: [],
  draft: '',
  memberGroups: [],
  roles: {},
  guideStep: null,
  ...over,
})
