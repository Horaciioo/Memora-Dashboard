import { COURSE_COPY } from '@/declarations/academy/copy'
import type { CourseBlock, CourseChapter } from '@/declarations/academy/curriculum/types'

/**
 * One screen of a chapter
 * @typedef {Object} CourseStep
 * @property {string} key - Stable key
 * @property {string} label - Name in the sidebar
 * @property {CourseBlock[]} blocks - Content shown
 */

export interface CourseStep {
  key: string
  label: string
  blocks: CourseBlock[]
}

// Blocks that ride along with the next one
const LEAD_KINDS = new Set<string>(['text', 'callout', 'outline'])

/**
 * Name of a block
 * @param {CourseBlock} block - Block
 * @return {string} - Its title or its kind
 */

const labelOf = (block: CourseBlock): string =>
  'title' in block && typeof block.title === 'string' && block.title
    ? block.title
    : (COURSE_COPY.stepKinds[block.kind] ?? COURSE_COPY.stepKinds.text)

// Blocks that carry on a visual
const CONTINUING_KINDS = new Set<string>(['text', 'roles'])

// Visuals whose explanation carries on below them
const CONTINUED_KINDS = new Set<string>(['hierarchy'])

// Lead blocks beyond which reading gets its own screen
const LEAD_LIMIT = 2

/**
 * Number repeated names
 * @param {CourseStep[]} steps - Screens
 * @return {CourseStep[]} - Screens with distinct labels
 */

const numbered = (steps: CourseStep[]): CourseStep[] => {
  const totals = Map.groupBy(steps, (step) => step.label)
  const seen = new Map<string, number>()

  return steps.map((step) => {
    if ((totals.get(step.label)?.length ?? 0) < 2) return step

    const position = (seen.get(step.label) ?? 0) + 1
    seen.set(step.label, position)

    return { ...step, label: `${step.label} ${position}` }
  })
}

/**
 * Cut a chapter the author split by hand: each step marker opens a screen carrying its title
 * @param {CourseChapter} chapter - Chapter with step markers
 * @return {CourseStep[]} - Screens in order
 */

const markedSteps = (chapter: CourseChapter): CourseStep[] => {
  const steps: CourseStep[] = []

  for (const block of chapter.blocks) {
    if (block.kind === 'step') {
      steps.push({ key: block.key, label: block.title, blocks: [] })
      continue
    }

    // Blocks before the first marker open a screen named after the chapter
    if (steps.length === 0) steps.push({ key: chapter.key, label: chapter.title, blocks: [] })
    steps.at(-1)!.blocks.push(block)
  }

  return steps
}

/**
 * Cut a chapter into screens, unless the author marked them: one per block, a short lead of plain text and
 * callouts riding along with it and a long one reading first
 * @param {CourseChapter} chapter - Chapter
 * @return {CourseStep[]} - Screens in order
 */

export const stepsOf = (chapter: CourseChapter): CourseStep[] => {
  if (chapter.blocks.some((block) => block.kind === 'step')) return markedSteps(chapter)

  const steps: CourseStep[] = []
  let lead: CourseBlock[] = []

  // Lead blocks wait for their visual
  for (const block of chapter.blocks) {
    // Text carrying on a visual stays on its screen
    const previous = steps.at(-1)
    if (
      CONTINUING_KINDS.has(block.kind) &&
      lead.length === 0 &&
      previous?.blocks.at(-1) &&
      CONTINUED_KINDS.has(previous.blocks.at(-1)!.kind)
    ) {
      previous.blocks.push(block)
      continue
    }

    if (LEAD_KINDS.has(block.kind)) {
      // A new titled text opens a subject: the one before it reads on its own
      if (block.kind === 'text' && block.title && lead.length > 0) {
        steps.push({ key: lead[0]!.key, label: labelOf(lead[0]!), blocks: lead })
        lead = []
      }

      lead.push(block)
      continue
    }

    // Long lead reads on its own
    if (lead.length > LEAD_LIMIT) {
      steps.push({ key: lead[0]!.key, label: COURSE_COPY.stepKinds.text!, blocks: lead })
      lead = []
    }

    steps.push({ key: block.key, label: labelOf(block), blocks: [...lead, block] })
    lead = []
  }

  // Closing text stands alone
  if (lead.length > 0) {
    steps.push({ key: lead[0]!.key, label: labelOf(lead[0]!), blocks: lead })
  }

  // Empty chapter still shows one screen
  if (steps.length === 0) steps.push({ key: chapter.key, label: chapter.title, blocks: [] })

  return numbered(steps)
}
