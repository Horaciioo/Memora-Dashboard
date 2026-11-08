import 'server-only'
import type {
  QuizChoiceView,
  QuizQuestionView,
  TrainingBlockView,
  TrainingChapterView,
} from '@/types/academy'
import type { TrainingBlockKindName } from '@/utils/constants/hierarchy'

/**
 * Shape one quiz choice
 * @param {object} row - Choice row
 * @return {QuizChoiceView} - Choice view
 */

const toChoice = (row: {
  id: string
  label: string
  correct: boolean
  position: number
}): QuizChoiceView => ({
  id: row.id,
  label: row.label,
  correct: row.correct,
  position: row.position,
  values: { label: row.label, correct: row.correct },
})

/**
 * Shape one quiz question
 * @param {object} row - Question row with its choices
 * @return {QuizQuestionView} - Question view
 */

const toQuestion = (row: {
  id: string
  prompt: string
  multiple: boolean
  position: number
  choices: { id: string; label: string; correct: boolean; position: number }[]
}): QuizQuestionView => ({
  id: row.id,
  prompt: row.prompt,
  multiple: row.multiple,
  position: row.position,
  choices: row.choices.map(toChoice),
  values: { prompt: row.prompt, multiple: row.multiple },
})

/**
 * Shape one content block
 * @param {object} row - Block row with its questions
 * @return {TrainingBlockView} - Block view
 */

const toBlock = (row: {
  id: string
  kind: TrainingBlockKindName
  body: string | null
  position: number
  questions: {
    id: string
    prompt: string
    multiple: boolean
    position: number
    choices: { id: string; label: string; correct: boolean; position: number }[]
  }[]
}): TrainingBlockView => ({
  id: row.id,
  kind: row.kind,
  body: row.body,
  position: row.position,
  questions: row.questions.map(toQuestion),
  values: { kind: row.kind, body: row.body },
})

/**
 * Shape one chapter
 * @param {object} row - Chapter row with its blocks
 * @return {TrainingChapterView} - Chapter view
 */

export const toChapter = (row: {
  id: string
  title: string
  position: number
  blocks: Parameters<typeof toBlock>[0][]
}): TrainingChapterView => ({
  id: row.id,
  title: row.title,
  position: row.position,
  blocks: row.blocks.map(toBlock),
  values: { title: row.title },
})

// Everything a chapter needs to become a full editor view
export const CONTENT_SHAPE = {
  orderBy: { position: 'asc' as const },
  include: {
    blocks: {
      orderBy: { position: 'asc' as const },
      include: {
        questions: {
          orderBy: { position: 'asc' as const },
          include: { choices: { orderBy: { position: 'asc' as const } } },
        },
      },
    },
  },
}
