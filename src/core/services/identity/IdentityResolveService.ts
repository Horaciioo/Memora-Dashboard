import 'server-only'

import crypto from 'crypto'

import type { Prisma } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { discordAvatarUrl } from '@/declarations/access/discord'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { IDENTITY_COPY } from '@/declarations/onboarding/welcome'
import type { IdentityCandidate, IdentityEscalation, IdentityPreview } from '@/types/identity'
import { GLOBAL_ROLES } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { IdentityCheckStatuses } from '@/utils/constants/identity'
import { DAY_MS } from '@/utils/constants/time'

// A Discord identifier is a snowflake
const DISCORD_ID = /^\d{17,20}$/

// Choices offered to one responsable
const CHOICE_LIMIT = 40

/**
 * Member asking
 * @typedef {Object} Resolver
 * @property {string} id - Account identifier
 * @property {MemberRoleName} role - Hierarchy level
 */

export interface Resolver {
  id: string
  role: MemberRoleName
}

/**
 * Applications a responsable carries, accepted and not yet confirmed
 * @param {Resolver} actor - Member asking
 * @return {Prisma.RecruitmentCandidateWhereInput} - Filter
 */

const reachable = (actor: Resolver): Prisma.RecruitmentCandidateWhereInput => ({
  outcome: { admits: true },
  NOT: { admission: { confirmedAt: { not: null } } },
  session: {
    accountsActivatedAt: { not: null },
    ...(GLOBAL_ROLES.includes(actor.role)
      ? {}
      : { responsables: { some: { accountId: actor.id } } }),
  },
})

/**
 * Read an escalation with the applications one may attach
 * @param {string} id - Check identifier
 * @param {Resolver} actor - Member asking
 * @return {Promise<IdentityEscalation>} - Case
 */

export const readEscalation = async (id: string, actor: Resolver): Promise<IdentityEscalation> => {
  const check = await prisma.identityCheck.findUnique({ where: { id } })
  if (!check || check.status !== IdentityCheckStatuses.Escalated) throw notFound()

  const rows = await prisma.recruitmentCandidate.findMany({
    where: { ...reachable(actor), ...(check.candidateId ? { id: check.candidateId } : {}) },
    orderBy: { displayName: 'asc' },
    take: CHOICE_LIMIT,
    select: { id: true, displayName: true, discordId: true, session: { select: { name: true } } },
  })

  const choices: IdentityCandidate[] = rows.map((row) => ({
    id: row.id,
    name: row.displayName ?? row.discordId,
    sessionName: row.session.name,
  }))

  return {
    id: check.id,
    typedName: check.typedName,
    candidateId: choices.some((choice) => choice.id === check.candidateId)
      ? check.candidateId
      : null,
    choices,
  }
}

/**
 * Show who an identifier would be, as far as the application knows
 * @param {string} id - Check identifier
 * @param {string} discordId - Identifier typed
 * @param {Resolver} actor - Member asking
 * @return {Promise<IdentityPreview>} - Name and portrait to show
 */

export const previewIdentity = async (
  id: string,
  discordId: string,
  actor: Resolver
): Promise<IdentityPreview> => {
  const escalation = await readEscalation(id, actor)
  const typed = discordId.trim()
  if (!DISCORD_ID.test(typed)) {
    throw invalidInput([{ field: 'discordId', message: IDENTITY_COPY.idInvalid }])
  }

  const account = await prisma.account.findUnique({
    where: { discordId: typed },
    select: { displayName: true, discordAvatarHash: true, avatarUrl: true },
  })

  return {
    discordId: typed,
    name: account?.displayName ?? escalation.typedName ?? typed,
    avatarUrl: account?.avatarUrl ?? discordAvatarUrl(typed, account?.discordAvatarHash ?? null),
  }
}

/**
 * Put the right identifier on the application and hand out the one link that accepts it
 * @param {string} id - Check identifier
 * @param {{ discordId: string, candidateId: string }} input - Identifier and application
 * @param {Resolver} actor - Member asking
 * @return {Promise<string>} - Path of the single-use link
 */

export const resolveCheck = async (
  id: string,
  input: { discordId: string; candidateId: string },
  actor: Resolver
): Promise<string> => {
  const typed = input.discordId.trim()
  if (!DISCORD_ID.test(typed)) {
    throw invalidInput([{ field: 'discordId', message: IDENTITY_COPY.idInvalid }])
  }

  const check = await prisma.identityCheck.findUnique({ where: { id } })
  if (!check || check.status !== IdentityCheckStatuses.Escalated) throw notFound()

  // The application must be one this member carries
  const candidate = await prisma.recruitmentCandidate.findFirst({
    where: { ...reachable(actor), id: input.candidateId },
    select: { id: true, sessionId: true, admission: { select: { accountId: true } } },
  })
  if (!candidate) throw forbidden()

  // Another member's identifier is never taken over
  const holder = await prisma.account.findUnique({
    where: { discordId: typed },
    select: { id: true },
  })
  if (holder && holder.id !== candidate.admission?.accountId) throw conflict()

  const twin = await prisma.recruitmentCandidate.findFirst({
    where: { sessionId: candidate.sessionId, discordId: typed, NOT: { id: candidate.id } },
    select: { id: true },
  })
  if (twin) throw conflict()

  const token = crypto.randomBytes(24).toString('base64url')

  await prisma.$transaction([
    prisma.recruitmentCandidate.update({ where: { id: candidate.id }, data: { discordId: typed } }),
    ...(candidate.admission
      ? [
          prisma.account.update({
            where: { id: candidate.admission.accountId },
            data: { discordId: typed },
          }),
        ]
      : []),
    prisma.identityCheck.update({
      where: { id },
      data: {
        status: IdentityCheckStatuses.Resolved,
        candidateId: candidate.id,
        resolvedDiscordId: typed,
        resolvedById: actor.id,
        linkToken: token,
        linkExpiresAt: new Date(Date.now() + ACADEMY_SETTINGS.inviteExpiryDays * DAY_MS),
      },
    }),
  ])

  return ROUTES.welcomeLink(token)
}
