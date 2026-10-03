import 'server-only'

import type { Prisma, SocialLink } from '@prisma/client'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { forbidden, invalidInput, notFound } from '@/core/lib/errors'
import { readFlag, readText } from '@/core/lib/forms/values'
import { layerKey } from '@/core/lib/permissions'
import type { PermissionLayers, PermissionOverwrite } from '@/core/lib/permissions'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { FORM_COPY } from '@/declarations/ui/copy/forms'
import type { PermissionHelpers } from '@/types/auth'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberNote, MemberSocial } from '@/types/members'
import { Permissions, isPermissionName } from '@/utils/constants/permissions'
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
 * Row shape every note reader maps from
 * @type {Prisma.AccountNoteGetPayload}
 */

type NoteRow = Prisma.AccountNoteGetPayload<{ include: { author: true } }>

/**
 * Map a note row to its display shape, the body coming back in clear
 * @param {NoteRow} note - Note row with its author
 * @return {MemberNote} - Display note
 */

export const toMemberNote = (note: NoteRow): MemberNote => ({
  id: note.id,
  body: decryptField(note.body) ?? '',
  pinned: note.pinned,
  authorName: note.author?.displayName ?? null,
  createdAt: note.createdAt.toISOString(),
})

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
      body: encryptField(readText(values, 'body')) ?? '',
      pinned: readFlag(values, 'pinned'),
    },
    include: { author: true },
  })

  return toMemberNote(note)
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

  return toMemberNote(note)
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
    name: 'networkId',
    kind: 'select',
    label: MEMBER_COPY.socialNetwork,
    info: MEMBER_COPY.socialNetworkInfo,
    mark: 'network',
    required: true,
  },
  {
    name: 'handle',
    kind: 'text',
    label: MEMBER_COPY.socialHandle,
    info: MEMBER_COPY.socialHandleInfo,
    required: true,
    prefixFrom: 'networkId',
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]

/**
 * Social form with the declared networks
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const socialFormFields = async (): Promise<FieldDefinition[]> => {
  const networks = await prisma.socialNetwork.findMany({
    where: { archived: false },
    orderBy: { position: 'asc' },
  })

  const options = networks.map((network) => ({
    value: network.id,
    label: network.name,
    image: network.avatarUrl,
    prefix: network.urlPrefix,
  }))

  return SOCIAL_FIELDS.map((field) => (field.name === 'networkId' ? { ...field, options } : field))
}

/**
 * Link row written from the picked network
 * @param {FormValues} values - Parsed body
 * @return {Promise<{ networkId: string, label: string, handle: string, url: string, accent: string | null }>} - Row data
 */

const toLinkData = async (values: FormValues) => {
  const network = await prisma.socialNetwork.findFirst({
    where: { id: readText(values, 'networkId') ?? '', archived: false },
  })

  if (!network) throw invalidInput([{ field: 'networkId', message: FORM_COPY.notAnOption }])

  const handle = readText(values, 'handle') ?? ''

  return {
    networkId: network.id,
    label: network.name,
    handle,
    url: `${network.urlPrefix}${handle}`,
    accent: network.accent,
  }
}

/**
 * Shape one stored link
 * @param {SocialLink} row - Stored row
 * @return {MemberSocial} - Social profile
 */

const toSocial = (row: SocialLink): MemberSocial => ({
  id: row.id,
  networkId: row.networkId,
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
      ...(await toLinkData(values)),
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
    data: await toLinkData(values),
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
 * Read every overwrite layer of one member
 * @param {string} accountId - Account identifier
 * @return {Promise<PermissionLayers>} - Overwrites per layer
 */

export const readOverrides = async (accountId: string): Promise<PermissionLayers> => {
  const rows = await prisma.accountPermission.findMany({ where: { accountId } })
  const layers: PermissionLayers = {}

  for (const row of rows) {
    if (!isPermissionName(row.permission)) continue

    const key = layerKey(row.youtuberId)
    layers[key] = layers[key] ?? []
    layers[key].push({
      permission: row.permission,
      effect:
        row.effect === PermissionEffects.Deny ? PermissionEffects.Deny : PermissionEffects.Allow,
    })
  }

  return layers
}

/**
 * Replace the overwrites of one member on a single layer, the others staying untouched
 * @param {string} accountId - Account identifier
 * @param {PermissionOverwrite[]} overwrites - Wanted overwrites
 * @param {string | null} youtuberId - Creator the layer belongs to
 * @return {Promise<PermissionLayers>} - Stored layers
 */

export const replaceOverrides = async (
  accountId: string,
  overwrites: PermissionOverwrite[],
  youtuberId: string | null = null
): Promise<PermissionLayers> => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { youtubers: { select: { id: true } } },
  })
  if (!account) throw notFound()

  // An overwrite only ever lands on a creator the member is actually attached to
  if (youtuberId !== null && !account.youtubers.some((entry) => entry.id === youtuberId)) {
    throw notFound()
  }

  await prisma.$transaction([
    prisma.accountPermission.deleteMany({ where: { accountId, youtuberId } }),
    prisma.accountPermission.createMany({
      data: overwrites.map((entry) => ({
        accountId,
        permission: entry.permission,
        effect: entry.effect,
        youtuberId,
      })),
      skipDuplicates: true,
    }),
  ])

  return readOverrides(accountId)
}
