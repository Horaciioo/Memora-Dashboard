import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readFlag, readText } from '@/core/lib/forms/values'
import type { TrainingChapterView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import {
  blockInScope,
  trainingOfChapter,
} from '@/core/services/academy/training/TrainingContentService/blocks'
import { readTrainingContent } from '@/core/services/academy/training/TrainingContentService/chapters'

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
 * Load a question's block for its chapter
 * @param {string} blockId - Block identifier
 * @return {Promise<string>} - Training identifier
 */

export const trainingOfBlock = async (blockId: string): Promise<string> => {
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

export const questionInScope = async (id: string) => {
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
 * Drop a question
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
