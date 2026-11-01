import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { objectivesUnlocked } from '@/core/lib/academy/objectives'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { readDate, readText } from '@/core/lib/forms/values'
import type { JuniorObjectiveView } from '@/types/academy'
import type { FormValues } from '@/types/forms'
import { ObjectiveStatuses } from '@/utils/constants/hierarchy'
import type { ObjectiveStatusName } from '@/utils/constants/hierarchy'
import { juniorInScope, objectiveInScope } from '@/core/services/academy/lookups'

/**
 * Shape one personal objective
 * @param {object} row - Objective row
 * @return {JuniorObjectiveView} - Objective view
 */

const toJuniorObjective = (row: {
  id: string
  title: string
  description: string | null
  dueAt: Date | null
  status: ObjectiveStatusName
  position: number
  author: { displayName: string; avatarUrl: string | null } | null
}): JuniorObjectiveView => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueAt: row.dueAt?.toISOString() ?? null,
  status: row.status,
  position: row.position,
  authorName: row.author?.displayName ?? null,
  authorAvatar: row.author?.avatarUrl ?? null,
  values: {
    title: row.title,
    description: row.description,
    dueAt: row.dueAt ? row.dueAt.toISOString().slice(0, 10) : null,
    status: row.status,
  },
})

/**
 * Read the personal objectives of a junior
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorObjectiveView[]>} - Objectives in display order
 */

export const listJuniorObjectives = async (
  juniorId: string,
  scope: AcademyScope
): Promise<JuniorObjectiveView[]> => {
  await juniorInScope(juniorId, scope)

  const rows = await prisma.juniorObjective.findMany({
    where: { juniorId },
    include: { author: true },
    orderBy: { position: 'asc' },
  })

  return rows.map(toJuniorObjective)
}

/**
 * Read the next free position of a junior's objectives
 * @param {string} juniorId - Junior identifier
 * @return {Promise<number>} - Next position
 */

const nextObjectivePosition = async (juniorId: string): Promise<number> => {
  const result = await prisma.juniorObjective.aggregate({
    where: { juniorId },
    _max: { position: true },
  })

  return (result._max.position ?? -1) + 1
}

/**
 * Turn parsed values into an objective payload
 * @param {FormValues} values - Parsed body
 * @return {object} - Database payload
 */

const toJuniorObjectiveData = (values: FormValues) => ({
  title: readText(values, 'title') ?? '',
  description: readText(values, 'description'),
  dueAt: readDate(values, 'dueAt'),
  status: (readText(values, 'status') ?? ObjectiveStatuses.Open) as ObjectiveStatusName,
})

/**
 * Set a personal objective
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} authorId - Who set it
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const createJuniorObjective = async (
  juniorId: string,
  scope: AcademyScope,
  authorId: string,
  values: FormValues
): Promise<JuniorObjectiveView[]> => {
  const junior = await juniorInScope(juniorId, scope)
  // The objectives open with the second period, whatever the way in
  if (!objectivesUnlocked(junior.status, junior.stage)) {
    throw conflict(ACADEMY_COPY.objectiveLockedDescription)
  }
  const position = await nextObjectivePosition(juniorId)

  await prisma.juniorObjective.create({
    data: { juniorId, authorId, position, ...toJuniorObjectiveData(values) },
  })

  return listJuniorObjectives(juniorId, scope)
}

/**
 * Edit a personal objective
 * @param {string} id - Objective identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {FormValues} values - Parsed body
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const updateJuniorObjective = async (
  id: string,
  scope: AcademyScope,
  values: FormValues
): Promise<JuniorObjectiveView[]> => {
  const existing = await objectiveInScope(id, scope)
  await prisma.juniorObjective.update({ where: { id }, data: toJuniorObjectiveData(values) })

  return listJuniorObjectives(existing.juniorId, scope)
}

/**
 * Drop a personal objective
 * @param {string} id - Objective identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const removeJuniorObjective = async (
  id: string,
  scope: AcademyScope
): Promise<JuniorObjectiveView[]> => {
  const row = await objectiveInScope(id, scope)
  await prisma.juniorObjective.delete({ where: { id } })

  return listJuniorObjectives(row.juniorId, scope)
}

/**
 * Apply a new order to a junior's objectives
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string[]} ids - Identifiers in their new order
 * @return {Promise<JuniorObjectiveView[]>} - Objectives
 */

export const reorderJuniorObjectives = async (
  juniorId: string,
  scope: AcademyScope,
  ids: string[]
): Promise<JuniorObjectiveView[]> => {
  await juniorInScope(juniorId, scope)
  await Promise.all(
    ids.map((id, position) => prisma.juniorObjective.update({ where: { id }, data: { position } }))
  )

  return listJuniorObjectives(juniorId, scope)
}
