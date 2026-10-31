import 'server-only'

import crypto from 'crypto'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { candidateSession } from '@/core/services/recruitment'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { WRITTEN_CONTEXT_BY_KEY } from '@/declarations/recruitment/questionnaire/contexts'
import type { IntegrationCreator } from '@/types/onboarding'
import type { ExerciseLinkView } from '@/types/recruitment'
import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'
import { MINUTE_MS } from '@/utils/constants/time'

// Entropy of a public token
const TOKEN_BYTES = 24

// Latest links shown to the recruiter
const LISTED_LINKS = 6

/**
 * Everything the public page needs
 * @typedef {Object} ExerciseLinkContext
 */

export interface ExerciseLinkContext {
  id: string
  contextKey: string
  plays: number
  discordId: string
  platform: RecruitmentPlatformName
  creator: IntegrationCreator
}

// Candidate and campaign behind a link
const LINK_SHAPE = {
  candidate: {
    select: {
      discordId: true,
      session: {
        select: {
          platform: true,
          youtuber: {
            select: { id: true, name: true, accent: true, avatarUrl: true, bannerUrl: true },
          },
        },
      },
    },
  },
} as const

/**
 * Map a link row to its display shape
 * @param {Object} row - Link row
 * @return {ExerciseLinkView} - Display link
 */

const toView = (row: {
  id: string
  contextKey: string
  token: string
  plays: number
  claimedAt: Date | null
  expiresAt: Date
  expiredAt: Date | null
}): ExerciseLinkView => ({
  id: row.id,
  contextKey: row.contextKey,
  token: row.token,
  plays: row.plays,
  isClaimed: row.claimedAt !== null,
  expiresAt: row.expiresAt.toISOString(),
  isExpired: row.expiredAt !== null || row.expiresAt <= new Date(),
})

/**
 * Links handed to one candidate, newest first
 * @param {string} candidateId - Candidate identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<ExerciseLinkView[]>} - Latest links
 */

export const listLinks = async (
  candidateId: string,
  scope: AccessScope
): Promise<ExerciseLinkView[]> => {
  await candidateSession(candidateId, scope)

  const rows = await prisma.exerciseLink.findMany({
    where: { candidateId },
    orderBy: { createdAt: 'desc' },
    take: LISTED_LINKS,
  })

  return rows.map(toView)
}

/**
 * Hand out two fresh links, the previous ones stop working
 * @param {string} candidateId - Candidate identifier
 * @param {string[]} contextKeys - Contexts chosen
 * @param {AccessScope} scope - Perimeter
 * @param {string} actorId - Recruiter handing them out
 * @return {Promise<ExerciseLinkView[]>} - New links
 */

export const createLinks = async (
  candidateId: string,
  contextKeys: string[],
  scope: AccessScope,
  actorId: string
): Promise<ExerciseLinkView[]> => {
  await candidateSession(candidateId, scope)
  if (contextKeys.some((key) => !WRITTEN_CONTEXT_BY_KEY.has(key))) throw notFound()

  const now = new Date()
  const expiresAt = new Date(now.getTime() + EXERCISE_SETTINGS.linkTtlMinutes * MINUTE_MS)

  // Old links die with the new ones
  await prisma.exerciseLink.updateMany({
    where: { candidateId, expiredAt: null },
    data: { expiredAt: now },
  })

  const rows = await prisma.$transaction(
    contextKeys.map((contextKey) =>
      prisma.exerciseLink.create({
        data: {
          candidateId,
          contextKey,
          expiresAt,
          createdById: actorId,
          token: crypto.randomBytes(TOKEN_BYTES).toString('base64url'),
        },
      })
    )
  )

  return rows.map(toView)
}

/**
 * Cut a link short
 * @param {string} id - Link identifier
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<ExerciseLinkView>} - Link once expired
 */

export const expireLink = async (id: string, scope: AccessScope): Promise<ExerciseLinkView> => {
  const row = await prisma.exerciseLink.findUnique({ where: { id } })
  if (!row) throw notFound()

  await candidateSession(row.candidateId, scope)

  return toView(
    await prisma.exerciseLink.update({ where: { id }, data: { expiredAt: new Date() } })
  )
}

/**
 * Load a link still within its validity
 * @param {string} token - Public token
 * @return {Promise<ExerciseLinkContext & { claimToken: string | null }>} - Link and its context
 */

export const resolveExerciseLink = async (
  token: string
): Promise<ExerciseLinkContext & { claimToken: string | null }> => {
  const row = await prisma.exerciseLink.findUnique({ where: { token }, include: LINK_SHAPE })

  if (!row || row.expiredAt || row.expiresAt <= new Date()) throw notFound()

  return {
    id: row.id,
    contextKey: row.contextKey,
    plays: row.plays,
    claimToken: row.claimToken,
    discordId: row.candidate.discordId,
    platform: row.candidate.session.platform,
    creator: row.candidate.session.youtuber,
  }
}

/**
 * Bind the link to the browser of the candidate
 * @param {string} token - Public token
 * @param {DiscordIdentity} identity - Identity Discord returned
 * @return {Promise<string>} - Secret the browser keeps
 */

export const claimExerciseLink = async (
  token: string,
  identity: DiscordIdentity
): Promise<string> => {
  const link = await resolveExerciseLink(token)

  // Only the candidate's own account passes
  if (link.discordId !== identity.id) throw forbidden()

  const claimToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url')
  await prisma.exerciseLink.update({
    where: { id: link.id },
    data: { claimToken, claimedAt: new Date() },
  })

  return claimToken
}

/**
 * Count one playing of the situation
 * @param {string} token - Public token
 * @param {string} claimToken - Secret held by the browser
 * @return {Promise<number>} - Plays so far
 */

export const recordPlay = async (token: string, claimToken: string): Promise<number> => {
  const link = await resolveExerciseLink(token)
  if (!link.claimToken || link.claimToken !== claimToken) throw forbidden()

  // Capped in the query itself
  const { count } = await prisma.exerciseLink.updateMany({
    where: { id: link.id, plays: { lt: EXERCISE_SETTINGS.maxPlays } },
    data: { plays: { increment: 1 } },
  })
  if (count === 0) throw forbidden()

  return link.plays + 1
}
