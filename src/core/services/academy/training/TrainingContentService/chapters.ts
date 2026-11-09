import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import type { TrainingChapterView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import {
  CONTENT_SHAPE,
  toChapter,
} from '@/core/services/academy/training/TrainingContentService/shape'

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

export const chapterInScope = async (id: string) => {
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
 * Drop a chapter
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
