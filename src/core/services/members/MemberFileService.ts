import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readDate, readFlag, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_COPY } from '@/declarations/members/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberNote, MemberPim, MemberSocial } from '@/types/members'
import { isPermissionName } from '@/utils/constants/permissions'
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
 * Declarations of the individual review form
 * @type {FieldDefinition[]}
 */

export const PIM_FIELDS: FieldDefinition[] = [
  { name: 'heldAt', kind: 'date', label: MEMBER_COPY.pimDate, required: true, span: 'half' },
  {
    name: 'sheet',
    kind: 'markdown',
    label: MEMBER_COPY.pimSheet,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
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
 * Record an individual review
 * @param {string} accountId - Account identifier
 * @param {string} authorId - Author identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberPim>} - Created review
 */

export const addPim = async (
  accountId: string,
  authorId: string,
  values: FormValues
): Promise<MemberPim> => {
  const pim = await prisma.pim.create({
    data: {
      accountId,
      authorId,
      heldAt: readDate(values, 'heldAt') ?? new Date(),
      sheet: readText(values, 'sheet') ?? '',
    },
    include: { author: true },
  })

  return {
    id: pim.id,
    heldAt: pim.heldAt.toISOString(),
    sheet: pim.sheet,
    authorName: pim.author?.displayName ?? null,
  }
}

/**
 * Edit an individual review
 * @param {string} pimId - Review identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<MemberPim>} - Updated review
 */

export const updatePim = async (pimId: string, values: FormValues): Promise<MemberPim> => {
  const pim = await prisma.pim.update({
    where: { id: pimId },
    data: {
      heldAt: readDate(values, 'heldAt') ?? undefined,
      sheet: readText(values, 'sheet') ?? '',
    },
    include: { author: true },
  })

  return {
    id: pim.id,
    heldAt: pim.heldAt.toISOString(),
    sheet: pim.sheet,
    authorName: pim.author?.displayName ?? null,
  }
}

/**
 * Drop an individual review
 * @param {string} pimId - Review identifier
 * @return {Promise<void>} - Removed
 */

export const removePim = async (pimId: string): Promise<void> => {
  await prisma.pim.delete({ where: { id: pimId } })
}

/**
 * Build the social profile form declarations
 * @return {Promise<FieldDefinition[]>} - One field per declared network
 */

export const socialFields = async (): Promise<FieldDefinition[]> => {
  const networks = await prisma.socialNetwork.findMany({ orderBy: { position: 'asc' } })

  return networks.map((network) => ({
    name: network.id,
    kind: 'text',
    label: network.name,
    placeholder: network.urlPrefix ?? undefined,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
    span: 'half',
  }))
}

/**
 * Replace every social profile of a member
 * @param {string} accountId - Account identifier
 * @param {FormValues} values - Parsed body, keyed by network identifier
 * @return {Promise<MemberSocial[]>} - Stored profiles
 */

export const replaceSocials = async (
  accountId: string,
  values: FormValues
): Promise<MemberSocial[]> => {
  const networks = await prisma.socialNetwork.findMany({ orderBy: { position: 'asc' } })

  // A blank handle removes the link rather than storing an empty row
  const writes = networks.map((network) => {
    const handle = readText(values, network.id)

    if (!handle) {
      return prisma.socialLink.deleteMany({ where: { accountId, networkId: network.id } })
    }

    const url = network.urlPrefix ? `${network.urlPrefix}${handle}` : null

    return prisma.socialLink.upsert({
      where: { accountId_networkId: { accountId, networkId: network.id } },
      update: { handle, url },
      create: { accountId, networkId: network.id, handle, url },
    })
  })

  await prisma.$transaction(writes)

  const links = await prisma.socialLink.findMany({
    where: { accountId },
    include: { network: true },
    orderBy: { network: { position: 'asc' } },
  })

  return links.map((link) => ({
    id: link.id,
    networkId: link.networkId,
    networkName: link.network.name,
    accent: link.network.accent,
    handle: link.handle,
    url: link.url,
  }))
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
