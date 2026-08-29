import 'server-only'

import type { SocialLink } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { forbidden, notFound } from '@/core/lib/errors'
import { readFlag, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_COPY } from '@/declarations/members/copy'
import type { PermissionHelpers } from '@/types/auth'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberNote, MemberSocial } from '@/types/members'
import { Permissions, isPermissionName } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import { PermissionEffects } from '@/utils/constants/workflow'

/**
 * Declarations of the private note form
 * @type {FieldDefinition[]}
 */

export const NOTE_FIELDS: FieldDefinition[] = [
  {
    name: 'body',
    kind: 'textarea',
    label: MEMBER_COPY.noteField,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  { name: 'pinned', kind: 'toggle', label: MEMBER_COPY.notePin },
]

/**
 * Add a private note to a member
 * @param {string} accountId - Account identifier
 * @param {string} authorId - Author identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberNote>} - Created note
 */

export const addNote = async (
  accountId: string,
  authorId: string,
  values: FormValues
): Promise<MemberNote> => {
  const note = await prisma.accountNote.create({
    data: {
      accountId,
      authorId,
      body: readText(values, 'body') ?? '',
      pinned: readFlag(values, 'pinned'),
    },
    include: { author: true },
  })

  return {
    id: note.id,
    body: note.body,
    pinned: note.pinned,
    authorName: note.author?.displayName ?? null,
    createdAt: note.createdAt.toISOString(),
  }
}

/**
 * Pin or unpin a note
 * @param {string} noteId - Note identifier
 * @param {boolean} pinned - Wanted state
 * @return {Promise<MemberNote>} - Updated note
 */

export const pinNote = async (noteId: string, pinned: boolean): Promise<MemberNote> => {
  const note = await prisma.accountNote.update({
    where: { id: noteId },
    data: { pinned },
    include: { author: true },
  })

  return {
    id: note.id,
    body: note.body,
    pinned: note.pinned,
    authorName: note.author?.displayName ?? null,
    createdAt: note.createdAt.toISOString(),
  }
}

/**
 * Drop a private note
 * @param {string} noteId - Note identifier
 * @return {Promise<void>} - Removed
 */

export const removeNote = async (noteId: string): Promise<void> => {
  await prisma.accountNote.delete({ where: { id: noteId } })
}

/**
 * Guard a social profile write, a member always owning their own rows
 * @param {string} accountId - Owner identifier
 * @param {string} sessionId - Signed-in member identifier
 * @param {PermissionHelpers} access - Permission helpers
 * @return {void} - Throws when neither owner nor manager
 */

export const assertSocialAccess = (
  accountId: string,
  sessionId: string,
  access: PermissionHelpers
): void => {
  if (accountId === sessionId || access.can(Permissions.MemberUpdate)) return

  throw forbidden()
}

/**
 * Declarations of the social profile form, the member owning every row themselves
 * @type {FieldDefinition[]}
 */

export const SOCIAL_FIELDS: FieldDefinition[] = [
  {
    name: 'label',
    kind: 'text',
    label: MEMBER_COPY.socialLabel,
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
    span: 'half',
  },
  {
    name: 'handle',
    kind: 'text',
    label: MEMBER_COPY.socialHandle,
    required: true,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
    span: 'half',
  },
  { name: 'url', kind: 'url', label: MEMBER_COPY.socialUrl },
  { name: 'accent', kind: 'colour', label: MEMBER_COPY.socialAccent },
]

/**
 * Shape one stored link
 * @param {SocialLink} row - Stored row
 * @return {MemberSocial} - Social profile
 */

const toSocial = (row: SocialLink): MemberSocial => ({
  id: row.id,
  label: row.label,
  handle: row.handle,
  url: row.url,
  accent: row.accent,
})

/**
 * Add a social profile to a member
 * @param {string} accountId - Account identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberSocial>} - Created profile
 */

export const addSocial = async (accountId: string, values: FormValues): Promise<MemberSocial> => {
  const last = await prisma.socialLink.aggregate({
    where: { accountId },
    _max: { position: true },
  })

  const row = await prisma.socialLink.create({
    data: {
      accountId,
      label: readText(values, 'label') ?? '',
      handle: readText(values, 'handle') ?? '',
      url: readText(values, 'url'),
      accent: readText(values, 'accent'),
      position: (last._max.position ?? 0) + 1,
    },
  })

  return toSocial(row)
}

/**
 * Edit a social profile
 * @param {string} linkId - Link identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberSocial>} - Updated profile
 */

export const updateSocial = async (linkId: string, values: FormValues): Promise<MemberSocial> => {
  const row = await prisma.socialLink.update({
    where: { id: linkId },
    data: {
      label: readText(values, 'label') ?? '',
      handle: readText(values, 'handle') ?? '',
      url: readText(values, 'url'),
      accent: readText(values, 'accent'),
    },
  })

  return toSocial(row)
}

/**
 * Drop a social profile
 * @param {string} linkId - Link identifier
 * @return {Promise<void>} - Removed
 */

export const removeSocial = async (linkId: string): Promise<void> => {
  await prisma.socialLink.delete({ where: { id: linkId } })
}

/**
 * Read the account a social profile belongs to
 * @param {string} linkId - Link identifier
 * @return {Promise<string>} - Owner identifier
 */

export const socialOwner = async (linkId: string): Promise<string> => {
  const row = await prisma.socialLink.findUnique({
    where: { id: linkId },
    select: { accountId: true },
  })

  if (!row) throw notFound()

  return row.accountId
}

/**
 * Per-account permission override
 * @typedef {Object} MemberOverride
 * @property {PermissionName} permission - Permission key
 * @property {boolean} allowed - Granted or taken away
 */

export interface MemberOverride {
  permission: PermissionName
  allowed: boolean
}

/**
 * Read the overrides of one member
 * @param {string} accountId - Account identifier
 * @return {Promise<MemberOverride[]>} - Overrides
 */

export const readOverrides = async (accountId: string): Promise<MemberOverride[]> => {
  const rows = await prisma.accountPermission.findMany({ where: { accountId } })

  return rows
    .filter((row) => isPermissionName(row.permission))
    .map((row) => ({
      permission: row.permission as PermissionName,
      allowed: row.effect === PermissionEffects.Allow,
    }))
}

/**
 * Replace the overrides of one member
 * @param {string} accountId - Account identifier
 * @param {MemberOverride[]} overrides - Wanted overrides
 * @return {Promise<MemberOverride[]>} - Stored overrides
 */

export const replaceOverrides = async (
  accountId: string,
  overrides: MemberOverride[]
): Promise<MemberOverride[]> => {
  const account = await prisma.account.findUnique({ where: { id: accountId } })
  if (!account) throw notFound()

  await prisma.$transaction([
    prisma.accountPermission.deleteMany({ where: { accountId } }),
    prisma.accountPermission.createMany({
      data: overrides
        .filter((entry) => isPermissionName(entry.permission))
        .map((entry) => ({
          accountId,
          permission: entry.permission,
          effect: entry.allowed ? PermissionEffects.Allow : PermissionEffects.Deny,
        })),
      skipDuplicates: true,
    }),
  ])

  return readOverrides(accountId)
}
