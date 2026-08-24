import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { PROFILE_FIELD_COPY } from '@/declarations/preferences/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { AccountSession, ProfileDetail } from '@/types/preferences'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'

// Relations the read-only half of the page shows
const PROFILE_INCLUDE = {
  division: true,
  youtubers: true,
  primaryFunction: true,
  secondaryFunction: true,
  academyJuniors: {
    where: { status: AcademyJuniorStatuses.Active },
    orderBy: { startedAt: 'desc' },
    take: 1,
    include: { dispositif: true },
  },
} satisfies Prisma.AccountInclude

/**
 * Build the declarations of the fields a member owns on their own file
 * @return {FieldDefinition[]} - Field declarations
 */

export const profileFields = (): FieldDefinition[] => [
  { name: 'email', kind: 'email', label: PROFILE_FIELD_COPY.email, span: 'half' },
  { name: 'phone', kind: 'phone', label: PROFILE_FIELD_COPY.phone, span: 'half' },
  { name: 'birthday', kind: 'date', label: PROFILE_FIELD_COPY.birthday, span: 'half' },
  {
    name: 'timezone',
    kind: 'text',
    label: PROFILE_FIELD_COPY.timezone,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
    span: 'half',
  },
  {
    name: 'languages',
    kind: 'tags',
    label: PROFILE_FIELD_COPY.languages,
    maxItems: FORM_SETTINGS.tagMaxCount,
  },
  { name: 'avatarUrl', kind: 'url', label: PROFILE_FIELD_COPY.avatarUrl },
  {
    name: 'celebrateBirthday',
    kind: 'toggle',
    label: PROFILE_FIELD_COPY.celebrateBirthday,
  },
]

/**
 * Read the file of the signed-in member
 * @param {string} accountId - Account identifier
 * @return {Promise<ProfileDetail>} - Own file
 */

export const readProfile = async (accountId: string): Promise<ProfileDetail> => {
  const row = await prisma.account.findUnique({
    where: { id: accountId },
    include: PROFILE_INCLUDE,
  })

  if (!row) throw notFound()

  return {
    displayName: row.displayName,
    discordId: row.discordId,
    role: row.role,
    status: row.status,
    academyDispositif: row.academyJuniors[0]?.dispositif.name ?? null,
    division: row.division?.name ?? null,
    youtubers: row.youtubers.map((youtuber) => youtuber.name),
    primaryFunction: row.primaryFunction?.name ?? null,
    secondaryFunction: row.secondaryFunction?.name ?? null,
    joinedAt: row.joinedAt.toISOString(),
    values: {
      email: row.email,
      phone: row.phone,
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
      timezone: row.timezone,
      languages: row.languages,
      avatarUrl: row.avatarUrl,
      celebrateBirthday: row.celebrateBirthday,
    },
  }
}

/**
 * Write the fields a member owns on their own file
 * @param {string} accountId - Account identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<ProfileDetail>} - Updated file
 */

export const updateProfile = async (
  accountId: string,
  values: FormValues
): Promise<ProfileDetail> => {
  // Only the declared fields are written, the rest of the file stays with the responsables
  await prisma.account.update({
    where: { id: accountId },
    data: {
      email: readText(values, 'email'),
      phone: readText(values, 'phone'),
      birthday: readDate(values, 'birthday'),
      timezone: readText(values, 'timezone'),
      languages: readList(values, 'languages'),
      avatarUrl: readText(values, 'avatarUrl'),
      celebrateBirthday: readFlag(values, 'celebrateBirthday'),
    },
  })

  return readProfile(accountId)
}

/**
 * Read the sessions currently open for one member
 * @param {string} accountId - Account identifier
 * @param {string} [currentToken] - Token of the session on screen
 * @return {Promise<AccountSession[]>} - Open sessions, newest first
 */

export const listOpenSessions = async (
  accountId: string,
  currentToken?: string
): Promise<AccountSession[]> => {
  const rows = await prisma.session.findMany({
    where: { accountId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map((row) => ({
    id: row.id,
    userAgent: row.userAgent,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    isCurrent: row.token === currentToken,
  }))
}

/**
 * Close every session of one member but the one in use
 * @param {string} accountId - Account identifier
 * @param {string} [currentToken] - Token kept alive
 * @return {Promise<number>} - Closed count
 */

export const closeOtherSessions = async (
  accountId: string,
  currentToken?: string
): Promise<number> => {
  const { count } = await prisma.session.deleteMany({
    where: { accountId, token: currentToken ? { not: currentToken } : undefined },
  })

  return count
}
