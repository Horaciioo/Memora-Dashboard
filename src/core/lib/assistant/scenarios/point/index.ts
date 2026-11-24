import { POINT_TALK_COPY as COPY } from '@/declarations/assistant/scenarios/point'
import { useRecapAgenda } from '@/core/store/recapAgenda'
import type { RecapChapterName } from '@/declarations/recap/chapters'
import type { AssistantSayLine } from '@/types/assistant'
import type { Scenario, ScenarioLine, ScenarioStep } from '@/types/scenario'

// Lines kept between steps
const linesOf = (data: Record<string, string>): AssistantSayLine[] =>
  JSON.parse(data.lines || '[]') as AssistantSayLine[]

// A written line as the talk says it
const toLine = (line: AssistantSayLine): ScenarioLine =>
  line.link ? { text: line.text, link: line.link } : line.text

// Subjects in the order they are told
const sectionsOf = (lines: AssistantSayLine[]): RecapChapterName[] => [
  ...new Set(lines.flatMap((line) => (line.section ? [line.section] : []))),
]

// What is said before the first subject, and after the last
const frameOf = (lines: AssistantSayLine[]) => {
  const first = lines.findIndex((line) => line.section)
  const last = lines.findLastIndex((line) => line.section)

  return { intro: lines.slice(0, first), outro: lines.slice(last + 1) }
}

// Opens by offering the two ways to hear it
const walk: ScenarioStep = async ({ data }) => {
  const lines = linesOf(data)
  useRecapAgenda.getState().set(sectionsOf(lines), true)

  return {
    say: [...frameOf(lines).intro.map(toLine), COPY.ask],
    ask: {
      kind: 'choices',
      choices: [
        { value: 'step', label: COPY.stepByStep },
        { value: 'all', label: COPY.allAtOnce },
      ],
    },
    next: 'mode',
  }
}

// Everything at once, or the first subject
const mode: ScenarioStep = async ({ data }, answer) => {
  if (answer?.value !== 'all') return { say: [], data: { index: '0' }, next: 'section' }

  const lines = linesOf(data)
  sectionsOf(lines).forEach((section) => useRecapAgenda.getState().finish(section))

  // The opening was said already
  return { say: lines.slice(frameOf(lines).intro.length).map(toLine) }
}

// One subject, then the offer to go on
const section: ScenarioStep = async ({ data }) => {
  const lines = linesOf(data)
  const sections = sectionsOf(lines)
  const index = Number(data.index || 0)
  const current = sections[index]
  const agenda = useRecapAgenda.getState()

  if (!current) return { say: frameOf(lines).outro.map(toLine) }

  agenda.focus(current)
  const said = lines.filter((line) => line.section === current).map(toLine)
  agenda.finish(current)

  // The last subject closes the point
  if (index === sections.length - 1) {
    return { say: [...said, ...frameOf(lines).outro.map(toLine)] }
  }

  return {
    say: said,
    ask: {
      kind: 'choices',
      choices: [
        { value: 'next', label: COPY.onward },
        { value: 'stop', label: COPY.enough },
      ],
    },
    data: { index: String(index + 1) },
    next: 'onward',
  }
}

// On to the next subject, or stop here
const onward: ScenarioStep = async (_context, answer) =>
  answer?.value === 'stop' ? { say: [COPY.stopped] } : { say: [], next: 'section' }

/**
 * A point told one subject at a time, the member sets the pace
 * @type {Scenario}
 */

export const POINT_SCENARIO: Scenario = {
  entries: { walk: 'walk' },
  steps: { walk, mode, section, onward },
}
