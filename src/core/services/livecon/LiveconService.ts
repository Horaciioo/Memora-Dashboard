import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { toTag, youtuberOptions } from '@/core/services/work/shared'
import { FORM_SETTINGS, PAGINATION_SETTINGS } from '@/declarations/configurations/settings'
import { LIVECON_COPY, LIVECON_FIELD_COPY } from '@/declarations/livecon/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { LiveconHistoryEntry, LiveconLevelView, LiveconStateView } from '@/types/livecon'
import type { Prisma } from '@prisma/client'

type LevelRow = Prisma.LiveconLevelGetPayload<{
  include: { _count: { select: { entries: true } } }
}>

/**
 * Map a level row to its display shape
 * @param {LevelRow} row - Level row
 * @return {LiveconLevelView} - Alert level
 */

const toLevel = (row: LevelRow): LiveconLevelView => ({
  id: row.id,
  level: row.level,
  name: row.name,
  summary: row.summary,
  guidelines: row.guidelines,
  accent: row.accent,
  usage: row._count.entries,
})

/**
 * Read every declared level
 * @return {Promise<LiveconLevelView[]>} - Levels, tightest last
 */

export const listLevels = async (): Promise<LiveconLevelView[]> => {
  const rows = await prisma.liveconLevel.findMany({
    orderBy: { level: 'desc' },
    include: { _count: { select: { entries: true } } },
  })

  return rows.map(toLevel)
}

/**
 * Read the levels currently in force
 * @return {Promise<LiveconStateView[]>} - Open entries
 */

export const readCurrentState = async (): Promise<LiveconStateView[]> => {
  const rows = await prisma.liveconEntry.findMany({
    where: { endedAt: null },
    include: {
      level: { include: { _count: { select: { entries: true } } } },
      youtuber: true,
      actor: true,
    },
    orderBy: [{ level: { level: 'asc' } }, { startedAt: 'desc' }],
  })

  return rows.map((row) => ({
    id: row.id,
    youtuber: toTag(row.youtuber),
    level: toLevel(row.level),
    startedAt: row.startedAt.toISOString(),
    actorName: row.actor?.displayName ?? null,
    reason: row.reason,
  }))
}

/**
 * Read the past switches
 * @param {number} [take] - Entry count
 * @return {Promise<LiveconHistoryEntry[]>} - History entries
 */

export const readHistory = async (
  take: number = PAGINATION_SETTINGS.defaultPerPage
): Promise<LiveconHistoryEntry[]> => {
  const rows = await prisma.liveconEntry.findMany({
    include: { level: true, youtuber: true, actor: true },
    orderBy: { startedAt: 'desc' },
    take,
  })

  return rows.map((row) => ({
    id: row.id,
    scopeLabel: row.youtuber?.name ?? LIVECON_COPY.global,
    levelName: row.level.name,
    level: row.level.level,
    accent: row.level.accent,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt?.toISOString() ?? null,
    actorName: row.actor?.displayName ?? null,
    reason: row.reason,
  }))
}

/**
 * Build the livecon switch form declarations
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const liveconFields = async (): Promise<FieldDefinition[]> => {
  const [youtubers, levels] = await Promise.all([youtuberOptions(), listLevels()])

  return [
    {
      name: 'youtuberId',
      kind: 'select',
      label: LIVECON_FIELD_COPY.youtuber,
      options: youtubers,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'levelId',
      kind: 'select',
      label: LIVECON_FIELD_COPY.level,
      required: true,
      options: levels.map((level) => ({
        value: level.id,
        label: `${level.level} · ${level.name}`,
        accent: level.accent ?? undefined,
      })),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'reason',
      kind: 'textarea',
      label: LIVECON_FIELD_COPY.reason,
      maxLength: FORM_SETTINGS.longTextMaxLength,
    },
  ]
}

/**
 * Switch the level of one scope
 * @param {FormValues} values - Parsed body
 * @param {string} actorId - Who switched it
 * @return {Promise<LiveconStateView[]>} - Open entries
 */

export const switchLevel = async (
  values: FormValues,
  actorId: string
): Promise<LiveconStateView[]> => {
  const levelId = readText(values, 'levelId')
  if (!levelId) throw invalidInput([{ field: 'levelId', message: FORM_COPY.required }])

  const youtuberId = readText(values, 'youtuberId')

  // One open entry per scope, the previous one closes on the spot
  await prisma.liveconEntry.updateMany({
    where: { youtuberId, endedAt: null },
    data: { endedAt: new Date() },
  })

  await prisma.liveconEntry.create({
    data: { levelId, youtuberId, actorId, reason: readText(values, 'reason') },
  })

  return readCurrentState()
}
