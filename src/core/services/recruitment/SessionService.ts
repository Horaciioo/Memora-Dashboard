import 'server-only'

import { syncProgramProject } from '@/core/services/work/ProgramProjectService'
import { prisma } from '@/core/lib/db'
import { sessionNumbers } from '@/core/services/academy/AcademyService'
import { notFound } from '@/core/lib/errors'
import { STEP_ORDER } from '@/core/lib/recruitment/stepState'
import { readDateRange, readList, readText } from '@/core/lib/forms/values'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { JUNIOR_FUNCTION_OF } from '@/declarations/reference/fixed'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { INTEGRATION_STEP } from '@/declarations/recruitment/outcomes'
import { PLATFORM_OF_TRADE } from '@/declarations/recruitment/registries'
import { recommendedKeys } from '@/core/lib/recruitment/questionnaire'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import type { FormValues } from '@/types/forms'
import type { RecruitmentSummary } from '@/types/recruitment'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { sessionTitle } from '@/utils/format/academy'
import { RecruitmentPlatforms, RecruitmentStatuses } from '@/utils/constants/recruitment'
import type { RecruitmentPlatformName, RecruitmentStatusName } from '@/utils/constants/recruitment'
import { DAY_MS } from '@/utils/constants/time'
import { rethrow, SUMMARY_INCLUDE, toSummary } from '@/core/services/recruitment/shape'
import { reachableSession } from '@/core/services/recruitment/reach'

/**
 * Rows matching a session
 * @param {string} youtuberId - Creator of the session
 * @param {string} functionId - Post of the session
 * @return {object} - Where clause
 */

export const trameFilter = (youtuberId: string, functionId: string) => ({
  archived: false,
  AND: [
    { OR: [{ youtuberId: null }, { youtuberId }] },
    { OR: [{ functionId: null }, { functionId }] },
  ],
})

/**
 * Platform a function recruits on
 * @param {string} functionName - Function recruited for
 * @return {RecruitmentPlatformName} - Platform
 */

const platformOf = (functionName: string): RecruitmentPlatformName =>
  PLATFORM_OF_TRADE[tradeOfFunction(functionName)] ?? RecruitmentPlatforms.Discord

/**
 * Opening and closing days of a submitted period
 * @param {FormValues} values - Parsed body
 * @return {{ opensAt: Date | null, closesAt: Date | null }} - Days
 */

const readPeriod = (values: FormValues): { opensAt: Date | null; closesAt: Date | null } => {
  const range = readDateRange(values, 'period')

  return { opensAt: range?.[0] ?? null, closesAt: range?.[1] ?? null }
}

/**
 * Open a session and lay its declared trame on the timeline
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary>} - Session header
 */

export const createSession = async (
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentSummary> => {
  const youtuberId = readText(values, 'youtuberId') ?? ''
  const functionId = readText(values, 'functionId') ?? ''
  const { opensAt, closesAt } = readPeriod(values)

  if (!scope.isGlobal && !scope.youtuberIds.includes(youtuberId)) throw notFound()

  const recruited = await prisma.jobFunction.findUniqueOrThrow({
    where: { id: functionId },
    select: { name: true },
  })
  if (!Object.hasOwn(JUNIOR_FUNCTION_OF, recruited.name)) throw notFound()
  const platform = platformOf(recruited.name)

  const templates = await prisma.recruitmentStepTemplate.findMany({
    where: trameFilter(youtuberId, functionId),
    orderBy: [...STEP_ORDER],
  })

  const closingOffset = templates.reduce((last, template) => Math.max(last, template.offset), 0)

  // A campaign always feeds a promotion
  const academySession = await prisma.academySession.create({
    data: {
      functionId,
      startsAt: closesAt ?? opensAt ?? new Date(),
      status: AcademySessionStatuses.Draft,
    },
  })

  // The campaign takes the title of the promotion it feeds
  const name = sessionTitle({
    function: { name: recruited.name },
    number: (await sessionNumbers()).get(academySession.id) ?? 1,
  })

  const row = await prisma.recruitmentSession
    .create({
      data: {
        name,
        youtuberId,
        functionId,
        academySessionId: academySession.id,
        platform,
        questionKeys: recommendedKeys(platform),
        status: (readText(values, 'status') ?? RecruitmentStatuses.Draft) as RecruitmentStatusName,
        summary: readText(values, 'summary'),
        opensAt,
        closesAt,
        responsables: {
          create: readList(values, 'responsableIds').map((accountId) => ({ accountId })),
        },
        recruiters: {
          create: readList(values, 'recruiterIds').map((accountId) => ({ accountId })),
        },
        observers: {
          create: readList(values, 'observerIds').map((accountId) => ({ accountId })),
        },
        steps: {
          create: [
            ...templates.map((template, index) => ({
              templateId: template.id,
              title: template.title,
              notes: template.description,
              owner: template.owner,
              offset: template.offset,
              // A step only lands on a day once the session knows when it opens
              scheduledAt: opensAt ? new Date(opensAt.getTime() + template.offset * DAY_MS) : null,
              required: template.required,
              position: index * FORM_SETTINGS.positionStep,
            })),
            // The campaign always closes on handing out the integration form
            {
              title: INTEGRATION_STEP.title,
              notes: INTEGRATION_STEP.description,
              owner: INTEGRATION_STEP.owner,
              offset: closingOffset,
              scheduledAt: opensAt ? new Date(opensAt.getTime() + closingOffset * DAY_MS) : null,
              required: INTEGRATION_STEP.required,
              emitsInvite: true,
              position: templates.length * FORM_SETTINGS.positionStep,
            },
          ],
        },
      },
      include: SUMMARY_INCLUDE,
    })
    .catch(async (error: unknown) => {
      // A refused campaign never leaves its promotion behind
      await prisma.academySession.delete({ where: { id: academySession.id } })

      return rethrow(error)
    })

  await syncProgramProject(row.id)

  return toSummary(row, await sessionNumbers(), 0)
}

/**
 * Edit a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<RecruitmentSummary>} - Session header
 */

export const updateSession = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<RecruitmentSummary> => {
  await reachableSession(id, scope)

  const { opensAt, closesAt } = readPeriod(values)

  // Observer seats kept stay in place, dropped ones leave their interviews
  const observerIds = readList(values, 'observerIds')
  const dropped = { sessionId: id, accountId: { notIn: observerIds } }
  const kept = await prisma.recruitmentObserver.findMany({
    where: { sessionId: id, accountId: { in: observerIds } },
    select: { accountId: true },
  })
  const keptIds = new Set(kept.map((seat) => seat.accountId))

  // The responsable and recruiter seats are replaced wholesale
  const [, , , , , , , , row] = await prisma
    .$transaction([
      prisma.recruitmentSession.update({
        where: { id },
        data: {
          status: (readText(values, 'status') ?? undefined) as RecruitmentStatusName | undefined,
          summary: readText(values, 'summary'),
          opensAt,
          closesAt,
        },
      }),
      prisma.recruitmentResponsable.deleteMany({ where: { sessionId: id } }),
      prisma.recruitmentResponsable.createMany({
        data: readList(values, 'responsableIds').map((accountId) => ({ sessionId: id, accountId })),
      }),
      prisma.recruitmentRecruiter.deleteMany({ where: { sessionId: id } }),
      prisma.recruitmentRecruiter.createMany({
        data: readList(values, 'recruiterIds').map((accountId) => ({ sessionId: id, accountId })),
      }),
      prisma.recruitmentSeat.deleteMany({
        where: { accountId: { notIn: observerIds }, candidate: { sessionId: id } },
      }),
      prisma.recruitmentObserver.deleteMany({ where: dropped }),
      prisma.recruitmentObserver.createMany({
        data: observerIds
          .filter((accountId) => !keptIds.has(accountId))
          .map((accountId) => ({ sessionId: id, accountId })),
      }),
      prisma.recruitmentSession.findUniqueOrThrow({ where: { id }, include: SUMMARY_INCLUDE }),
    ])
    .catch(rethrow)

  await syncProgramProject(id)

  const attended = await prisma.recruitmentCandidate.count({
    where: { sessionId: id, verdictAt: { not: null } },
  })

  return toSummary(row, await sessionNumbers(), attended)
}

/**
 * Write the consignes of a session
 * @param {string} id - Session identifier
 * @param {FormValues} values - Parsed body
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<string>} - Consignes in force
 */

export const saveInstructions = async (
  id: string,
  values: FormValues,
  scope: AccessScope
): Promise<string> => {
  await reachableSession(id, scope)

  const row = await prisma.recruitmentSession.update({
    where: { id },
    data: { instructions: readText(values, 'instructions') ?? '' },
    select: { instructions: true },
  })

  return row.instructions
}

/**
 * Drop a session
 * @param {string} id - Session identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<void>} - Dropped
 */

export const removeSession = async (id: string, scope: AccessScope): Promise<void> => {
  await reachableSession(id, scope)
  await prisma.recruitmentSession.delete({ where: { id } })
}
