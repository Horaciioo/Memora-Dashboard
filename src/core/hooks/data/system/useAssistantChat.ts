'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { apiPost, ApiClientError } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useAssistantStore } from '@/core/store/assistant'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { IDEMPOTENCY_HEADER } from '@/declarations/system/security/idempotency'
import type { AssistantProposal } from '@/types/assistant'
import type { TaskSummary } from '@/types/work'

/**
 * One line of the conversation
 * @typedef {Object} AssistantTurn
 * @property {number} id - Order key
 * @property {'me' | 'memora'} from - Speaker
 * @property {string} text - Line shown
 * @property {AssistantProposal} [proposal] - Answer behind it
 */

export interface AssistantTurn {
  id: number
  from: 'me' | 'memora'
  text: string
  proposal?: AssistantProposal
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
 * @property {() => void} reset - Back to search
 */

export interface AssistantChat {
  turns: AssistantTurn[]
  current: AssistantProposal | null
  isBusy: boolean
  start: (text: string, known?: AssistantProposal | null) => void
  answer: (value: string, shown: string) => void
  send: (text: string) => void
  confirm: () => void
  reset: () => void
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
  const { memory, remember } = useAssistantStore()
  const [turns, setTurns] = useState<AssistantTurn[]>([])
  const [pending, setPending] = useState({ text: '', filled: {} as Record<string, string> })
  const [isBusy, setIsBusy] = useState(false)
  // One key per proposal, reused by retries
  const writeKey = useRef<string | null>(null)
  // Same frame double clicks
  const inFlight = useRef(false)

  const setBusy = (busy: boolean) => {
    inFlight.current = busy
    setIsBusy(busy)
  }

  const say = (from: AssistantTurn['from'], text: string, proposal?: AssistantProposal) =>
    setTurns((lines) => [...lines, { id: lines.length, from, text, proposal }])

  // Only the last line can be acted on
  const current = turns.at(-1)?.proposal ?? null

  // An answer lands
  const receive = (proposal: AssistantProposal) => {
    remember(proposal.memory)
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
        await apiPost<AssistantProposal>(API_ROUTES.assistant, { text, pathname, memory, filled })
      )
    } catch (error) {
      say('memora', failureOf(error))
    } finally {
      setBusy(false)
    }
  }

  const start = (text: string, known?: AssistantProposal | null) => {
    if (inFlight.current || !text.trim()) return
    setPending({ text, filled: {} })
    say('me', text)
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
    const kind = current?.question?.kind
    if (kind === 'text' || kind === 'date') answer(text, text)
    else start(text)
  }

  const confirm = async () => {
    const proposal = current
    const action = proposal?.action
    if (inFlight.current || action?.kind !== 'createTask' || !writeKey.current) return

    setBusy(true)
    try {
      const task = await apiPost<TaskSummary>(API_ROUTES.tasks, action.values, {
        [IDEMPOTENCY_HEADER]: writeKey.current,
      })
      writeKey.current = null
      remember({ task: { id: task.id, label: task.title } })
      say('memora', ASSISTANT_COPY.taskCreated.replace('{title}', task.title))
      router.refresh()
    } catch (error) {
      // The key stays, a retry replays
      say('memora', failureOf(error), proposal ?? undefined)
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    writeKey.current = null
    setTurns([])
    setPending({ text: '', filled: {} })
  }

  return { turns, current, isBusy, start, answer, send, confirm: () => void confirm(), reset }
}
