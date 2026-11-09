import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import type { TrainingChapterView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import { TrainingBlockKinds } from '@/utils/constants/hierarchy'
import type { TrainingBlockKindName } from '@/utils/constants/hierarchy'
import {
  chapterInScope,
  readTrainingContent,
} from '@/core/services/academy/training/TrainingContentService/chapters'

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
 * Load a chapter for its training identifier
 * @param {string} chapterId - Chapter identifier
 * @return {Promise<string>} - Training identifier
 */

export const trainingOfChapter = async (chapterId: string): Promise<string> =>
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

export const blockInScope = async (id: string) => {
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
 * Drop a block
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
