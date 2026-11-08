import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { resolveOwnJunior } from '@/core/services/academy/AcademyService'
import { TRAINING_CONTENT_COPY } from '@/declarations/academy/copy'
import type { ContentChapterView } from '@/types/academy'
import type { FieldDefinition, FormValues } from '@/types/forms'

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
 * @return {Promise<void>} - Throws when the block
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
 * Read a training's content the way a junior sees it
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
 * Build the quiz form declarations of one block
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
 * Read the choice identifiers submitted for one question
 * @param {FormValues} values - Parsed body
 * @param {string} questionId - Question identifier
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
 * @param {FormValues} values - Parsed body
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
