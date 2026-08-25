import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readFlag, readText } from '@/core/lib/forms/values'
import { resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { TRAINING_CONTENT_COPY } from '@/declarations/academy/copy'
import type {
  ContentChapterView,
  QuizChoiceView,
  QuizQuestionView,
  TrainingBlockView,
  TrainingChapterView,
} from '@/types/academy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { TrainingBlockKinds } from '@/utils/constants/hierarchy'
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

const toChapter = (row: {
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
const CONTENT_SHAPE = {
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

/**
 * Read the full editor content of a training
 * @param {string} trainingId - Training identifier
 * @return {Promise<TrainingChapterView[]>} - Chapters in display order
 */

export const readTrainingContent = async (trainingId: string): Promise<TrainingChapterView[]> => {
  const chapters = await prisma.trainingChapter.findMany({
    where: { trainingId },
    ...CONTENT_SHAPE,
  })

  return chapters.map(toChapter)
}

/**
 * Read the next free position of a training's chapters
 * @param {string} trainingId - Training identifier
 * @return {Promise<number>} - Next position
 */

const nextChapterPosition = async (trainingId: string): Promise<number> => {
  const result = await prisma.trainingChapter.aggregate({
    where: { trainingId },
    _max: { position: true },
  })

  return (result._max.position ?? -1) + 1
}

/**
 * Add a chapter to a training
 * @param {string} trainingId - Training identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const createChapter = async (
  trainingId: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const position = await nextChapterPosition(trainingId)

  await prisma.trainingChapter.create({
    data: { trainingId, title: readText(values, 'title') ?? '', position },
  })

  return readTrainingContent(trainingId)
}

/**
 * Load a chapter or fail
 * @param {string} id - Chapter identifier
 * @return {Promise<{ id: string, trainingId: string }>} - Chapter row
 */

const chapterInScope = async (id: string) => {
  const row = await prisma.trainingChapter.findUnique({ where: { id } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit a chapter
 * @param {string} id - Chapter identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const updateChapter = async (
  id: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const existing = await chapterInScope(id)
  await prisma.trainingChapter.update({
    where: { id },
    data: { title: readText(values, 'title') ?? '' },
  })

  return readTrainingContent(existing.trainingId)
}

/**
 * Drop a chapter, its blocks and questions with it
 * @param {string} id - Chapter identifier
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const removeChapter = async (id: string): Promise<TrainingChapterView[]> => {
  const existing = await chapterInScope(id)
  await prisma.trainingChapter.delete({ where: { id } })

  return readTrainingContent(existing.trainingId)
}

/**
 * Apply a new order to a training's chapters
 * @param {string} trainingId - Training identifier
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const reorderChapters = async (
  trainingId: string,
  ids: string[]
): Promise<TrainingChapterView[]> => {
  await Promise.all(
    ids.map((id, position) => prisma.trainingChapter.update({ where: { id }, data: { position } }))
  )

  return readTrainingContent(trainingId)
}

/**
 * Turn parsed values into a block payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toBlockData = (values: FormValues) => ({
  kind: (readText(values, 'kind') ?? TrainingBlockKinds.Text) as TrainingBlockKindName,
  body: readText(values, 'body'),
})

/**
 * Read the next free position of a chapter's blocks
 * @param {string} chapterId - Chapter identifier
 * @return {Promise<number>} - Next position
 */

const nextBlockPosition = async (chapterId: string): Promise<number> => {
  const result = await prisma.trainingBlock.aggregate({
    where: { chapterId },
    _max: { position: true },
  })

  return (result._max.position ?? -1) + 1
}

/**
 * Load a chapter for its training identifier, or fail
 * @param {string} chapterId - Chapter identifier
 * @return {Promise<string>} - Training identifier
 */

const trainingOfChapter = async (chapterId: string): Promise<string> =>
  (await chapterInScope(chapterId)).trainingId

/**
 * Add a block to a chapter
 * @param {string} chapterId - Chapter identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const createBlock = async (
  chapterId: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const trainingId = await trainingOfChapter(chapterId)
  const position = await nextBlockPosition(chapterId)

  await prisma.trainingBlock.create({ data: { chapterId, position, ...toBlockData(values) } })

  return readTrainingContent(trainingId)
}

/**
 * Load a block or fail
 * @param {string} id - Block identifier
 * @return {Promise<{ id: string, chapterId: string }>} - Block row
 */

const blockInScope = async (id: string) => {
  const row = await prisma.trainingBlock.findUnique({ where: { id } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit a block
 * @param {string} id - Block identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const updateBlock = async (
  id: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const existing = await blockInScope(id)
  const trainingId = await trainingOfChapter(existing.chapterId)

  await prisma.trainingBlock.update({ where: { id }, data: toBlockData(values) })

  return readTrainingContent(trainingId)
}

/**
 * Drop a block, its questions with it
 * @param {string} id - Block identifier
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const removeBlock = async (id: string): Promise<TrainingChapterView[]> => {
  const existing = await blockInScope(id)
  const trainingId = await trainingOfChapter(existing.chapterId)

  await prisma.trainingBlock.delete({ where: { id } })

  return readTrainingContent(trainingId)
}

/**
 * Apply a new order to a chapter's blocks
 * @param {string} chapterId - Chapter identifier
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const reorderBlocks = async (
  chapterId: string,
  ids: string[]
): Promise<TrainingChapterView[]> => {
  const trainingId = await trainingOfChapter(chapterId)

  await Promise.all(
    ids.map((id, position) => prisma.trainingBlock.update({ where: { id }, data: { position } }))
  )

  return readTrainingContent(trainingId)
}

/**
 * Read the next free position of a block's questions
 * @param {string} blockId - Block identifier
 * @return {Promise<number>} - Next position
 */

const nextQuestionPosition = async (blockId: string): Promise<number> => {
  const result = await prisma.quizQuestion.aggregate({
    where: { blockId },
    _max: { position: true },
  })

  return (result._max.position ?? -1) + 1
}

/**
 * Load a question's block for its chapter, then its training identifier
 * @param {string} blockId - Block identifier
 * @return {Promise<string>} - Training identifier
 */

const trainingOfBlock = async (blockId: string): Promise<string> => {
  const block = await blockInScope(blockId)

  return trainingOfChapter(block.chapterId)
}

/**
 * Add a question to a quiz block
 * @param {string} blockId - Block identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const createQuestion = async (
  blockId: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const trainingId = await trainingOfBlock(blockId)
  const position = await nextQuestionPosition(blockId)

  await prisma.quizQuestion.create({
    data: {
      blockId,
      position,
      prompt: readText(values, 'prompt') ?? '',
      multiple: readFlag(values, 'multiple'),
    },
  })

  return readTrainingContent(trainingId)
}

/**
 * Load a question or fail
 * @param {string} id - Question identifier
 * @return {Promise<{ id: string, blockId: string }>} - Question row
 */

const questionInScope = async (id: string) => {
  const row = await prisma.quizQuestion.findUnique({ where: { id } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit a question
 * @param {string} id - Question identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const updateQuestion = async (
  id: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const existing = await questionInScope(id)
  const trainingId = await trainingOfBlock(existing.blockId)

  await prisma.quizQuestion.update({
    where: { id },
    data: { prompt: readText(values, 'prompt') ?? '', multiple: readFlag(values, 'multiple') },
  })

  return readTrainingContent(trainingId)
}

/**
 * Drop a question, past answers kept for the record
 * @param {string} id - Question identifier
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const removeQuestion = async (id: string): Promise<TrainingChapterView[]> => {
  const existing = await questionInScope(id)
  const trainingId = await trainingOfBlock(existing.blockId)

  await prisma.quizQuestion.delete({ where: { id } })

  return readTrainingContent(trainingId)
}

/**
 * Apply a new order to a block's questions
 * @param {string} blockId - Block identifier
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const reorderQuestions = async (
  blockId: string,
  ids: string[]
): Promise<TrainingChapterView[]> => {
  const trainingId = await trainingOfBlock(blockId)

  await Promise.all(
    ids.map((id, position) => prisma.quizQuestion.update({ where: { id }, data: { position } }))
  )

  return readTrainingContent(trainingId)
}

/**
 * Read the next free position of a question's choices
 * @param {string} questionId - Question identifier
 * @return {Promise<number>} - Next position
 */

const nextChoicePosition = async (questionId: string): Promise<number> => {
  const result = await prisma.quizChoice.aggregate({
    where: { questionId },
    _max: { position: true },
  })

  return (result._max.position ?? -1) + 1
}

/**
 * Load a choice's question, then its training identifier
 * @param {string} questionId - Question identifier
 * @return {Promise<string>} - Training identifier
 */

const trainingOfQuestion = async (questionId: string): Promise<string> => {
  const question = await questionInScope(questionId)

  return trainingOfBlock(question.blockId)
}

/**
 * Add a choice to a question
 * @param {string} questionId - Question identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const createChoice = async (
  questionId: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const trainingId = await trainingOfQuestion(questionId)
  const position = await nextChoicePosition(questionId)

  await prisma.quizChoice.create({
    data: {
      questionId,
      position,
      label: readText(values, 'label') ?? '',
      correct: readFlag(values, 'correct'),
    },
  })

  return readTrainingContent(trainingId)
}

/**
 * Load a choice or fail
 * @param {string} id - Choice identifier
 * @return {Promise<{ id: string, questionId: string }>} - Choice row
 */

const choiceInScope = async (id: string) => {
  const row = await prisma.quizChoice.findUnique({ where: { id } })
  if (!row) throw notFound()

  return row
}

/**
 * Edit a choice
 * @param {string} id - Choice identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const updateChoice = async (
  id: string,
  values: FormValues
): Promise<TrainingChapterView[]> => {
  const existing = await choiceInScope(id)
  const trainingId = await trainingOfQuestion(existing.questionId)

  await prisma.quizChoice.update({
    where: { id },
    data: { label: readText(values, 'label') ?? '', correct: readFlag(values, 'correct') },
  })

  return readTrainingContent(trainingId)
}

/**
 * Drop a choice
 * @param {string} id - Choice identifier
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const removeChoice = async (id: string): Promise<TrainingChapterView[]> => {
  const existing = await choiceInScope(id)
  const trainingId = await trainingOfQuestion(existing.questionId)

  await prisma.quizChoice.delete({ where: { id } })

  return readTrainingContent(trainingId)
}

/**
 * Apply a new order to a question's choices
 * @param {string} questionId - Question identifier
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<TrainingChapterView[]>} - Chapters
 */

export const reorderChoices = async (
  questionId: string,
  ids: string[]
): Promise<TrainingChapterView[]> => {
  const trainingId = await trainingOfQuestion(questionId)

  await Promise.all(
    ids.map((id, position) => prisma.quizChoice.update({ where: { id }, data: { position } }))
  )

  return readTrainingContent(trainingId)
}

/**
 * Refuse access to a training outside a junior's own function and dispositif
 * @param {string} trainingId - Training identifier
 * @param {string} accountId - Signed-in member identifier
 * @return {Promise<void>} - Throws when the junior has no active FSI or is out of scope
 */

const assertTrainingOpenToJunior = async (trainingId: string, accountId: string): Promise<void> => {
  const junior = await resolveOwnJunior(accountId)
  if (!junior) throw notFound()

  const training = await prisma.training.findUnique({ where: { id: trainingId } })
  if (!training) throw notFound()

  const inScope =
    (training.functionId === null || training.functionId === junior.session.functionId) &&
    (training.dispositifId === null || training.dispositifId === junior.dispositifId)

  if (!inScope) throw notFound()
}

/**
 * Refuse access to a quiz block outside a junior's own function and dispositif
 * @param {string} blockId - Block identifier
 * @param {string} accountId - Signed-in member identifier
 * @return {Promise<void>} - Throws when the block, the FSI or the scope does not check out
 */

export const assertQuizOpenToJunior = async (blockId: string, accountId: string): Promise<void> => {
  const block = await prisma.trainingBlock.findUnique({
    where: { id: blockId },
    include: { chapter: { select: { trainingId: true } } },
  })
  if (!block) throw notFound()

  await assertTrainingOpenToJunior(block.chapter.trainingId, accountId)
}

/**
 * Read a training's content the way a junior sees it, quiz internals left out
 * @param {string} trainingId - Training identifier
 * @param {string} accountId - Signed-in member identifier
 * @return {Promise<ContentChapterView[]>} - Chapters in display order
 */

export const readTrainingContentForJunior = async (
  trainingId: string,
  accountId: string
): Promise<ContentChapterView[]> => {
  await assertTrainingOpenToJunior(trainingId, accountId)

  const chapters = await prisma.trainingChapter.findMany({
    where: { trainingId },
    orderBy: { position: 'asc' },
    include: {
      blocks: {
        orderBy: { position: 'asc' },
        include: { questions: { include: { answers: { where: { accountId } } } } },
      },
    },
  })

  return chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    blocks: chapter.blocks.map((block) => ({
      id: block.id,
      kind: block.kind,
      body: block.body,
      questionCount: block.questions.length,
      answered:
        block.questions.length > 0 &&
        block.questions.every((question) => question.answers.length > 0),
    })),
  }))
}

/**
 * Build the quiz form declarations of one block, one category per question
 * @param {string} blockId - Block identifier
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const quizFields = async (blockId: string): Promise<FieldDefinition[]> => {
  const questions = await prisma.quizQuestion.findMany({
    where: { blockId },
    orderBy: { position: 'asc' },
    include: { choices: { orderBy: { position: 'asc' } } },
  })

  return questions.map((question, index) => ({
    name: question.id,
    kind: question.multiple ? 'multiselect' : 'select',
    label: question.prompt,
    required: true,
    group: `${TRAINING_CONTENT_COPY.questionLabel} ${index + 1}`,
    options: question.choices.map((choice) => ({ value: choice.id, label: choice.label })),
  }))
}

/**
 * Read the choice identifiers submitted for one question, single or multiple
 * @param {FormValues} values - Parsed body
 * @param {string} questionId - Question identifier, also the field name
 * @return {string[]} - Submitted choice identifiers
 */

const readChoiceIds = (values: FormValues, questionId: string): string[] => {
  const raw = values[questionId]
  if (Array.isArray(raw)) return raw

  return typeof raw === 'string' && raw ? [raw] : []
}

/**
 * Score and store a junior's own answers to one quiz block
 * @param {string} blockId - Block identifier
 * @param {string} accountId - Signed-in member identifier
 * @param {FormValues} values - Parsed body, one submitted choice set per question
 * @return {Promise<{ correct: number, total: number }>} - Score
 */

export const submitQuiz = async (
  blockId: string,
  accountId: string,
  values: FormValues
): Promise<{ correct: number; total: number }> => {
  await assertQuizOpenToJunior(blockId, accountId)

  const questions = await prisma.quizQuestion.findMany({
    where: { blockId },
    include: { choices: true },
  })

  let correctCount = 0

  await Promise.all(
    questions.map(async (question) => {
      const submitted = new Set(readChoiceIds(values, question.id))
      const expected = new Set(
        question.choices.filter((choice) => choice.correct).map((choice) => choice.id)
      )
      const isCorrect =
        submitted.size === expected.size && [...expected].every((id) => submitted.has(id))

      if (isCorrect) correctCount++

      await prisma.juniorAnswer.upsert({
        where: { questionId_accountId: { questionId: question.id, accountId } },
        update: { choiceIds: [...submitted], correct: isCorrect, answeredAt: new Date() },
        create: {
          questionId: question.id,
          accountId,
          choiceIds: [...submitted],
          correct: isCorrect,
        },
      })
    })
  )

  return { correct: correctCount, total: questions.length }
}
