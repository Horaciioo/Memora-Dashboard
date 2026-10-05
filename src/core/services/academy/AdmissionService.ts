import 'server-only'

import { prisma } from '@/core/lib/db'
import { instantiateJuniorSteps } from '@/core/services/academy/timelineSteps'
import { JUNIOR_FUNCTION_OF } from '@/declarations/reference/fixed'
import { AcademyJuniorStatuses, MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Read the junior function a trade trains through
 * @param {string} functionId - Function the campaign recruits for
 * @return {Promise<string>} - Function identifier held during the PIM
 */

const juniorFunctionId = async (functionId: string): Promise<string> => {
  const trade = await prisma.jobFunction.findUniqueOrThrow({
    where: { id: functionId },
    select: { name: true },
  })
  const juniorName = JUNIOR_FUNCTION_OF[trade.name]
  if (!juniorName) return functionId

  const junior = await prisma.jobFunction.findUnique({
    where: { name: juniorName },
    select: { id: true },
  })

  return junior?.id ?? functionId
}

/**
 * Open the file of an admitted candidate
 * @param {Object} candidate - Admitted application
 * @param {string} candidate.discordId - Discord identifier
 * @param {string | null} candidate.displayName - Pseudonym given at application
 * @param {string} youtuberId - Creator recruiting
 * @param {string} functionId - Function recruited for
 * @return {Promise<string>} - Account identifier
 */

const admittedAccount = async (
  candidate: { discordId: string; displayName: string | null },
  youtuberId: string,
  functionId: string
): Promise<string> => {
  const trainingFunctionId = await juniorFunctionId(functionId)
  const known = await prisma.account.findUnique({
    where: { discordId: candidate.discordId },
    select: { id: true },
  })

  // A member changing trade keeps their role
  if (known) {
    await prisma.accountFunction.upsert({
      where: {
        accountId_functionId: { accountId: known.id, functionId: trainingFunctionId },
      },
      update: {},
      create: { accountId: known.id, functionId: trainingFunctionId },
    })

    return known.id
  }

  const account = await prisma.account.create({
    data: {
      discordId: candidate.discordId,
      displayName: candidate.displayName ?? candidate.discordId,
      role: MemberRoles.Junior,
      // Pending until the integration form confirms the file
      status: MemberStatuses.Pending,
      youtubers: { connect: { id: youtuberId } },
      functions: { create: { functionId: trainingFunctionId } },
    },
    select: { id: true },
  })

  return account.id
}

/**
 * Take back a seat nobody confirmed yet
 * @param {Object} junior - Seat to take back
 * @param {string} junior.id - Junior identifier
 * @param {string} junior.accountId - Account holding it
 * @return {Promise<void>} - Withdrawn
 */

const withdrawAdmission = async (junior: { id: string; accountId: string }): Promise<void> => {
  await prisma.academyJunior.delete({ where: { id: junior.id } })

  // Only a file never confirmed nor ever signed into is the automation's own to drop
  await prisma.account.deleteMany({
    where: {
      id: junior.accountId,
      role: MemberRoles.Junior,
      status: MemberStatuses.Pending,
      sessions: { none: {} },
      academyJuniors: { none: {} },
    },
  })
}

/**
 * Keep the promotion in step with one application
 * @param {string} candidateId - Application identifier
 * @return {Promise<void>} - Synced
 */

export const syncAdmission = async (candidateId: string): Promise<void> => {
  const candidate = await prisma.recruitmentCandidate.findUnique({
    where: { id: candidateId },
    include: {
      outcome: { select: { admits: true } },
      admission: { select: { id: true, accountId: true, confirmedAt: true } },
      session: {
        select: {
          youtuberId: true,
          functionId: true,
          academySession: { select: { id: true, functionId: true, startsAt: true } },
        },
      },
    },
  })
  if (!candidate) return

  const promotion = candidate.session.academySession
  const admitted = candidate.outcome?.admits === true && promotion !== null

  // A confirmed seat belongs to the junior now
  if (candidate.admission?.confirmedAt) return

  if (!admitted) {
    if (candidate.admission) await withdrawAdmission(candidate.admission)
    return
  }

  if (candidate.admission) return

  const accountId = await admittedAccount(
    candidate,
    candidate.session.youtuberId,
    candidate.session.functionId
  )

  // An account already seated on this promotion is only linked to its application
  const seated = await prisma.academyJunior.findUnique({
    where: { sessionId_accountId: { sessionId: promotion.id, accountId } },
    select: { id: true, candidateId: true },
  })

  if (seated) {
    if (!seated.candidateId) {
      await prisma.academyJunior.update({ where: { id: seated.id }, data: { candidateId } })
    }
    return
  }

  const junior = await prisma.academyJunior.create({
    data: {
      sessionId: promotion.id,
      accountId,
      candidateId,
      status: AcademyJuniorStatuses.Active,
    },
  })

  // The shared trame lands now
  await instantiateJuniorSteps(
    junior.id,
    promotion.id,
    promotion.functionId,
    null,
    promotion.startsAt
  )
}

/**
 * The admitted seat one Discord identity holds on a promotion
 * @typedef {Object} PendingAdmission
 * @property {string} juniorId - Junior identifier
 * @property {string} accountId - Pre-generated account
 * @property {string} sessionName - Promotion name
 * @property {string} functionName - Function trained for
 */

export interface PendingAdmission {
  juniorId: string
  accountId: string
  sessionName: string
  functionName: string
}

/**
 * Look an identity up among the admitted candidates of a promotion
 * @param {string} sessionId - Academy session identifier
 * @param {string} discordId - Discord identifier resolved by Discord itself
 * @return {Promise<PendingAdmission | null>} - Seat to confirm
 */

export const findAdmission = async (
  sessionId: string,
  discordId: string
): Promise<PendingAdmission | null> => {
  // A seat opens to its form once a responsable declared the PIM start
  const row = await prisma.academyJunior.findFirst({
    where: { sessionId, account: { discordId }, confirmedAt: null, kickoffAt: { not: null } },
    select: {
      id: true,
      accountId: true,
      session: { select: { summary: true, jobFunction: { select: { name: true } } } },
    },
  })

  if (!row) return null

  return {
    juniorId: row.id,
    accountId: row.accountId,
    sessionName: row.session.summary ?? row.session.jobFunction.name,
    functionName: row.session.jobFunction.name,
  }
}

/**
 * Swap the junior function for the trade it trained for
 * @param {string} accountId - Graduating account
 * @param {string} functionId - Trade the session trained for
 * @return {Promise<void>} - Applied
 */

export const graduateAccount = async (accountId: string, functionId: string): Promise<void> => {
  const trainingFunctionId = await juniorFunctionId(functionId)

  await prisma.$transaction([
    ...(trainingFunctionId === functionId
      ? []
      : [
          prisma.accountFunction.deleteMany({
            where: { accountId, functionId: trainingFunctionId },
          }),
        ]),
    prisma.accountFunction.upsert({
      where: { accountId_functionId: { accountId, functionId } },
      update: {},
      create: { accountId, functionId },
    }),
    // A junior becomes a moderator
    prisma.account.updateMany({
      where: { id: accountId, role: MemberRoles.Junior },
      data: { role: MemberRoles.Moderateur },
    }),
    prisma.account.update({ where: { id: accountId }, data: { status: MemberStatuses.Active } }),
  ])
}
