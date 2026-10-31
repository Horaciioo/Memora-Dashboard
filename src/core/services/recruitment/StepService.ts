import 'server-only'

import { syncProgramProject } from '@/core/services/work/ProgramProjectService'
import { prisma } from '@/core/lib/db'
import { conflict } from '@/core/lib/errors'
import { canMoveStep, STEP_ORDER } from '@/core/lib/recruitment/stepState'
import { readDate, readFlag, readNumberValue, readText } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FormValues } from '@/types/forms'
import type { RecruitmentStepView } from '@/types/recruitment'
import { RecruitmentOwners } from '@/utils/constants/recruitment'
import type { RecruitmentOwnerName } from '@/utils/constants/recruitment'
import { DAY_MS } from '@/utils/constants/time'
import { toStep } from '@/core/services/recruitment/shape'
import { reachableSession, stepSession } from '@/core/services/recruitment/reach'

/**
 * Add a step to a session timeline
 * @param {string} sessionId - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentStepView>} - Timeline moment
 */

export const createStep = async (
  sessionId: string,
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentStepView> => {
  const session = await reachableSession(sessionId, scope)
  const offset = readNumberValue(values, 'offset') ?? 0
  const scheduledAt = readDate(values, 'scheduledAt')

  const last = await prisma.recruitmentStep.findFirst({
    where: { sessionId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const row = await prisma.recruitmentStep.create({
    data: {
      sessionId,
      title: readText(values, 'title') ?? '',
      notes: readText(values, 'notes'),
      owner: (readText(values, 'owner') ?? RecruitmentOwners.Responsable) as RecruitmentOwnerName,
      offset,
      // An explicit day wins
      scheduledAt:
        scheduledAt ??
        (session.opensAt ? new Date(session.opensAt.getTime() + offset * DAY_MS) : null),
      required: readFlag(values, 'required'),
      position: (last?.position ?? 0) + FORM_SETTINGS.positionStep,
    },
  })
  await syncProgramProject(sessionId)

  return toStep(row)
}

/**
 * Edit a timeline step
 * @param {string} id - Step identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentStepView>} - Timeline moment
 */

export const updateStep = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentStepView> => {
  await stepSession(id, scope)

  const row = await prisma.recruitmentStep.update({
    where: { id },
    data: {
      title: readText(values, 'title') ?? undefined,
      notes: readText(values, 'notes'),
      owner: (readText(values, 'owner') ?? undefined) as RecruitmentOwnerName | undefined,
      offset: readNumberValue(values, 'offset') ?? undefined,
      scheduledAt: readDate(values, 'scheduledAt'),
      required: readFlag(values, 'required'),
    },
  })
  await syncProgramProject(row.sessionId)

  return toStep(row)
}

/**
 * Clear or reopen a timeline step
 * @param {string} id - Step identifier
 * @param {boolean} done - Cleared
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentStepView>} - Timeline moment
 */

export const setStepDone = async (
  id: string,
  done: boolean,
  scope: AccessScope
): Promise<RecruitmentStepView> => {
  const sessionId = await stepSession(id, scope)

  // Steps are cleared one after the other
  const steps = await prisma.recruitmentStep.findMany({
    where: { sessionId },
    orderBy: [...STEP_ORDER],
    select: { id: true, doneAt: true },
  })
  if (!canMoveStep(steps, id, done)) throw conflict()

  const row = await prisma.recruitmentStep.update({
    where: { id },
    data: { doneAt: done ? new Date() : null },
  })
  await syncProgramProject(row.sessionId)

  return toStep(row)
}

/**
 * Drop a timeline step
 * @param {string} id - Step identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Dropped
 */

export const removeStep = async (id: string, scope: AccessScope): Promise<void> => {
  const sessionId = await stepSession(id, scope)
  await prisma.recruitmentStep.delete({ where: { id } })
  await syncProgramProject(sessionId)
}
