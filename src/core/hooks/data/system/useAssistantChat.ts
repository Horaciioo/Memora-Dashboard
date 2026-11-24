'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { apiPost, apiSend, ApiClientError } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { isRecapAsk } from '@/core/lib/assistant/recapAsk'
import { useAssistantScenario } from '@/core/hooks/data/system/useAssistantScenario'
import type { ScenarioId, ScenarioRunner } from '@/core/hooks/data/system/useAssistantScenario'
import { SECOND_MS } from '@/utils/constants/time'
import { useNexusHandoff } from '@/managers/front-end/NexusManager'
import { useAssistantStore } from '@/core/store/assistant'
import { useAssistantDock } from '@/core/store/assistantDock'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import {
  ASSISTANT_ORIGIN_HEADER,
  ASSISTANT_ORIGIN_VALUE,
} from '@/declarations/system/security/origin'
import type { RecapChapter } from '@/core/lib/recap/compose'
import type { AssistantCall, AssistantProposal } from '@/types/assistant'
import type { ScenarioCard, ScenarioGroup, ScenarioLink } from '@/types/scenario'

/**
 * One line of the conversation
 * @typedef {Object} AssistantTurn
 * @property {number} id - Order key
 * @property {'me' | 'memora'} from - Speaker
 * @property {string} text - Line shown
 * @property {AssistantProposal} [proposal] - Answer behind it
 * @property {ScenarioLink} [link] - Page the line points at
 * @property {ScenarioCard} [card] - Person drawn under the line
 * @property {RecapChapter} [recap] - Chapter of the recap drawn under the line
 * @property {string[]} [items] - List drawn under the line
 * @property {string} [topic] - Title of the conversation this turn opens
 */

export interface AssistantTurn {
  id: number
  from: 'me' | 'memora'
  text: string
  proposal?: AssistantProposal
  link?: ScenarioLink
  card?: ScenarioCard
  recap?: RecapChapter
  items?: string[]
  groups?: ScenarioGroup[]
  // Opens a conversation of its own, this is its title
  topic?: string
}

/**
 * Conversation state
 * @typedef {Object} AssistantChat
 * @property {AssistantTurn[]} turns - Lines so far
 * @property {AssistantProposal | null} current - Answer waiting
 * @property {boolean} isBusy - Request in flight
 * @property {(text: string, known?: AssistantProposal | null) => void} start - New sentence
 * @property {(value: string, shown: string) => void} answer - Fill the question
 * @property {(text: string) => void} send - Typed line, answer or new ask
 * @property {() => void} confirm - Run the action
 * @property {boolean} canUndo - The last gesture can still be taken back
 * @property {() => void} undo - Take the last gesture back
 * @property {() => void} reset - Back to search
 * @property {ScenarioRunner} scenario - Guided talk Memora leads
 * @property {(id: ScenarioId, entry: string, data?: Record<string, string>) => void} guide - Open a guided talk
 * @property {(href: string) => void} open - Leave for a page
 * @property {boolean} isAnswering - A typed answer is expected
 */

export interface AssistantChat {
  turns: AssistantTurn[]
  current: AssistantProposal | null
  isBusy: boolean
  start: (text: string, known?: AssistantProposal | null) => void
  answer: (value: string, shown: string) => void
  send: (text: string) => void
  confirm: () => void
  canUndo: boolean
  undo: () => void
  reset: () => void
  scenario: ScenarioRunner
  guide: (id: ScenarioId, entry: string, data?: Record<string, string>) => void
  open: (href: string) => void
  isAnswering: boolean
}

// Readable failure
const failureOf = (error: unknown): string =>
  error instanceof ApiClientError
    ? ASSISTANT_COPY.failed.replace('{error}', error.message)
    : ASSISTANT_COPY.offline

/**
 * Talk with Memora
 * @param {(href: string) => void} onNavigate - Leaves the palette
 * @return {AssistantChat} - Conversation
 */

export const useAssistantChat = (onNavigate: (href: string) => void): AssistantChat => {
  const router = useRouter()
  const pathname = usePathname()
  const tab = useSearchParams().get('tab') ?? ''
  const element = useAssistantDock((state) => state.focus?.element ?? null)
  const handoff = useNexusHandoff()
  const { memory, remember, tick, forget } = useAssistantStore()
  const [turns, setTurns] = useState<AssistantTurn[]>([])
  const [pending, setPending] = useState({ text: '', filled: {} as Record<string, string> })
  const [isBusy, setIsBusy] = useState(false)
  // One key per proposal, reused by retries
  const writeKey = useRef<string | null>(null)
  // Same frame double clicks
  const inFlight = useRef(false)
  // Request that takes the last gesture back, for a few seconds
  const [undoCall, setUndoCall] = useState<AssistantCall | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (undoTimer.current && clearTimeout(undoTimer.current)), [])

  const armUndo = (call: AssistantCall | null) => {
    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoCall(call)
    if (call) {
      undoTimer.current = setTimeout(
        () => setUndoCall(null),
        ASSISTANT_SETTINGS.undoSeconds * SECOND_MS
      )
    }
  }

  const setBusy = (busy: boolean) => {
    inFlight.current = busy
    setIsBusy(busy)
  }

  const say = (
    from: AssistantTurn['from'],
    text: string,
    proposal?: AssistantProposal,
    link?: ScenarioLink,
    card?: ScenarioCard,
    recap?: RecapChapter,
    items?: string[],
    groups?: ScenarioGroup[]
  ) =>
    setTurns((lines) => [
      ...lines,
      { id: lines.length, from, text, proposal, link, card, recap, items, groups },
    ])

  const scenario = useAssistantScenario({
    say: (from, text, link, card, recap, items, groups) =>
      say(from, text, undefined, link, card, recap, items, groups),
    begin: (topic) =>
      setTurns((lines) => [...lines, { id: lines.length, from: 'memora', text: '', topic }]),
    refresh: () => router.refresh(),
  })

  // Only the last line can be acted on
  const current = turns.at(-1)?.proposal ?? null

  // An answer lands
  const receive = (proposal: AssistantProposal) => {
    remember(proposal.memory)

    // A talk Memora leads takes over from her first words
    if (proposal.action?.kind === 'scenario') {
      say('memora', proposal.reply)
      scenario.start(proposal.action.scenario, proposal.action.entry)
      return
    }

    // Written lines come out one by one, the last carries the answers
    if (proposal.action?.kind === 'say') {
      const { lines } = proposal.action
      lines.forEach((line, index) =>
        say('memora', line.text, index === lines.length - 1 ? proposal : undefined, line.link)
      )
      return
    }

    say('memora', proposal.reply, proposal)
    if (proposal.confirm) writeKey.current = crypto.randomUUID()
    if (proposal.status === 'ready' && !proposal.confirm && proposal.action?.kind === 'navigate') {
      onNavigate(proposal.action.href)
    }
  }

  const ask = async (text: string, filled: Record<string, string>) => {
    setBusy(true)
    try {
      receive(
        await apiPost<AssistantProposal>(API_ROUTES.assistant, {
          text,
          pathname,
          tab,
          element,
          memory,
          filled,
        })
      )
    } catch (error) {
      say('memora', failureOf(error))
    } finally {
      setBusy(false)
    }
  }

  const start = (text: string, known?: AssistantProposal | null) => {
    if (inFlight.current || !text.trim() || handoff(text)) return
    tick()
    setPending({ text, filled: {} })
    say('me', text)

    // The recap is told by the talk Memora leads
    if (isRecapAsk(text)) {
      guide('recap', 'recap')
      return
    }

    if (known) receive(known)
    else void ask(text, {})
  }

  const answer = (value: string, shown: string) => {
    const slot = current?.question?.slot
    if (inFlight.current || !slot || !value.trim()) return

    const filled = { ...pending.filled, [slot]: value.trim() }
    setPending({ text: pending.text, filled })
    say('me', shown)
    void ask(pending.text, filled)
  }

  // Typed line answers or asks again
  const send = (text: string) => {
    if (handoff(text)) return
    if (scenario.isActive) {
      scenario.reply(text)
      return
    }

    const kind = current?.question?.kind
    if (kind === 'text' || kind === 'date') answer(text, text)
    else start(text)
  }

  // Same route the screens call, signed as Memora's in the journal
  const callRoute = (call: AssistantCall, key: string) =>
    apiSend<{ id?: string; title?: string } | null>(call.method, call.path, call.body, {
      [IDEMPOTENCY_HEADER]: key,
      [ASSISTANT_ORIGIN_HEADER]: ASSISTANT_ORIGIN_VALUE,
    })

  const confirm = async () => {
    const proposal = current
    const action = proposal?.action
    if (!proposal || inFlight.current || action?.kind !== 'act' || !writeKey.current) return

    // A strong gesture asks twice
    if (action.sure) {
      say('memora', action.sure, {
        ...proposal,
        reply: action.sure,
        action: { ...action, sure: null },
      })
      return
    }

    setBusy(true)
    try {
      const result = await callRoute(action.call, writeKey.current)
      writeKey.current = null
      if (action.remember && result?.id) {
        remember({ [action.remember]: { id: result.id, label: result.title ?? '' } })
      }
      say('memora', action.done)
      armUndo(action.undo)
      router.refresh()
    } catch (error) {
      // The key stays, a retry replays
      say('memora', failureOf(error), proposal)
    } finally {
      setBusy(false)
    }
  }

  const undo = async () => {
    const call = undoCall
    if (inFlight.current || !call) return

    armUndo(null)
    setBusy(true)
    try {
      await callRoute(call, crypto.randomUUID())
      say('memora', ASSISTANT_COPY.undone)
      router.refresh()
    } catch (error) {
      say('memora', failureOf(error))
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    forget()
    armUndo(null)
    scenario.stop()
    writeKey.current = null
    setTurns([])
    setPending({ text: '', filled: {} })
  }

  // Typed words answer a text, a date or a period
  const kind = scenario.isActive ? scenario.ask?.kind : current?.question?.kind
  const isAnswering =
    kind === 'text' ||
    kind === 'search' ||
    kind === 'multi' ||
    kind === 'percent' ||
    kind === 'date' ||
    kind === 'period'

  // A guided talk opens under what is already said
  const guide = (id: ScenarioId, entry: string, data?: Record<string, string>) => {
    setPending({ text: '', filled: {} })
    scenario.start(id, entry, data)
  }

  return {
    turns,
    current,
    isBusy,
    start,
    answer,
    send,
    confirm: () => void confirm(),
    canUndo: undoCall !== null,
    undo: () => void undo(),
    reset,
    scenario,
    guide,
    open: onNavigate,
    isAnswering,
  }
}
