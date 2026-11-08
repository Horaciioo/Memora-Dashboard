import { syncFunctionTeams } from '@/core/services/teams/FunctionTeamService'
import 'server-only'

import { prisma } from '@/core/lib/db'
import { isAdmissionOpen } from '@/core/lib/recruitment/closure'
import { JUNIOR_FUNCTION_OF, tradeOfFunction } from '@/declarations/reference/fixed'
import {
  AcademyJuniorStatuses,
  GONE_MEMBER_STATUSES,
  MemberRoles,
  MemberStatuses,
} from '@/utils/constants/hierarchy'

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
    select: { id: true, status: true },
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
    await prisma.account.update({
      where: { id: known.id },
      data: {
        youtubers: { connect: { id: youtuberId } },
        // A former member starts over
        ...(GONE_MEMBER_STATUSES.includes(known.status)
          ? {
              role: MemberRoles.Junior,
              status: MemberStatuses.Pending,
              leftAt: null,
              anonymisedAt: null,
            }
          : {}),
      },
    })
    await syncFunctionTeams([known.id])

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
  await syncFunctionTeams([account.id])

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
 * Keep the promotion in step with one application, nothing is stored before the closure
 * @param {string} candidateId - Application identifier
 * @param {boolean} [isClosing] - Session is closing right now
 * @return {Promise<void>} - Synced
 */

export const syncAdmission = async (candidateId: string, isClosing = false): Promise<void> => {
  const candidate = await prisma.recruitmentCandidate.findUnique({
    where: { id: candidateId },
    include: {
      outcome: { select: { admits: true } },
      admission: { select: { id: true, accountId: true, confirmedAt: true } },
      session: {
        select: {
          status: true,
          invite: { select: { id: true } },
          accountsActivatedAt: true,
          youtuberId: true,
          functionId: true,
          academySession: { select: { id: true, functionId: true, startsAt: true } },
        },
      },
    },
  })
  if (!candidate) return

  const promotion = candidate.session.academySession
  // A session that closed admits at once the ones accepted later
  // Opened accounts admit too, so does an emitted link
  const isClosed =
    candidate.session.accountsActivatedAt !== null ||
    candidate.session.invite !== null ||
    isAdmissionOpen(candidate.session.status, isClosing)
  const admitted = candidate.outcome?.admits === true && promotion !== null && isClosed

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

  await prisma.academyJunior.create({
    data: {
      sessionId: promotion.id,
      accountId,
      candidateId,
      status: AcademyJuniorStatuses.Active,
    },
  })
}

/**
 * Admit every accepted candidate of a closing session
 * @param {string} sessionId - Recruitment session identifier
 * @return {Promise<string[]>} - Candidates that failed
 */

export const admitSession = async (sessionId: string): Promise<string[]> => {
  const accepted = await prisma.recruitmentCandidate.findMany({
    where: { sessionId, outcome: { admits: true } },
    select: { id: true, discordId: true, displayName: true },
  })
  const failed: string[] = []

  // One failure never stops the others
  for (const candidate of accepted) {
    await syncAdmission(candidate.id, true).catch(() =>
      failed.push(candidate.displayName ?? candidate.discordId)
    )
  }

  return failed
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
  const row = await prisma.academyJunior.findFirst({
    where: { sessionId, account: { discordId }, confirmedAt: null },
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
 * Hold the training function
 * @param {string} accountId - Member
 * @param {string} functionId - Trade trained for
 * @return {Promise<void>} - Held
 */

export const holdTrainingFunction = async (
  accountId: string,
  functionId: string
): Promise<void> => {
  const trainingFunctionId = await juniorFunctionId(functionId)

  await prisma.accountFunction.upsert({
    where: { accountId_functionId: { accountId, functionId: trainingFunctionId } },
    update: {},
    create: { accountId, functionId: trainingFunctionId },
  })
  await syncFunctionTeams([accountId])
}

/**
 * Take a member off the team
 * @param {string} accountId - Failed member
 * @param {string} functionId - Trade trained for
 * @return {Promise<void>} - Released
 */

export const releaseAccount = async (accountId: string, functionId: string): Promise<void> => {
  const trainingFunctionId = await juniorFunctionId(functionId)

  await prisma.accountFunction.deleteMany({ where: { accountId, functionId: trainingFunctionId } })
  await syncFunctionTeams([accountId])
}

/**
 * Swap the junior function for the trade it trained for
 * @param {string} accountId - Graduating account
 * @param {string} sessionFunctionId - Promotion function
 * @return {Promise<void>} - Applied
 */

export const graduateAccount = async (
  accountId: string,
  sessionFunctionId: string
): Promise<void> => {
  // A promotion may name the junior function
  const held = await prisma.jobFunction.findUniqueOrThrow({
    where: { id: sessionFunctionId },
    select: { name: true },
  })
  const trade = await prisma.jobFunction.findUnique({
    where: { name: tradeOfFunction(held.name) },
    select: { id: true },
  })
  const functionId = trade?.id ?? sessionFunctionId
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
  await syncFunctionTeams([accountId])
}
