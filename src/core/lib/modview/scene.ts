import type { ChatOptionName } from '@/declarations/modview/registries'
import type {
  ChatMessage,
  ChatScript,
  Chatter,
  HeldMessage,
  ModAct,
  ModViewIntent,
  ModViewState,
  ModViewTarget,
  UnbanRequest,
} from '@/types/modview'

/**
 * One thing a scene makes happen
 * @typedef {Object} SceneEvent
 */

export type SceneEvent =
  | { kind: 'message'; message: ChatMessage }
  | { kind: 'act'; act: ModAct; deleteMessageId?: string }
  | { kind: 'hold'; held: HeldMessage }
  | { kind: 'release'; heldId: string }
  | { kind: 'join'; group: keyof ModViewState['community']; chatter: Chatter }
  | { kind: 'leave'; group: keyof ModViewState['community']; chatterId: string }
  | { kind: 'modes'; modes: Partial<ModViewState['modes']> }
  | { kind: 'livecon'; level: number | null }
  | { kind: 'spotlight'; target: ModViewTarget | null }
  | { kind: 'chatMenu'; menu: ChatScript['menu'] }
  | { kind: 'strike'; by: string; messageIds?: string[]; chatterId?: string }
  | { kind: 'terms'; list: 'blocked' | 'allowed'; add: string[]; remove: string[] }
  | { kind: 'unbanRequest'; request: UnbanRequest }
  | { kind: 'unbanResolved'; requestId: string }
  | { kind: 'stream'; title?: string; category?: string | null }
  | { kind: 'chatOption'; option: ChatOptionName; enabled: boolean }

/**
 * One timed beat of a scene
 * @typedef {Object} SceneStep
 * @property {number} at - Milliseconds from the start
 * @property {SceneEvent} event - What happens
 */

export interface SceneStep {
  at: number
  event: SceneEvent
}

/**
 * A scripted Mod View, data only
 * @typedef {Object} ModViewScene
 * @property {ModViewState} initial - State at the start
 * @property {SceneStep[]} steps - Beats in time order
 * @property {number} [maxMessages] - Chat lines kept
 */

export interface ModViewScene {
  initial: ModViewState
  steps: SceneStep[]
  maxMessages?: number
}

// Chat lines kept by default
const DEFAULT_MAX_MESSAGES = 200

/**
 * Played state of a scene
 * @typedef {Object} SceneState
 * @property {ModViewState} view - What the Mod View draws
 * @property {ModViewTarget | null} spotlight - Part lit
 */

export interface SceneState {
  view: ModViewState
  spotlight: ModViewTarget | null
}

/**
 * Mark a message removed
 * @param {ChatMessage[]} messages - Chat
 * @param {(message: ChatMessage) => boolean} match - Lines to remove
 * @param {string} moderator - Who removed them
 * @return {ChatMessage[]} - Chat
 */

const strike = (
  messages: ChatMessage[],
  match: (message: ChatMessage) => boolean,
  moderator: string
): ChatMessage[] =>
  messages.map((message) =>
    match(message) && !message.deletedBy ? { ...message, deletedBy: moderator } : message
  )

// Chat menu, closed by default
const scriptOf = (view: ModViewState): ChatScript =>
  view.chatScript ?? { menu: null, options: {}, lit: null }

/**
 * Apply one scene event
 * @param {SceneState} state - Played state
 * @param {SceneEvent} event - Event
 * @param {number} [maxMessages] - Chat lines kept
 * @return {SceneState} - Next state
 */

export const applySceneEvent = (
  state: SceneState,
  event: SceneEvent,
  maxMessages: number = DEFAULT_MAX_MESSAGES
): SceneState => {
  const view = state.view

  switch (event.kind) {
    case 'message':
      return {
        ...state,
        view: { ...view, messages: [...view.messages, event.message].slice(-maxMessages) },
      }
    case 'act': {
      // A removal also greys the line in the chat
      const messages = event.deleteMessageId
        ? strike(view.messages, (line) => line.id === event.deleteMessageId, event.act.moderator)
        : view.messages

      return { ...state, view: { ...view, messages, acts: [event.act, ...view.acts] } }
    }
    case 'hold':
      return { ...state, view: { ...view, held: [event.held, ...view.held] } }
    case 'release':
      return {
        ...state,
        view: { ...view, held: view.held.filter((held) => held.id !== event.heldId) },
      }
    case 'join': {
      const group = view.community[event.group]
      if (group.some((chatter) => chatter.id === event.chatter.id)) return state

      return {
        ...state,
        view: {
          ...view,
          community: { ...view.community, [event.group]: [...group, event.chatter] },
        },
      }
    }
    case 'leave':
      return {
        ...state,
        view: {
          ...view,
          community: {
            ...view.community,
            [event.group]: view.community[event.group].filter(
              (chatter) => chatter.id !== event.chatterId
            ),
          },
        },
      }
    case 'modes':
      return { ...state, view: { ...view, modes: { ...view.modes, ...event.modes } } }
    case 'livecon':
      return { ...state, view: { ...view, liveconLevel: event.level } }
    case 'spotlight':
      return { ...state, spotlight: event.target }
    case 'strike':
      return {
        ...state,
        view: {
          ...view,
          messages: strike(
            view.messages,
            (line) =>
              (event.messageIds?.includes(line.id) ?? false) ||
              (event.chatterId !== undefined && line.author.id === event.chatterId),
            event.by
          ),
        },
      }
    case 'terms': {
      const key = event.list === 'blocked' ? 'blockedTerms' : 'allowedTerms'
      const removed = new Set(event.remove.map((term) => term.toLowerCase()))
      const kept = view[key].filter((term) => !removed.has(term.toLowerCase()))

      return { ...state, view: { ...view, [key]: [...new Set([...kept, ...event.add])] } }
    }
    case 'unbanRequest':
      return {
        ...state,
        view: {
          ...view,
          unbanRequests: [
            event.request,
            ...view.unbanRequests.filter((request) => request.id !== event.request.id),
          ],
        },
      }
    case 'unbanResolved':
      return {
        ...state,
        view: {
          ...view,
          unbanRequests: view.unbanRequests.filter((request) => request.id !== event.requestId),
        },
      }
    case 'stream':
      return {
        ...state,
        view: {
          ...view,
          title: event.title ?? view.title,
          channel:
            event.category === undefined
              ? view.channel
              : { ...view.channel, category: event.category },
        },
      }
    case 'chatMenu':
      return {
        ...state,
        view: { ...view, chatScript: { ...scriptOf(view), menu: event.menu, lit: null } },
      }
    case 'chatOption': {
      const script = scriptOf(view)

      return {
        ...state,
        view: {
          ...view,
          chatScript: {
            ...script,
            options: { ...script.options, [event.option]: event.enabled },
            lit: event.option,
          },
        },
      }
    }
  }
}

/**
 * Find a chatter anywhere in the scene
 * @param {ModViewState} view - Mod View state
 * @param {string} chatterId - Chatter identifier
 * @return {string} - Display name
 */

const nameOf = (view: ModViewState, chatterId: string): string =>
  view.messages.find((message) => message.author.id === chatterId)?.author.name ?? chatterId

/**
 * Play a gesture inside a scene, as if the platform agreed
 * @param {SceneState} state - Played state
 * @param {ModViewIntent} intent - Gesture
 * @param {Object} actor - Who plays it
 * @param {string} actor.name - Moderator name
 * @param {string} actor.at - Moment, ISO
 * @param {string} actor.id - Act identifier
 * @return {SceneState} - Next state
 */

export const applySceneIntent = (
  state: SceneState,
  intent: ModViewIntent,
  actor: { name: string; at: string; id: string }
): SceneState => {
  const view = state.view
  const act = (partial: Omit<ModAct, 'id' | 'moderator' | 'at'>): ModAct => ({
    id: actor.id,
    moderator: actor.name,
    at: actor.at,
    ...partial,
  })

  switch (intent.kind) {
    case 'delete': {
      const message = view.messages.find((line) => line.id === intent.messageId)

      return applySceneEvent(state, {
        kind: 'act',
        act: act({ kind: 'delete', target: message?.author.name ?? null, quote: message?.text }),
        deleteMessageId: intent.messageId,
      })
    }
    case 'warn':
      return applySceneEvent(state, {
        kind: 'act',
        act: act({ kind: 'warn', target: nameOf(view, intent.chatterId), reason: intent.reason }),
      })
    case 'timeout':
    case 'ban': {
      const next = applySceneEvent(state, {
        kind: 'act',
        act: act({
          kind: intent.kind,
          target: nameOf(view, intent.chatterId),
          reason: intent.reason,
          durationSeconds: intent.kind === 'timeout' ? intent.seconds : null,
        }),
      })

      // Exclusion clears the chatter's lines
      return {
        ...next,
        view: {
          ...next.view,
          messages: strike(
            next.view.messages,
            (line) => line.author.id === intent.chatterId,
            actor.name
          ),
        },
      }
    }
    case 'unban':
      return applySceneEvent(state, {
        kind: 'act',
        act: act({ kind: 'unban', target: nameOf(view, intent.chatterId) }),
      })
    case 'automod': {
      const held = view.held.find((entry) => entry.id === intent.heldId)
      const released = applySceneEvent(state, { kind: 'release', heldId: intent.heldId })
      const logged = applySceneEvent(released, {
        kind: 'act',
        act: act({
          kind: intent.approve ? 'automodApprove' : 'automodDeny',
          target: held?.author.name ?? null,
          quote: held?.text,
        }),
      })

      // An approved message lands in the chat
      if (!intent.approve || !held) return logged

      return applySceneEvent(logged, {
        kind: 'message',
        message: { id: held.id, author: held.author, text: held.text, sentAt: actor.at },
      })
    }
    case 'unbanRequest': {
      const request = view.unbanRequests.find((entry) => entry.id === intent.requestId)
      const next = {
        ...state,
        view: {
          ...view,
          unbanRequests: view.unbanRequests.filter((entry) => entry.id !== intent.requestId),
        },
      }

      return applySceneEvent(next, {
        kind: 'act',
        act: act({ kind: 'unbanRequest', target: request?.author.name ?? null }),
      })
    }
    case 'mode': {
      const modes =
        intent.mode === 'slow'
          ? { slowSeconds: intent.enabled ? (intent.seconds ?? null) : null }
          : { [intent.mode]: intent.enabled }

      return applySceneEvent(applySceneEvent(state, { kind: 'modes', modes }), {
        kind: 'act',
        act: act({ kind: 'mode', target: null, quote: intent.mode }),
      })
    }
    case 'term': {
      const key = intent.list === 'blocked' ? 'blockedTerms' : 'allowedTerms'
      const list = intent.remove
        ? view[key].filter((term) => term !== intent.term)
        : [...new Set([...view[key], intent.term])]

      return applySceneEvent(
        { ...state, view: { ...view, [key]: list } },
        {
          kind: 'act',
          act: act({
            kind: intent.remove ? 'termRemove' : 'termAdd',
            target: null,
            quote: intent.term,
          }),
        }
      )
    }
    case 'say':
      return applySceneEvent(state, {
        kind: 'message',
        message: {
          id: actor.id,
          author: {
            id: actor.id,
            login: actor.name,
            name: actor.name,
            colour: null,
            badges: ['moderator'],
          },
          text: intent.text,
          sentAt: actor.at,
        },
      })
  }
}
