import 'server-only'
import type { Prisma } from '@prisma/client'
import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'
import { INTEGRATION_LINK_KIND_REGISTRY } from '@/declarations/onboarding/registries'
import { HISTORY_CONSENT } from '@/declarations/system/security/privacy'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { afterIntegration } from '@/core/services/academy/parkour/ParkourService'
import type { FormValues } from '@/types/forms'
import type { IntegrationAdmission, IntegrationClaimView, LiveInvite } from '@/types/onboarding'
import { AcademyJuniorStatuses, MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import type { ConstraintKindName } from '@/utils/constants/integration'
import { CONSTRAINT_FIELDS } from '@/core/services/onboarding/IntegrationService/form'
import { readClaim, resolveInvite } from '@/core/services/onboarding/IntegrationService/claims'

/**
 * Take one seat of a link
 * @param {LiveInvite} invite - Live link
 * @return {Promise<void>} - Throws when the seat is gone
 */

const claimSeat = async (invite: LiveInvite): Promise<void> => {
  const { count } = await prisma.integrationInvite.updateMany({
    where: {
      id: invite.id,
      expiresAt: { gt: new Date() },
      ...(invite.maxUses === null ? {} : { uses: { lt: invite.maxUses } }),
    },
    data: { uses: { increment: 1 } },
  })

  if (count === 0) throw notFound()
}

/**
 * Turn the social answers into the rows a member keeps
 * @param {FormValues} values - Parsed body
 * @return {Promise<Prisma.SocialLinkCreateWithoutAccountInput[]>} - Rows to create
 */

const buildSocialLinks = async (
  values: FormValues
): Promise<Prisma.SocialLinkCreateWithoutAccountInput[]> => {
  const networks = await prisma.socialNetwork.findMany({
    where: { archived: false },
    orderBy: { position: 'asc' },
  })

  return networks.flatMap((network, position) => {
    const handle = readText(values, `social:${network.id}`)
    if (!handle) return []

    return [
      {
        network: { connect: { id: network.id } },
        label: network.name,
        handle,
        url: `${network.urlPrefix}${handle}`,
        accent: network.accent,
        position,
      },
    ]
  })
}

/**
 * Turn the sensitive answers into the rows a member may erase
 * @param {FormValues} values - Parsed body
 * @return {Prisma.AccountConstraintCreateWithoutAccountInput[]} - Rows to create
 */

const buildConstraints = (
  values: FormValues
): Prisma.AccountConstraintCreateWithoutAccountInput[] =>
  (Object.keys(CONSTRAINT_FIELDS) as ConstraintKindName[]).flatMap((kind) => {
    const body = encryptField(readText(values, CONSTRAINT_FIELDS[kind].name))
    if (!body) return []

    return [{ kind, body }]
  })

/**
 * Keep a preference only when it names a declared option
 * @param {FormValues} values - Parsed body
 * @param {string} name - Field name
 * @param {{ has: (key: string) => boolean }} registry - Registry the value must belong to
 * @return {string | null} - Stored preference
 */

const readPreference = (
  values: FormValues,
  name: string,
  registry: { has: (key: string) => boolean }
): string | null => {
  const picked = readText(values, name)

  return picked && registry.has(picked) ? picked : null
}

/**
 * What a submitted form hands back to the page
 * @typedef {Object} IntegrationOutcome
 * @property {string | null} accountId - Account opened
 * @property {string} displayName - Name the person gave themselves
 * @property {boolean} awaitsApproval - Account held until a responsable validates it
 */

export interface IntegrationOutcome {
  accountId: string | null
  displayName: string
  awaitsApproval: boolean
}

/**
 * Confirm an admitted file: the answers land on the pre-generated account
 * @param {IntegrationClaimView} claim - Identity resolved by Discord
 * @param {IntegrationAdmission} admission - Seat waiting for this identity
 * @param {{ id: string, functionId: string, startsAt: Date }} session - Promotion
 * @param {string} dispositifId - Dispositif picked
 * @param {FormValues} values - Parsed body
 * @return {Promise<IntegrationOutcome>} - What the submission confirmed
 */

const confirmAdmission = async (
  claim: IntegrationClaimView,
  admission: IntegrationAdmission,
  session: { id: string; functionId: string; startsAt: Date },
  dispositifId: string,
  values: FormValues
): Promise<IntegrationOutcome> => {
  const displayName = readText(values, 'displayName') ?? ''
  const [socialLinks, constraints, known] = await Promise.all([
    buildSocialLinks(values),
    Promise.resolve(buildConstraints(values)),
    prisma.account.findUniqueOrThrow({
      where: { id: admission.accountId },
      select: { status: true, _count: { select: { socialLinks: true, constraints: true } } },
    }),
  ])

  await prisma.account.update({
    where: { id: admission.accountId },
    data: {
      discordUsername: claim.displayName,
      discordAvatarHash: claim.avatarHash,
      discordSyncedAt: new Date(),
      avatarUrl: claim.avatarUrl,
      displayName,
      birthday: readDate(values, 'birthday'),
      celebrateBirthday: readFlag(values, 'celebrateBirthday'),
      languages: readList(values, 'languages'),
      theme: readPreference(values, 'theme', THEME_REGISTRY),
      fontScale: readPreference(values, 'fontScale', FONT_SCALE_REGISTRY),
      colorVision: readFlag(values, 'hasColorVision')
        ? readPreference(values, 'colorVision', COLOR_VISION_REGISTRY)
        : null,
      // A pre-generated file opens
      status: known.status === MemberStatuses.Pending ? MemberStatuses.Academy : undefined,
      historyConsentAt: new Date(),
      historyConsentVersion: HISTORY_CONSENT.version,
      // Existing traces are never duplicated
      ...(known._count.socialLinks === 0 && socialLinks.length > 0
        ? { socialLinks: { create: socialLinks } }
        : {}),
      ...(known._count.constraints === 0 && constraints.length > 0
        ? { constraints: { create: constraints } }
        : {}),
    },
  })

  await prisma.$transaction([
    prisma.academyJunior.update({
      where: { id: admission.juniorId },
      data: { dispositifId, confirmedAt: new Date() },
    }),
    prisma.integrationClaim.update({
      where: { id: claim.id },
      data: { submittedAt: new Date(), accountId: admission.accountId },
    }),
  ])

  // The last form back launches the promotion
  await afterIntegration(admission.juniorId)

  return { accountId: admission.accountId, displayName, awaitsApproval: false }
}

/**
 * Answer a link
 * @param {string} token - Link token
 * @param {string | undefined} claimId - Claim identifier held by the ticket
 * @param {FormValues} values - Parsed body
 * @return {Promise<IntegrationOutcome>} - What the submission created
 */

export const submitIntegration = async (
  token: string,
  claimId: string | undefined,
  values: FormValues
): Promise<IntegrationOutcome> => {
  const invite = await resolveInvite(token)
  const mode = INTEGRATION_LINK_KIND_REGISTRY.get(invite.kind)

  const claim = await readClaim(invite, claimId)
  if (!claim) throw notFound()

  if (!readFlag(values, 'historyConsent')) {
    throw invalidInput([{ field: 'historyConsent', message: CONSENT_COPY.required }])
  }

  const displayName = readText(values, 'displayName') ?? ''
  const dispositifId = readText(values, 'dispositifId')
  if ((mode.enrolsAcademy || claim.admission) && !dispositifId) {
    throw invalidInput([{ field: 'dispositifId', message: FORM_COPY.required }])
  }

  // One submission per claim
  const locked = await prisma.integrationClaim.updateMany({
    where: { id: claim.id, submittedAt: null },
    data: { submittedAt: new Date() },
  })
  if (locked.count === 0) throw conflict()

  let isSeated = false
  try {
    // The seat is taken before anything is written
    await claimSeat(invite)
    isSeated = true

    return await fileIntegration({ invite, claim, mode, values, displayName, dispositifId })
  } catch (error) {
    // A failed submission gives both back
    await prisma.integrationClaim.update({ where: { id: claim.id }, data: { submittedAt: null } })
    if (isSeated) {
      await prisma.integrationInvite.update({
        where: { id: invite.id },
        data: { uses: { decrement: 1 } },
      })
    }
    throw error
  }
}

/**
 * Write what a submission creates
 * @param {Object} input - Submission
 * @param {LiveInvite} input.invite - Link
 * @param {IntegrationClaimView} input.claim - Locked claim
 * @param {Object} input.mode - Link kind
 * @param {FormValues} input.values - Parsed body
 * @param {string} input.displayName - Chosen name
 * @param {string | null} input.dispositifId - Academy track
 * @return {Promise<IntegrationOutcome>} - What was created
 */

const fileIntegration = async ({
  invite,
  claim,
  mode,
  values,
  displayName,
  dispositifId,
}: {
  invite: LiveInvite
  claim: IntegrationClaimView
  mode: ReturnType<typeof INTEGRATION_LINK_KIND_REGISTRY.get>
  values: FormValues
  displayName: string
  dispositifId: string | null
}): Promise<IntegrationOutcome> => {
  // An admitted candidate confirms the file the recruitment pre-generated
  if (claim.admission && invite.session && dispositifId) {
    return confirmAdmission(claim, claim.admission, invite.session, dispositifId, values)
  }

  // A mode that opens no account keeps the answers on the claim alone
  if (!mode.createsAccount) {
    await prisma.integrationClaim.update({
      where: { id: claim.id },
      data: { submittedAt: new Date() },
    })

    return { accountId: null, displayName, awaitsApproval: false }
  }

  const [socialLinks, constraints] = await Promise.all([
    buildSocialLinks(values),
    Promise.resolve(buildConstraints(values)),
  ])

  // All or nothing
  return prisma.$transaction(async (tx) => {
    const account = await tx.account.create({
      data: {
        discordId: claim.discordId,
        discordUsername: claim.displayName,
        discordAvatarHash: claim.avatarHash,
        discordSyncedAt: new Date(),
        avatarUrl: claim.avatarUrl,
        displayName,
        birthday: readDate(values, 'birthday'),
        celebrateBirthday: readFlag(values, 'celebrateBirthday'),
        languages: readList(values, 'languages'),
        theme: readPreference(values, 'theme', THEME_REGISTRY),
        fontScale: readPreference(values, 'fontScale', FONT_SCALE_REGISTRY),
        colorVision: readFlag(values, 'hasColorVision')
          ? readPreference(values, 'colorVision', COLOR_VISION_REGISTRY)
          : null,
        // The arrival date is the day the form was sent
        joinedAt: invite.createdAt,
        role: MemberRoles.Moderateur,
        status: mode.awaitsApproval ? MemberStatuses.Pending : MemberStatuses.Academy,
        ...(invite.functionId ? { functions: { create: { functionId: invite.functionId } } } : {}),
        historyConsentAt: new Date(),
        historyConsentVersion: HISTORY_CONSENT.version,
        ...(invite.youtuberId ? { youtubers: { connect: { id: invite.youtuberId } } } : {}),
        ...(socialLinks.length > 0 ? { socialLinks: { create: socialLinks } } : {}),
        ...(constraints.length > 0 ? { constraints: { create: constraints } } : {}),
      },
    })

    await tx.integrationClaim.update({
      where: { id: claim.id },
      data: { submittedAt: new Date(), accountId: account.id },
    })

    // The academy mode also opens the junior file and its timeline
    if (mode.enrolsAcademy && invite.session && dispositifId) {
      await tx.academyJunior.create({
        data: {
          sessionId: invite.session.id,
          accountId: account.id,
          dispositifId,
          status: AcademyJuniorStatuses.Active,
        },
      })
    }

    return { accountId: account.id, displayName, awaitsApproval: mode.awaitsApproval }
  })
}
