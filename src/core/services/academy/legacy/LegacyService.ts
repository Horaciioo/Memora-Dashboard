import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { readProgress } from '@/core/lib/curriculum/progress'
import { outcomeOf, scoreModule } from '@/core/lib/legacy/scoring'
import { readDate, readText } from '@/core/lib/forms/values'
import { recordEvent } from '@/core/services/system/ActivityService'
import { exercisesOf } from '@/declarations/academy/curriculum'
import { LEGACY_COPY, LEGACY_FIELD_COPY } from '@/declarations/academy/legacy/copy'
import { LEGACY_TRADES, modulesForTrade } from '@/declarations/academy/legacy'
import { LEGACY_SETTINGS } from '@/declarations/configurations/settings'
import { LEGACY_FUNCTION_OF } from '@/declarations/reference/fixed'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { LegacyModuleView, LegacyTrackDetail, LegacyTrackSummary } from '@/types/legacy'
import { LegacyStatuses, MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { LegacyStatusName } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

// Everything a track view reads
const TRACK_INCLUDE = {
  account: { select: { displayName: true, avatarUrl: true } },
  jobFunction: { select: { name: true } },
  decidedBy: { select: { displayName: true } },
  results: { include: { gradedBy: { select: { displayName: true } } } },
} satisfies Prisma.LegacyTrackInclude

type TrackRow = Prisma.LegacyTrackGetPayload<{ include: typeof TRACK_INCLUDE }>

/**
 * Modules of a track with what each earned
 * @param {TrackRow} row - Track row
 * @return {LegacyModuleView[]} - Modules in order
 */

const toModules = (row: TrackRow): LegacyModuleView[] =>
  modulesForTrade(row.jobFunction?.name ?? null).map((course) => {
    const result = row.results.find((entry) => entry.moduleKey === course.key)
    const progress = readProgress(result?.progress)
    const score = scoreModule(course, progress, result?.evaluatorScore ?? null)
    const exercises = exercisesOf(course)

    return {
      key: course.key,
      name: course.name,
      summary: course.summary,
      minutes: course.minutes,
      exercises: exercises.length,
      cleared: exercises.filter((block) => progress.blocks[block.key]?.passed).length,
      auto: score.auto,
      evaluator: result?.evaluatorScore ?? null,
      total: score.total,
      passed: score.passed,
      gradedByName: result?.gradedBy?.displayName ?? null,
    }
  })

/**
 * Shape one track
 * @param {TrackRow} row - Track row
 * @return {LegacyTrackDetail} - Track and its modules
 */

const toDetail = (row: TrackRow): LegacyTrackDetail => {
  const modules = toModules(row)

  return {
    summary: {
      id: row.id,
      accountId: row.accountId,
      memberName: row.account.displayName,
      avatarUrl: row.account.avatarUrl,
      functionName: row.jobFunction?.name ?? null,
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      status: row.status,
      decidedAt: row.decidedAt?.toISOString() ?? null,
      decidedByName: row.decidedBy?.displayName ?? null,
      outcome: outcomeOf(modules),
    },
    modules,
  }
}

/**
 * Read the function a track holder wears while it runs
 * @param {string | null} trade - Trade the future Responsable leads
 * @return {Promise<string | null>} - Function identifier
 */

const legacyFunctionId = async (trade: string | null): Promise<string | null> => {
  const name = trade ? LEGACY_FUNCTION_OF[trade] : undefined
  if (!name) return null

  const row = await prisma.jobFunction.findUnique({ where: { name }, select: { id: true } })

  return row?.id ?? null
}

/**
 * Build the form opening a track
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const legacyFields = async (): Promise<FieldDefinition[]> => {
  const [members, trades] = await Promise.all([
    prisma.account.findMany({
      where: {
        role: MemberRoles.Moderateur,
        status: MemberStatuses.Active,
        legacyTracks: { none: { status: LegacyStatuses.Running } },
      },
      select: { id: true, displayName: true, avatarUrl: true },
      orderBy: { displayName: 'asc' },
    }),
    prisma.jobFunction.findMany({
      where: { name: { in: [...LEGACY_TRADES] }, archived: false },
      select: { id: true, name: true },
      orderBy: { position: 'asc' },
    }),
  ])

  return [
    {
      name: 'accountId',
      kind: 'select',
      label: LEGACY_FIELD_COPY.member,
      info: LEGACY_FIELD_COPY.memberInfo,
      required: true,
      mark: 'avatar',
      options: members.map((member) => ({
        value: member.id,
        label: member.displayName,
        image: member.avatarUrl,
      })),
    },
    {
      name: 'functionId',
      kind: 'select',
      label: LEGACY_FIELD_COPY.trade,
      info: LEGACY_FIELD_COPY.tradeInfo,
      required: true,
      options: trades.map((trade) => ({ value: trade.id, label: trade.name })),
    },
    {
      name: 'startsAt',
      kind: 'date',
      label: LEGACY_FIELD_COPY.startsAt,
      preset: 'today',
      required: true,
      span: 'half',
    },
    {
      name: 'endsAt',
      kind: 'date',
      label: LEGACY_FIELD_COPY.endsAt,
      info: LEGACY_FIELD_COPY.endsInfo,
      required: true,
      span: 'half',
    },
  ]
}

/**
 * Read every track
 * @return {Promise<LegacyTrackSummary[]>} - Tracks
 */

export const listTracks = async (): Promise<LegacyTrackSummary[]> => {
  const rows = await prisma.legacyTrack.findMany({
    include: TRACK_INCLUDE,
    orderBy: [{ status: 'asc' }, { startsAt: 'desc' }],
  })

  return rows.map((row) => toDetail(row).summary)
}

/**
 * Read one track with its modules
 * @param {string} id - Track identifier
 * @return {Promise<LegacyTrackDetail>} - Track
 */

export const readTrack = async (id: string): Promise<LegacyTrackDetail> => {
  const row = await prisma.legacyTrack.findUnique({ where: { id }, include: TRACK_INCLUDE })
  if (!row) throw notFound()

  return toDetail(row)
}

/**
 * Open a track: a moderator, the trade they will lead, and the period they are released from
 * their events
 * @param {FormValues} values - Parsed body
 * @param {string} actorId - Who opens it
 * @return {Promise<LegacyTrackDetail>} - Track
 */

export const openTrack = async (
  values: FormValues,
  actorId: string
): Promise<LegacyTrackDetail> => {
  const accountId = readText(values, 'accountId')
  const functionId = readText(values, 'functionId')
  const startsAt = readDate(values, 'startsAt')
  const endsAt = readDate(values, 'endsAt')

  if (!accountId || !functionId || !startsAt || !endsAt) {
    throw invalidInput([{ field: 'accountId', message: LEGACY_FIELD_COPY.notFound }])
  }

  // Length inside the configured bounds
  const weeks = (endsAt.getTime() - startsAt.getTime()) / WEEK_MS
  if (weeks < LEGACY_SETTINGS.minWeeks) {
    throw invalidInput([
      {
        field: 'endsAt',
        message: LEGACY_FIELD_COPY.tooShort.replace('{min}', String(LEGACY_SETTINGS.minWeeks)),
      },
    ])
  }
  if (weeks > LEGACY_SETTINGS.maxWeeks) {
    throw invalidInput([
      {
        field: 'endsAt',
        message: LEGACY_FIELD_COPY.tooLong.replace('{max}', String(LEGACY_SETTINGS.maxWeeks)),
      },
    ])
  }

  const [account, trade, running] = await Promise.all([
    prisma.account.findUnique({ where: { id: accountId }, select: { role: true } }),
    prisma.jobFunction.findUnique({ where: { id: functionId }, select: { name: true } }),
    prisma.legacyTrack.count({ where: { accountId, status: LegacyStatuses.Running } }),
  ])
  if (!account || account.role !== MemberRoles.Moderateur) {
    throw invalidInput([{ field: 'accountId', message: LEGACY_FIELD_COPY.mustBeModerator }])
  }
  if (!trade || !LEGACY_TRADES.includes(trade.name)) {
    throw invalidInput([{ field: 'functionId', message: LEGACY_FIELD_COPY.notFound }])
  }
  if (running > 0) {
    throw invalidInput([{ field: 'accountId', message: LEGACY_FIELD_COPY.alreadyRunning }])
  }

  const row = await prisma.legacyTrack.create({
    data: {
      accountId,
      functionId,
      startsAt,
      endsAt,
      results: {
        create: modulesForTrade(trade.name).map((course) => ({ moduleKey: course.key })),
      },
    },
    include: TRACK_INCLUDE,
  })

  // Worn for as long as the track runs
  const juniorId = await legacyFunctionId(trade.name)
  if (juniorId) {
    await prisma.accountFunction.upsert({
      where: { accountId_functionId: { accountId, functionId: juniorId } },
      update: {},
      create: { accountId, functionId: juniorId },
    })
  }

  await recordEvent({
    eventType: 'LegacyChanged',
    actorId,
    subjectId: accountId,
    targetType: 'legacy',
    targetId: row.id,
    summary: trade.name,
  })

  return toDetail(row)
}

/**
 * Give the evaluator's note of one module
 * @param {string} trackId - Track identifier
 * @param {string} moduleKey - Module key
 * @param {number} score - Note out of the module maximum
 * @param {string} actorId - Who grades
 * @return {Promise<LegacyTrackDetail>} - Track
 */

export const gradeModule = async (
  trackId: string,
  moduleKey: string,
  score: number,
  actorId: string
): Promise<LegacyTrackDetail> => {
  if (!Number.isInteger(score) || score < 0 || score > LEGACY_SETTINGS.modulePoints) {
    throw invalidInput([
      {
        field: 'score',
        message: LEGACY_FIELD_COPY.gradeRange.replace(
          '{max}',
          String(LEGACY_SETTINGS.modulePoints)
        ),
      },
    ])
  }

  const track = await readTrackRow(trackId)
  const course = modulesForTrade(track.jobFunction?.name ?? null).find(
    (entry) => entry.key === moduleKey
  )
  if (!course) throw notFound()

  const existing = track.results.find((entry) => entry.moduleKey === moduleKey)
  const computed = scoreModule(course, readProgress(existing?.progress), score)

  await prisma.legacyModuleResult.upsert({
    where: { trackId_moduleKey: { trackId, moduleKey } },
    update: {
      evaluatorScore: score,
      autoScore: computed.auto,
      total: computed.total,
      passed: computed.passed,
      gradedById: actorId,
      gradedAt: new Date(),
    },
    create: {
      trackId,
      moduleKey,
      evaluatorScore: score,
      autoScore: computed.auto,
      total: computed.total,
      passed: computed.passed,
      gradedById: actorId,
      gradedAt: new Date(),
    },
  })

  await recordEvent({
    eventType: 'LegacyChanged',
    actorId,
    subjectId: track.accountId,
    targetType: 'legacy',
    targetId: trackId,
    summary: course.name,
  })

  return readTrack(trackId)
}

/**
 * Read one track row
 * @param {string} id - Track identifier
 * @return {Promise<TrackRow>} - Row
 */

const readTrackRow = async (id: string): Promise<TrackRow> => {
  const row = await prisma.legacyTrack.findUnique({ where: { id }, include: TRACK_INCLUDE })
  if (!row) throw notFound()

  return row
}

/**
 * Decide a running track. A success needs both thresholds and makes the member a Responsable
 * @param {string} trackId - Track identifier
 * @param {LegacyStatusName} decision - Passed
 * @param {string} actorId - Administrator who decides
 * @return {Promise<LegacyTrackDetail>} - Track
 */

export const decideTrack = async (
  trackId: string,
  decision: LegacyStatusName,
  actorId: string
): Promise<LegacyTrackDetail> => {
  const track = await readTrackRow(trackId)
  if (track.status !== LegacyStatuses.Running || decision === LegacyStatuses.Running) {
    throw invalidInput([{ field: 'decision', message: LEGACY_FIELD_COPY.notFound }])
  }

  if (decision === LegacyStatuses.Passed && !toDetail(track).summary.outcome.eligible) {
    throw invalidInput([{ field: 'decision', message: LEGACY_COPY.outcomeMissing }])
  }

  const juniorId = await legacyFunctionId(track.jobFunction?.name ?? null)

  await prisma.$transaction([
    prisma.legacyTrack.update({
      where: { id: trackId },
      data: { status: decision, decidedById: actorId, decidedAt: new Date() },
    }),
    // Whatever the verdict
    ...(juniorId
      ? [
          prisma.accountFunction.deleteMany({
            where: { accountId: track.accountId, functionId: juniorId },
          }),
        ]
      : []),
    ...(decision === LegacyStatuses.Passed
      ? [
          prisma.account.update({
            where: { id: track.accountId },
            data: { role: MemberRoles.Responsable },
          }),
        ]
      : []),
  ])

  await recordEvent({
    eventType: 'LegacyChanged',
    actorId,
    subjectId: track.accountId,
    targetType: 'legacy',
    targetId: trackId,
    summary: decision,
  })

  return readTrack(trackId)
}
