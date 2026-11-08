import 'server-only'
import { prisma } from '@/core/lib/db'
import { conflict, forbidden, notFound } from '@/core/lib/errors'
import { discordAvatarUrl } from '@/declarations/access/discord'
import { INTEGRATION_LINK_KIND_REGISTRY } from '@/declarations/onboarding/registries'
import { findAdmission } from '@/core/services/academy/AdmissionService'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import type { FormValues } from '@/types/forms'
import type { IntegrationAdmission, IntegrationClaimView, LiveInvite } from '@/types/onboarding'

// Everything a live link needs to draw and answer its form
const INVITE_SHAPE = {
  youtuber: { select: { id: true, name: true, accent: true, avatarUrl: true, bannerUrl: true } },
  session: { select: { id: true, functionId: true, startsAt: true } },
} as const

/**
 * Load a still-usable link or fail
 * @param {string} token - Link token
 * @return {Promise<LiveInvite>} - Live link
 */

export const resolveInvite = async (token: string): Promise<LiveInvite> => {
  const invite = await prisma.integrationInvite.findUnique({
    where: { token },
    include: INVITE_SHAPE,
  })

  const usable =
    invite !== null &&
    invite.expiresAt > new Date() &&
    invite.uses < (invite.maxUses ?? Number.POSITIVE_INFINITY)

  if (!usable) throw notFound()

  return invite
}

/**
 * Record the Discord identity the server itself resolved for one link
 * @param {string} token - Link token
 * @param {DiscordIdentity} identity - Identity returned by Discord
 * @return {Promise<string>} - Claim identifier
 */

export const claimIdentity = async (token: string, identity: DiscordIdentity): Promise<string> => {
  const invite = await resolveInvite(token)
  const mode = INTEGRATION_LINK_KIND_REGISTRY.get(invite.kind)

  // An admitted candidate is expected
  const admission = invite.session ? await findAdmission(invite.session.id, identity.id) : null

  if (mode.createsAccount && !admission) {
    // A campaign link only opens its promotion to the candidates it admitted
    const fed = invite.session
      ? await prisma.recruitmentSession.count({ where: { academySessionId: invite.session.id } })
      : 0
    if (fed > 0 && mode.enrolsAcademy) throw forbidden()

    // A mode that opens an account refuses an identity that already holds one
    const known = await prisma.account.findUnique({ where: { discordId: identity.id } })
    if (known) throw conflict()
  }

  const claim = await prisma.integrationClaim.upsert({
    where: { inviteId_discordId: { inviteId: invite.id, discordId: identity.id } },
    update: {
      discordUsername: identity.username,
      discordAvatarHash: identity.avatar,
      claimedAt: new Date(),
    },
    create: {
      inviteId: invite.id,
      discordId: identity.id,
      discordUsername: identity.username,
      discordAvatarHash: identity.avatar,
    },
  })

  return claim.id
}

/**
 * Read what an admitted file already knows
 * @param {string} accountId - Pre-generated account
 * @return {Promise<FormValues>} - Starting values
 */

const admissionPrefill = async (accountId: string): Promise<FormValues> => {
  const row = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: {
      displayName: true,
      birthday: true,
      celebrateBirthday: true,
      languages: true,
      theme: true,
      fontScale: true,
    },
  })

  return {
    displayName: row.displayName,
    birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
    celebrateBirthday: row.celebrateBirthday,
    languages: row.languages,
    theme: row.theme,
    fontScale: row.fontScale,
  }
}

/**
 * Read back an identity already claimed on a link
 * @param {LiveInvite} invite - Live link
 * @param {string | undefined} claimId - Claim identifier held by the ticket
 * @return {Promise<IntegrationClaimView | null>} - Claimed identity
 */

export const readClaim = async (
  invite: LiveInvite,
  claimId: string | undefined
): Promise<IntegrationClaimView | null> => {
  if (!claimId) return null

  const claim = await prisma.integrationClaim.findUnique({ where: { id: claimId } })
  if (!claim || claim.inviteId !== invite.id || claim.submittedAt) return null

  const seat = invite.session ? await findAdmission(invite.session.id, claim.discordId) : null
  const admission: IntegrationAdmission | null = seat
    ? {
        juniorId: seat.juniorId,
        accountId: seat.accountId,
        sessionName: seat.sessionName,
        functionName: seat.functionName,
        prefill: await admissionPrefill(seat.accountId),
      }
    : null

  return {
    id: claim.id,
    discordId: claim.discordId,
    displayName: claim.discordUsername,
    avatarUrl: discordAvatarUrl(claim.discordId, claim.discordAvatarHash),
    avatarHash: claim.discordAvatarHash,
    admission,
  }
}
