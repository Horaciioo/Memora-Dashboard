import 'server-only'

import { isDiscordId } from '@/core/lib/auth/session'
import { prisma } from '@/core/lib/db'
import { invalidInput, notFound } from '@/core/lib/errors'
import { rowsToOptions } from '@/core/lib/forms/options'
import { readText } from '@/core/lib/forms/values'
import { instantiateJuniorSteps } from '@/core/services/academy/AcademyService'
import { ADMISSION_COPY, ADMISSION_FIELD_COPY } from '@/declarations/academy/copy'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { AUTH_COPY } from '@/declarations/ui/copy/auth'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { FieldDefinition, FormValues } from '@/types/forms'
import { AcademyJuniorStatuses, MemberRoles, MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Live invite with enough of its session to enrol a candidate
 * @typedef {Object} LiveInvite
 * @property {string} id - Invite identifier
 * @property {string} sessionId - Session it opens
 * @property {string | null} dispositifId - Pinned dispositif, or none
 * @property {{ functionId: string, startsAt: Date }} session - Session it opens
 */

export interface LiveInvite {
  id: string
  sessionId: string
  dispositifId: string | null
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

  return fields
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

  const discordId = (readText(values, 'discordId') ?? '').trim()
  if (!isDiscordId(discordId)) {
    throw invalidInput([{ field: 'discordId', message: AUTH_COPY.malformedId }])
  }

  const alreadyKnown = await prisma.account.findUnique({ where: { discordId } })
  if (alreadyKnown)
    throw invalidInput([{ field: 'discordId', message: ADMISSION_COPY.duplicateId }])

  const dispositifId = invite.dispositifId ?? readText(values, 'dispositifId')
  if (!dispositifId) throw invalidInput([{ field: 'dispositifId', message: FORM_COPY.required }])

  const account = await prisma.account.create({
    data: {
      discordId,
      displayName: readText(values, 'displayName') ?? '',
      status: MemberStatuses.Academy,
      role: MemberRoles.Moderateur,
      primaryFunctionId: invite.session.functionId,
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

  await Promise.all([
    instantiateJuniorSteps(
      junior.id,
      invite.sessionId,
      invite.session.functionId,
      dispositifId,
      invite.session.startsAt
    ),
    prisma.sessionInvite.update({ where: { id: invite.id }, data: { uses: { increment: 1 } } }),
  ])

  return { accountId: account.id, displayName: account.displayName, sessionId: invite.sessionId }
}
