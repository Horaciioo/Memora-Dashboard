import 'server-only'

import type { Prisma } from '@prisma/client'

import { encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { toOptions } from '@/core/lib/forms/options'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { discordAvatarUrl } from '@/declarations/access/discord'
import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { ONBOARDING_FIELD_COPY, ONBOARDING_STEP_COPY } from '@/declarations/onboarding/copy'
import { INTEGRATION_LINK_KIND_REGISTRY } from '@/declarations/onboarding/registries'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import { HISTORY_CONSENT } from '@/declarations/system/privacy'
import { LANGUAGE_OPTIONS } from '@/declarations/system/locales'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { instantiateJuniorSteps } from '@/core/services/academy/AcademyService'
import type { DiscordIdentity } from '@/core/services/auth/DiscordService'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { IntegrationClaimView, LiveInvite } from '@/types/onboarding'
import { AcademyJuniorStatuses, MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'
import { ConstraintKinds } from '@/utils/constants/integration'
import type { ConstraintKindName } from '@/utils/constants/integration'

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

  // A mode that opens an account refuses an identity that already holds one
  if (mode.createsAccount) {
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
 * Read back an identity already claimed on a link, refusing a spent one
 * @param {string} inviteId - Link identifier
 * @param {string | undefined} claimId - Claim identifier held by the ticket
 * @return {Promise<IntegrationClaimView | null>} - Claimed identity
 */

export const readClaim = async (
  inviteId: string,
  claimId: string | undefined
): Promise<IntegrationClaimView | null> => {
  if (!claimId) return null

  const claim = await prisma.integrationClaim.findUnique({ where: { id: claimId } })
  if (!claim || claim.inviteId !== inviteId || claim.submittedAt) return null

  return {
    id: claim.id,
    discordId: claim.discordId,
    displayName: claim.discordUsername,
    avatarUrl: discordAvatarUrl(claim.discordId, claim.discordAvatarHash),
    avatarHash: claim.discordAvatarHash,
  }
}

/**
 * Constraint field per stored kind, the three questions of the sensitive step
 * @type {Record<ConstraintKindName, { name: string, label: string, hint?: string }>}
 */

const CONSTRAINT_FIELDS: Record<
  ConstraintKindName,
  { name: string; label: string; hint?: string }
> = {
  [ConstraintKinds.Medical]: {
    name: 'medical',
    label: ONBOARDING_FIELD_COPY.medical,
    hint: ONBOARDING_FIELD_COPY.medicalHint,
  },
  [ConstraintKinds.Illness]: { name: 'illness', label: ONBOARDING_FIELD_COPY.illness },
  [ConstraintKinds.Private]: {
    name: 'private',
    label: ONBOARDING_FIELD_COPY.private,
    hint: ONBOARDING_FIELD_COPY.privateHint,
  },
}

/**
 * Build the social fields from the declared networks, each carrying its own prefix
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

const socialFields = async (): Promise<FieldDefinition[]> => {
  const networks = await prisma.socialNetwork.findMany({
    where: { archived: false },
    orderBy: { position: 'asc' },
  })

  return networks.map((network) => ({
    name: `social:${network.id}`,
    kind: 'text',
    label: network.name,
    prefix: network.urlPrefix,
    required: network.required,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
    group: ONBOARDING_STEP_COPY.socials,
  }))
}

/**
 * Build the public integration form declarations
 * @param {LiveInvite} invite - Live link the form answers to
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const integrationFields = async (invite: LiveInvite): Promise<FieldDefinition[]> => {
  const mode = INTEGRATION_LINK_KIND_REGISTRY.get(invite.kind)

  const fields: FieldDefinition[] = [
    {
      name: 'displayName',
      kind: 'text',
      label: ONBOARDING_FIELD_COPY.displayName,
      hint: ONBOARDING_FIELD_COPY.displayNameHint,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'email',
      kind: 'email',
      label: ONBOARDING_FIELD_COPY.email,
      required: true,
      span: 'half',
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'phone',
      kind: 'phone',
      label: ONBOARDING_FIELD_COPY.phone,
      span: 'half',
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'birthday',
      kind: 'date',
      label: ONBOARDING_FIELD_COPY.birthday,
      required: true,
      span: 'half',
      group: ONBOARDING_STEP_COPY.informations,
    },
    {
      name: 'languages',
      kind: 'multiselect',
      label: ONBOARDING_FIELD_COPY.languages,
      options: LANGUAGE_OPTIONS,
      maxItems: FORM_SETTINGS.tagMaxCount,
      group: ONBOARDING_STEP_COPY.informations,
    },
    ...(await socialFields()),
  ]

  // The three sensitive questions, each one free text and each one optional
  for (const kind of Object.keys(CONSTRAINT_FIELDS) as ConstraintKindName[]) {
    const declared = CONSTRAINT_FIELDS[kind]

    fields.push({
      name: declared.name,
      kind: 'textarea',
      label: declared.label,
      hint: declared.hint,
      maxLength: FORM_SETTINGS.longTextMaxLength,
      group: ONBOARDING_STEP_COPY.constraints,
    })
  }

  fields.push(
    {
      name: 'theme',
      kind: 'select',
      label: ONBOARDING_FIELD_COPY.theme,
      options: toOptions(THEME_REGISTRY),
      span: 'half',
      group: ONBOARDING_STEP_COPY.preferences,
    },
    {
      name: 'fontScale',
      kind: 'select',
      label: ONBOARDING_FIELD_COPY.fontScale,
      options: toOptions(FONT_SCALE_REGISTRY),
      span: 'half',
      group: ONBOARDING_STEP_COPY.preferences,
    },
    {
      name: 'hasColorVision',
      kind: 'toggle',
      label: ONBOARDING_FIELD_COPY.hasColorVision,
      group: ONBOARDING_STEP_COPY.preferences,
    },
    {
      name: 'colorVision',
      kind: 'select',
      label: ONBOARDING_FIELD_COPY.colorVision,
      options: toOptions(COLOR_VISION_REGISTRY),
      visibleWhen: { field: 'hasColorVision', truthy: true },
      group: ONBOARDING_STEP_COPY.preferences,
    }
  )

  // A dispositif is never imposed by the link, the junior always picks their own
  if (mode.enrolsAcademy) {
    const dispositifs = await prisma.dispositif.findMany({ orderBy: { position: 'asc' } })

    fields.push({
      name: 'dispositifId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.dispositif,
      required: true,
      options: dispositifs.map((row) => ({ value: row.id, label: row.name })),
      group: ONBOARDING_STEP_COPY.confirmation,
    })
  }

  fields.push({
    name: 'historyConsent',
    kind: 'toggle',
    label: ONBOARDING_FIELD_COPY.consent,
    hint: HISTORY_CONSENT.label,
    required: true,
    group: ONBOARDING_STEP_COPY.confirmation,
  })

  return fields
}

/**
 * Take one seat of a link, refusing once it is full or expired
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
 * @property {string | null} accountId - Account opened, when the mode opens one
 * @property {string} displayName - Name the person gave themselves
 * @property {boolean} awaitsApproval - Account held until a responsable validates it
 */

export interface IntegrationOutcome {
  accountId: string | null
  displayName: string
  awaitsApproval: boolean
}

/**
 * Answer a link, opening the account its mode calls for
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

  const claim = await readClaim(invite.id, claimId)
  if (!claim) throw notFound()

  if (!readFlag(values, 'historyConsent')) {
    throw invalidInput([{ field: 'historyConsent', message: CONSENT_COPY.required }])
  }

  const displayName = readText(values, 'displayName') ?? ''
  const dispositifId = readText(values, 'dispositifId')
  if (mode.enrolsAcademy && !dispositifId) {
    throw invalidInput([{ field: 'dispositifId', message: FORM_COPY.required }])
  }

  // The seat is taken before anything is written, so a lost race creates nothing
  await claimSeat(invite)

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

  const account = await prisma.account.create({
    data: {
      discordId: claim.discordId,
      discordUsername: claim.displayName,
      discordAvatarHash: claim.avatarHash,
      discordSyncedAt: new Date(),
      avatarUrl: claim.avatarUrl,
      displayName,
      email: readText(values, 'email'),
      phone: readText(values, 'phone'),
      birthday: readDate(values, 'birthday'),
      languages: readList(values, 'languages'),
      theme: readPreference(values, 'theme', THEME_REGISTRY),
      fontScale: readPreference(values, 'fontScale', FONT_SCALE_REGISTRY),
      colorVision: readFlag(values, 'hasColorVision')
        ? readPreference(values, 'colorVision', COLOR_VISION_REGISTRY)
        : null,
      // The arrival date is the day the form was sent, not the day it came back
      joinedAt: invite.createdAt,
      role: MemberRoles.Moderateur,
      status: mode.awaitsApproval ? MemberStatuses.Pending : MemberStatuses.Academy,
      primaryFunctionId: invite.functionId,
      historyConsentAt: new Date(),
      historyConsentVersion: HISTORY_CONSENT.version,
      ...(invite.youtuberId ? { youtubers: { connect: { id: invite.youtuberId } } } : {}),
      ...(socialLinks.length > 0 ? { socialLinks: { create: socialLinks } } : {}),
      ...(constraints.length > 0 ? { constraints: { create: constraints } } : {}),
    },
  })

  await prisma.integrationClaim.update({
    where: { id: claim.id },
    data: { submittedAt: new Date(), accountId: account.id },
  })

  // The academy mode also opens the junior file and its timeline
  if (mode.enrolsAcademy && invite.session && dispositifId) {
    const junior = await prisma.academyJunior.create({
      data: {
        sessionId: invite.session.id,
        accountId: account.id,
        dispositifId,
        status: AcademyJuniorStatuses.Active,
      },
    })

    await instantiateJuniorSteps(
      junior.id,
      invite.session.id,
      invite.session.functionId,
      dispositifId,
      invite.session.startsAt
    )
  }

  return { accountId: account.id, displayName, awaitsApproval: mode.awaitsApproval }
}
