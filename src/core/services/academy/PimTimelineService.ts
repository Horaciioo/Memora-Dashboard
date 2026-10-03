import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PIM_DESTINATION_REGISTRY } from '@/declarations/academy/guides'
import type { PimDestinationName } from '@/declarations/academy/guides'
import { ACADEMY_STAGE_REGISTRY } from '@/declarations/academy/registries'
import { isIconName } from '@/declarations/ui/icons'
import type { PimTimeline, PimTimelineLock, PimTimelineStep } from '@/types/academy'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
} from '@/utils/constants/hierarchy'
import type { AcademyStageName } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

// Stages only a validated check-in opens, never a click on the timeline
const REVIEW_GATED: AcademyStageName[] = [AcademyStages.Practice, AcademyStages.Bonus]

// Stage rank on the PIM
const stageRank = (stage: AcademyStageName): number => ACADEMY_STAGE_REGISTRY.keys.indexOf(stage)

// Everything a timeline row needs
const STEP_SHAPE = {
  template: { select: { position: true, icon: true, guide: true, destination: true } },
  validator: { select: { displayName: true } },
} satisfies Prisma.AcademyStepInclude

type StepRow = Prisma.AcademyStepGetPayload<{ include: typeof STEP_SHAPE }>

/**
 * Order the steps of one junior the way the PIM runs them
 * @param {StepRow[]} rows - Timeline rows
 * @return {StepRow[]} - Rows, first to last
 */

const inRunOrder = (rows: StepRow[]): StepRow[] =>
  [...rows].sort(
    (left, right) =>
      stageRank(left.stage ?? AcademyStages.Preparation) -
        stageRank(right.stage ?? AcademyStages.Preparation) ||
      (left.template?.position ?? 0) - (right.template?.position ?? 0) ||
      (left.offset ?? 0) - (right.offset ?? 0) ||
      left.createdAt.getTime() - right.createdAt.getTime()
  )

/**
 * Read a junior with what locks their timeline
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<object>} - Junior with its session status
 */

const readJuniorState = async (juniorId: string, scope: Prisma.AcademySessionWhereInput) => {
  const junior = await prisma.academyJunior.findFirst({
    where: { id: juniorId, session: scope },
    select: {
      id: true,
      stage: true,
      status: true,
      sessionId: true,
      session: { select: { status: true } },
    },
  })
  if (!junior) throw notFound()

  return junior
}

/**
 * Tell why the step in course cannot move yet
 * @param {object} junior - Junior with its session status
 * @param {StepRow | undefined} current - Step in course
 * @return {PimTimelineLock | null} - Lock, or none
 */

const lockOf = (
  junior: { stage: AcademyStageName; status: string; session: { status: string } },
  current: StepRow | undefined
): PimTimelineLock | null => {
  if (junior.status !== AcademyJuniorStatuses.Active) return 'closed'
  if (junior.session.status !== AcademySessionStatuses.Running) return 'notStarted'
  if (!current?.stage) return null

  // A check-in decision alone crosses into practice or bonus
  const ahead = stageRank(current.stage) > stageRank(junior.stage)
  if (ahead && REVIEW_GATED.includes(current.stage)) return 'awaitingReview'

  return null
}

/**
 * Shape one timeline row
 * @param {StepRow} row - Timeline row
 * @param {string | null} currentId - Step in course
 * @return {PimTimelineStep} - Step view
 */

const toTimelineStep = (row: StepRow, currentId: string | null): PimTimelineStep => {
  const destination = row.template?.destination
  const icon = row.template?.icon

  return {
    id: row.id,
    title: row.title,
    description: row.notes,
    guide: row.template?.guide ?? null,
    icon: icon && isIconName(icon) ? icon : null,
    destination:
      destination && PIM_DESTINATION_REGISTRY.has(destination)
        ? (destination as PimDestinationName)
        : null,
    stage: row.stage ?? AcademyStages.Preparation,
    owner: row.owner,
    required: row.required,
    scheduledAt: row.scheduledAt?.toISOString() ?? null,
    validatedAt: row.validatedAt?.toISOString() ?? null,
    validatedByName: row.validator?.displayName ?? null,
    position: row.validatedAt ? 'done' : row.id === currentId ? 'current' : 'upcoming',
  }
}

/**
 * Read the vertical timeline of one junior, the step in course first to act on
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @return {Promise<PimTimeline>} - Timeline
 */

export const readTimeline = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput
): Promise<PimTimeline> => {
  const junior = await readJuniorState(juniorId, scope)
  const rows = inRunOrder(
    await prisma.academyStep.findMany({
      where: { juniorId, stage: { not: null } },
      include: STEP_SHAPE,
    })
  )

  const current = rows.find((row) => row.validatedAt === null)

  return {
    juniorId,
    sessionId: junior.sessionId,
    stage: junior.stage,
    currentId: current?.id ?? null,
    lock: lockOf(junior, current),
    steps: rows.map((row) => toTimelineStep(row, current?.id ?? null)),
  }
}

/**
 * Clear the step in course and light the next one, the junior's stage following along
 * @param {string} juniorId - Junior identifier
 * @param {Prisma.AcademySessionWhereInput} scope - Visibility fragment
 * @param {string} actorId - Responsable moving the timeline
 * @return {Promise<PimTimeline>} - Timeline after the move
 */

export const advanceTimeline = async (
  juniorId: string,
  scope: Prisma.AcademySessionWhereInput,
  actorId: string
): Promise<PimTimeline> => {
  const timeline = await readTimeline(juniorId, scope)
  if (!timeline.currentId) throw conflict(ACADEMY_COPY.timelineFinished)
  if (timeline.lock) throw conflict(ACADEMY_COPY.timelineLocks[timeline.lock])

  const index = timeline.steps.findIndex((step) => step.id === timeline.currentId)
  const current = timeline.steps[index]
  const next = timeline.steps[index + 1]

  // The stage moves with the timeline, except into a stage a check-in opens
  const target = [current?.stage, next?.stage]
    .filter((stage): stage is AcademyStageName => Boolean(stage))
    .filter((stage) => !REVIEW_GATED.includes(stage))
    .reduce<AcademyStageName>(
      (furthest, stage) => (stageRank(stage) > stageRank(furthest) ? stage : furthest),
      timeline.stage
    )

  await prisma.$transaction([
    prisma.academyStep.update({
      where: { id: timeline.currentId },
      data: { validatedAt: new Date(), validatedById: actorId },
    }),
    prisma.academyJunior.update({ where: { id: juniorId }, data: { stage: target } }),
  ])

  return readTimeline(juniorId, scope)
}

/**
 * Step in course of one junior, with who it waits for
 * @typedef {Object} OpenStep
 * @property {string} juniorId - Junior identifier
 * @property {string} sessionId - Promotion identifier
 * @property {string} juniorName - Junior display name
 * @property {PimTimelineStep} step - Step in course
 */

export interface OpenStep {
  juniorId: string
  sessionId: string
  juniorName: string
  step: PimTimelineStep
}

/**
 * Read the step in course of every running junior matching a filter, in two queries
 * @param {Prisma.AcademyJuniorWhereInput} where - Juniors concerned
 * @return {Promise<OpenStep[]>} - Steps in course, one per junior at most
 */

export const openSteps = async (where: Prisma.AcademyJuniorWhereInput): Promise<OpenStep[]> => {
  const juniors = await prisma.academyJunior.findMany({
    where: {
      ...where,
      status: AcademyJuniorStatuses.Active,
      session: { status: AcademySessionStatuses.Running },
    },
    select: {
      id: true,
      sessionId: true,
      stage: true,
      account: { select: { displayName: true } },
    },
  })
  if (juniors.length === 0) return []

  const rows = await prisma.academyStep.findMany({
    where: {
      juniorId: { in: juniors.map((junior) => junior.id) },
      stage: { not: null },
      validatedAt: null,
    },
    include: STEP_SHAPE,
  })

  return juniors.flatMap((junior) => {
    const current = inRunOrder(rows.filter((row) => row.juniorId === junior.id))[0]
    if (!current?.stage) return []

    // A step behind a check-in waits for the decision, not for a task
    const gated =
      stageRank(current.stage) > stageRank(junior.stage) && REVIEW_GATED.includes(current.stage)
    if (gated) return []

    return [
      {
        juniorId: junior.id,
        sessionId: junior.sessionId,
        juniorName: junior.account.displayName,
        step: toTimelineStep(current, current.id),
      },
    ]
  })
}
