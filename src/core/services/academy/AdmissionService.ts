import 'server-only'

import { isDiscordId } from '@/core/lib/auth/session'
import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { rowsToOptions } from '@/core/lib/forms/options'
import { readFlag, readText } from '@/core/lib/forms/values'
import { instantiateJuniorSteps } from '@/core/services/academy/AcademyService'
import { ADMISSION_COPY, ADMISSION_FIELD_COPY } from '@/declarations/academy/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { HISTORY_CONSENT } from '@/declarations/system/privacy'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import { CONSENT_COPY } from '@/declarations/ui/copy/privacy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { AcademyJuniorStatuses, MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Live invite with enough of its session to enrol a candidate
 * @typedef {Object} LiveInvite
 * @property {string} id - Invite identifier
 * @property {string} sessionId - Session it opens
 * @property {string | null} dispositifId - Pinned dispositif, or none
 * @property {number | null} maxUses - Seats the invite opens
 * @property {{ functionId: string, startsAt: Date }} session - Session it opens
 */

export interface LiveInvite {
  id: string
  sessionId: string
  dispositifId: string | null
  maxUses: number | null
  session: { functionId: string; startsAt: Date }
}

/**
 * Load a still-usable invite or fail
 * @param {string} token - Invite token
 * @return {Promise<LiveInvite>} - Live invite
 */

export const resolveInvite = async (token: string): Promise<LiveInvite> => {
  const invite = await prisma.sessionInvite.findUnique({
    where: { token },
    include: { session: { select: { functionId: true, startsAt: true } } },
  })

  const usable =
    invite !== null &&
    invite.expiresAt > new Date() &&
    invite.uses < (invite.maxUses ?? Number.POSITIVE_INFINITY)

  if (!usable) throw notFound()

  return invite
}

/**
 * Build the public admission form declarations
 * @param {LiveInvite} invite - Live invite the form answers to
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const admissionFields = async (invite: LiveInvite): Promise<FieldDefinition[]> => {
  const fields: FieldDefinition[] = [
    {
      name: 'discordId',
      kind: 'text',
      label: AUTH_COPY.field,
      hint: AUTH_COPY.hint,
      required: true,
    },
    {
      name: 'displayName',
      kind: 'text',
      label: ADMISSION_FIELD_COPY.displayName,
      required: true,
      maxLength: FORM_SETTINGS.titleMaxLength,
    },
  ]

  // A pinned dispositif skips the question, otherwise the candidate picks it
  if (!invite.dispositifId) {
    const dispositifs = await prisma.dispositif.findMany({ orderBy: { position: 'asc' } })

    fields.push({
      name: 'dispositifId',
      kind: 'select',
      label: ADMISSION_FIELD_COPY.dispositif,
      required: true,
      options: rowsToOptions(dispositifs),
    })
  }

  fields.push({
    name: 'historyConsent',
    kind: 'toggle',
    label: ADMISSION_COPY.consentLabel,
    hint: HISTORY_CONSENT.label,
    required: true,
  })

  return fields
}

/**
 * Enrol a candidate through a still-usable invite
 * @param {string} token - Invite token
 * @param {FormValues} values - Parsed body
 * @return {Promise<{ accountId: string, displayName: string, sessionId: string }>} - Newly created account
 */

/**
 * Take one seat of an invite, refusing once it is full or expired
 * @param {LiveInvite} invite - Live invite
 * @param {number | null} maxUses - Seats the invite opens
 * @return {Promise<void>} - Throws when the seat is gone
 */

const claimInvite = async (invite: LiveInvite, maxUses: number | null): Promise<void> => {
  const { count } = await prisma.sessionInvite.updateMany({
    where: {
      id: invite.id,
      expiresAt: { gt: new Date() },
      ...(maxUses === null ? {} : { uses: { lt: maxUses } }),
    },
    data: { uses: { increment: 1 } },
  })

  if (count === 0) throw notFound()
}

/**
 * Enrol a candidate through a still-usable invite
 * @param {string} token - Invite token
 * @param {FormValues} values - Parsed body
 * @return {Promise<{ accountId: string, displayName: string, sessionId: string }>} - Newly created account
 */

export const submitAdmission = async (
  token: string,
  values: FormValues
): Promise<{ accountId: string; displayName: string; sessionId: string }> => {
  const invite = await resolveInvite(token)

  if (!readFlag(values, 'historyConsent')) {
    throw invalidInput([{ field: 'historyConsent', message: CONSENT_COPY.required }])
  }

  const discordId = (readText(values, 'discordId') ?? '').trim()
  if (!isDiscordId(discordId)) {
    throw invalidInput([{ field: 'discordId', message: AUTH_COPY.malformedId }])
  }

  // A distinct message here would tell a stranger which identifiers already hold an account
  const alreadyKnown = await prisma.account.findUnique({ where: { discordId } })
  if (alreadyKnown) throw invalidInput([{ field: 'discordId', message: ADMISSION_COPY.rejected }])

  const dispositifId = invite.dispositifId ?? readText(values, 'dispositifId')
  if (!dispositifId) throw invalidInput([{ field: 'dispositifId', message: FORM_COPY.required }])

  // The seat is taken before the account exists, so a lost race creates nothing
  await claimInvite(invite, invite.maxUses)

  const account = await prisma.account.create({
    data: {
      discordId,
      displayName: readText(values, 'displayName') ?? '',
      status: MemberStatuses.Academy,
      role: MemberRoles.Moderateur,
      primaryFunctionId: invite.session.functionId,
      historyConsentAt: new Date(),
      historyConsentVersion: HISTORY_CONSENT.version,
    },
  })

  const junior = await prisma.academyJunior.create({
    data: {
      sessionId: invite.sessionId,
      accountId: account.id,
      dispositifId,
      status: AcademyJuniorStatuses.Active,
    },
  })

  await instantiateJuniorSteps(
    junior.id,
    invite.sessionId,
    invite.session.functionId,
    dispositifId,
    invite.session.startsAt
  )

  return { accountId: account.id, displayName: account.displayName, sessionId: invite.sessionId }
}
