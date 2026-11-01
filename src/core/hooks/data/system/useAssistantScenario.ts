'use client'

import { useRef, useState } from 'react'

import { readPeriod } from '@/core/lib/assistant/period'
import { ABSENCE_SCENARIO } from '@/core/lib/assistant/scenarios/absence'
import { CANDIDATE_SCENARIO } from '@/core/lib/assistant/scenarios/candidate'
import { JUNIOR_SCENARIO } from '@/core/lib/assistant/scenarios/junior'
import { TASK_SCENARIO } from '@/core/lib/assistant/scenarios/task'
import { RECRUITMENT_SCENARIO } from '@/core/lib/assistant/scenarios/recruitment'
import { isStop, matchChoice } from '@/core/lib/assistant/scenarios/answers'
import { failureOf } from '@/core/lib/assistant/scenarios/failure'
import { typingDuration } from '@/core/lib/tour/chat'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { SCENARIO_COPY } from '@/declarations/assistant/scenarios/shared'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type {
  Scenario,
  ScenarioId,
  ScenarioAnswer,
  ScenarioAsk,
  ScenarioChoice,
  ScenarioLine,
  ScenarioLink,
} from '@/types/scenario'
import { prefersReducedMotion } from '@/utils/motion'
import { instantToWall } from '@/utils/format/zone'

/**
 * Guided talks Memora can lead
 * @type {Record<ScenarioId, Scenario>}
 */

const SCENARIOS: Record<ScenarioId, Scenario> = {
  absence: ABSENCE_SCENARIO,
  recruitment: RECRUITMENT_SCENARIO,
  candidate: CANDIDATE_SCENARIO,
  task: TASK_SCENARIO,
  junior: JUNIOR_SCENARIO,
}

export type { ScenarioId }

/**
 * What Memora is doing between two answers
 * @type {'idle' | 'typing' | 'thinking'}
 */

export type ScenarioStatus = 'idle' | 'typing' | 'thinking'

/**
 * Guided talk state
 * @typedef {Object} ScenarioRunner
 * @property {ScenarioAsk | null} ask - Answer waited for
 * @property {ScenarioStatus} status - Memora typing or thinking
 * @property {boolean} isActive - A talk is on
 * @property {(id: ScenarioId, entry: string, data?: Record<string, string>) => void} start - Open a talk
 * @property {(answer: ScenarioAnswer) => void} answer - Answer by button
 * @property {(text: string) => void} reply - Answer by typing
 * @property {() => void} stop - Drop the talk
 */

export interface ScenarioRunner {
  ask: ScenarioAsk | null
  status: ScenarioStatus
  isActive: boolean
  start: (id: ScenarioId, entry: string, data?: Record<string, string>) => void
  answer: (answer: ScenarioAnswer) => void
  reply: (text: string) => void
  stop: () => void
}

/**
 * What the runner needs from the chat
 * @typedef {Object} ScenarioDeps
 * @property {(from: 'me' | 'memora', text: string, link?: ScenarioLink) => void} say - Writes a line
 * @property {() => void} refresh - Reloads the page behind
 */

export interface ScenarioDeps {
  say: (from: 'me' | 'memora', text: string, link?: ScenarioLink) => void
  refresh: () => void
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Lead a guided talk step by step
 * @param {ScenarioDeps} deps - Chat writer and page refresh
 * @return {ScenarioRunner} - Talk state and gestures
 */

export const useAssistantScenario = ({ say, refresh }: ScenarioDeps): ScenarioRunner => {
  const { session } = useAuthContext()
  const [ask, setAsk] = useState<ScenarioAsk | null>(null)
  const [status, setStatus] = useState<ScenarioStatus>('idle')
  const [isActive, setActive] = useState(false)
  const scenario = useRef<Scenario | null>(null)
  const data = useRef<Record<string, string>>({})
  // Step the next answer goes to
  const waiting = useRef<string | null>(null)
  // A new talk or a stop drops the one running
  const generation = useRef(0)
  const isRunning = useRef(false)

  const today = () => instantToWall(new Date()).slice(0, 10)

  const finish = () => {
    scenario.current = null
    waiting.current = null
    setAsk(null)
    setStatus('idle')
    setActive(false)
  }

  // A line written after Memora's typing dots
  const write = async (line: ScenarioLine, turn: number): Promise<boolean> => {
    const text = typeof line === 'string' ? line : line.text
    setStatus('typing')
    if (!prefersReducedMotion()) await wait(typingDuration(text.length, ASSISTANT_SETTINGS))
    if (turn !== generation.current) return false

    say('memora', text, typeof line === 'string' ? undefined : line.link)

    return true
  }

  const go = async (first: string, given: ScenarioAnswer | null, turn: number) => {
    isRunning.current = true
    let step: string | undefined = first
    let answer = given

    try {
      while (step && scenario.current) {
        const move = await scenario.current.steps[step](
          { today: today(), accountId: session?.id ?? '', data: data.current, refresh },
          answer
        )
        if (turn !== generation.current) return

        data.current = { ...data.current, ...move.data }
        for (const line of move.say) if (!(await write(line, turn))) return

        if (move.ask) {
          waiting.current = move.next ?? null
          setAsk(move.ask)
          setStatus('idle')
          return
        }

        setStatus(move.thinking ? 'thinking' : 'idle')
        if (move.thinking) await wait(ASSISTANT_SETTINGS.thinkingMs)
        if (turn !== generation.current) return

        step = move.next
        answer = null
      }

      finish()
    } catch (error) {
      say('memora', failureOf(error))
      finish()
    } finally {
      isRunning.current = false
    }
  }

  const start = (id: ScenarioId, entry: string, given: Record<string, string> = {}) => {
    generation.current += 1
    scenario.current = SCENARIOS[id]
    data.current = given
    setActive(true)
    setAsk(null)

    void go(SCENARIOS[id].entries[entry], null, generation.current)
  }

  const answer = (given: ScenarioAnswer) => {
    const step = waiting.current
    if (!step || isRunning.current) return

    waiting.current = null
    setAsk(null)
    say('me', given.label)
    void go(step, given, generation.current)
  }

  const stop = () => {
    generation.current += 1
    finish()
  }

  const reply = (text: string) => {
    const typed = text.trim()
    if (!typed || isRunning.current || !ask) return

    if (isStop(typed)) {
      say('me', typed)
      say('memora', SCENARIO_COPY.cancelled)
      stop()
      return
    }

    if (ask.kind === 'text' || ask.kind === 'search') return answer({ value: typed, label: typed })

    if (ask.kind === 'percent') {
      const percent = Number(/\d{1,3}/.exec(typed)?.[0])
      if (Number.isNaN(percent)) {
        say('me', typed)
        say('memora', SCENARIO_COPY.percentUnreadable)
        return
      }

      const bounded = Math.min(percent, ask.max)

      return answer({ value: String(bounded), label: `${bounded} %` })
    }

    if (ask.kind === 'multi') {
      const picked = typed.split(/,| et /).map((part) => matchChoice(part, ask.choices))
      if (picked.length > 0 && picked.every(Boolean)) {
        const choices = picked as ScenarioChoice[]

        return answer({
          value: choices.map((choice) => choice.value).join(','),
          label: choices.map((choice) => choice.label).join(', '),
        })
      }
      say('me', typed)
      say('memora', SCENARIO_COPY.notUnderstood)
      return
    }

    if (ask.kind === 'choices') {
      const choice = matchChoice(typed, ask.choices)
      if (choice) return answer({ value: choice.value, label: choice.label })
      say('me', typed)
      say('memora', SCENARIO_COPY.notUnderstood)
      return
    }

    const period = readPeriod(typed, today())
    if (period) return answer({ value: `${period.start}/${period.end}`, label: typed })
    say('me', typed)
    say('memora', SCENARIO_COPY.periodUnreadable)
  }

  return { ask, status, isActive, start, answer, reply, stop }
}
