import 'server-only'

import { prisma } from '@/core/lib/db'
import { withoutSealedWrites } from '@/core/services/auth/SealService'
import { notFound } from '@/core/lib/errors'
import { readDate, readFlag, readList, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { PROFILE_FIELD_COPY } from '@/declarations/preferences/copy'
import { LANGUAGE_OPTIONS, timezoneOptions } from '@/declarations/system/locales'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { ProfileDetail } from '@/types/preferences'
import { AcademyJuniorStatuses } from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'
import {
  HELD_FUNCTIONS,
  joinFunctionNames,
  toMemberFunctions,
} from '@/core/services/reference/functions'
import type { Prisma } from '@prisma/client'

// Relations the read-only half of the page shows
const PROFILE_INCLUDE = {
  division: true,
  youtubers: true,
  ...HELD_FUNCTIONS,
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
  {
    name: 'displayName',
    kind: 'text',
    label: PROFILE_FIELD_COPY.displayName,
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
  {
    name: 'birthday',
    kind: 'date',
    dayOnly: true,
    startYear: FORM_SETTINGS.birthdayStartYear,
    label: PROFILE_FIELD_COPY.birthday,
    span: 'half',
  },
  {
    name: 'timezone',
    kind: 'select',
    label: PROFILE_FIELD_COPY.timezone,
    options: timezoneOptions(),
    span: 'half',
    maturity: 'beta',
  },
  {
    name: 'languages',
    kind: 'multiselect',
    label: PROFILE_FIELD_COPY.languages,
    options: LANGUAGE_OPTIONS,
    mark: 'flag',
    maxItems: FORM_SETTINGS.tagMaxCount,
  },
  {
    name: 'celebrateBirthday',
    kind: 'toggle',
    label: PROFILE_FIELD_COPY.celebrateBirthday,
    binary: true,
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
    id: row.id,
    displayName: row.displayName,
    discordId: row.discordId,
    discordUsername: row.discordUsername,
    avatarUrl: row.avatarUrl,
    bannerUrl: row.bannerUrl,
    role: row.role,
    status: row.status,
    academyDispositif: row.academyJuniors[0]?.dispositif?.name ?? null,
    division: row.division?.name ?? null,
    youtubers: row.youtubers.map((youtuber) => youtuber.name),
    primaryFunctions: joinFunctionNames(toMemberFunctions(row.functions), FunctionKinds.Primary),
    secondaryFunctions: joinFunctionNames(
      toMemberFunctions(row.functions),
      FunctionKinds.Secondary
    ),
    joinedAt: row.joinedAt.toISOString(),
    values: {
      displayName: row.displayName,
      birthday: row.birthday ? row.birthday.toISOString().slice(0, 10) : null,
      timezone: row.timezone,
      languages: row.languages,
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
  // Only the declared fields are written
  await prisma.account.update({
    where: { id: accountId },
    data: await withoutSealedWrites({
      displayName: readText(values, 'displayName') ?? undefined,
      birthday: readDate(values, 'birthday'),
      timezone: readText(values, 'timezone'),
      languages: readList(values, 'languages'),
      celebrateBirthday: readFlag(values, 'celebrateBirthday'),
    }),
  })

  return readProfile(accountId)
}
