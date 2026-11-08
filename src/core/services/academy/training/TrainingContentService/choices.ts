import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readFlag, readText } from '@/core/lib/forms/values'
import type { TrainingChapterView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import {
  questionInScope,
  trainingOfBlock,
} from '@/core/services/academy/training/TrainingContentService/questions'
import { readTrainingContent } from '@/core/services/academy/training/TrainingContentService/chapters'

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
 * Load a choice's question
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
