import { COURSE_COPY } from '@/declarations/academy/copy'
import type { CourseBlock, CourseChapter } from '@/declarations/academy/curriculum/types'

/**
 * One screen of a chapter
 * @typedef {Object} CourseStep
 * @property {string} key - Stable key
 * @property {string} label - Name in the sidebar
 * @property {boolean} welcome - Opening screen
 * @property {CourseBlock[]} blocks - Content shown
 */

export interface CourseStep {
  key: string
  label: string
  welcome: boolean
  blocks: CourseBlock[]
}

// Blocks that ride along with the next one
const LEAD_KINDS = new Set<string>(['text', 'callout'])

/**
 * Name of a block
 * @param {CourseBlock} block - Block
 * @return {string} - Its title or its kind
 */

const labelOf = (block: CourseBlock): string =>
  'title' in block && typeof block.title === 'string' && block.title
    ? block.title
    : (COURSE_COPY.stepKinds[block.kind] ?? COURSE_COPY.stepKinds.text)

/**
 * Cut a chapter into screens: a welcome, then one screen per block with the plain text and
 * callouts before it riding along
 * @param {CourseChapter} chapter - Chapter
 * @return {CourseStep[]} - Screens in order
 */

export const stepsOf = (chapter: CourseChapter): CourseStep[] => {
  const steps: CourseStep[] = [
    { key: `${chapter.key}:welcome`, label: COURSE_COPY.stepWelcome, welcome: true, blocks: [] },
  ]
  let lead: CourseBlock[] = []

  // Lead blocks wait for their visual
  for (const block of chapter.blocks) {
    if (LEAD_KINDS.has(block.kind)) {
      lead.push(block)
      continue
    }

    steps.push({ key: block.key, label: labelOf(block), welcome: false, blocks: [...lead, block] })
    lead = []
  }

  // Closing text stands alone
  if (lead.length > 0) {
    steps.push({ key: lead[0]!.key, label: labelOf(lead[0]!), welcome: false, blocks: lead })
  }

  return steps
}
