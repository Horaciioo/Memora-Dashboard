import 'server-only'

import { decryptField, encryptField } from '@/core/lib/crypto'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readRequiredText, readText } from '@/core/lib/forms/values'
import { findTwitchUser } from '@/core/lib/platforms/twitch/oauth'
import { scopedWhere } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS, LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { LiveNote, ViewerComment } from '@/types/lives'
import { LivePlatforms } from '@/utils/constants/lives'

/**
 * Declarations of the viewer comment form
 * @type {FieldDefinition[]}
 */

export const VIEWER_COMMENT_FIELDS: FieldDefinition[] = [
  {
    name: 'body',
    kind: 'textarea',
    label: MODVIEW_USER_COPY.commentField,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  {
    name: 'login',
    kind: 'text',
    label: MODVIEW_USER_COPY.loginField,
    maxLength: FORM_SETTINGS.shortTextMaxLength,
  },
]

/**
 * Creator and platform of a live in the perimeter
 * @param {string} liveId - Live
 * @param {AccessScope} scope - Reader perimeter
 * @return {Promise<{ youtuberId: string, platform: 'TWITCH' | 'YOUTUBE' }>} - Channel
 */

const channelOf = async (liveId: string, scope: AccessScope) => {
  const live = await prisma.live.findFirst({
    where: scopedWhere('live', scope, { id: liveId }),
    select: { youtuberId: true, platform: true },
  })
  if (!live) throw notFound()

  return live
}

// Comment row and its author
const toComment = (row: {
  id: string
  body: string
  createdAt: Date
  author: { displayName: string } | null
}): ViewerComment => ({
  id: row.id,
  body: decryptField(row.body) ?? '',
  authorName: row.author?.displayName ?? null,
  createdAt: row.createdAt.toISOString(),
})

/**
 * Comments kept on a viewer of the creator's channel
 * @param {string} liveId - Live the card opens on
 * @param {string} viewerId - Platform user identifier
 * @param {AccessScope} scope - Reader perimeter
 * @return {Promise<ViewerComment[]>} - Latest first
 */

export const viewerComments = async (
  liveId: string,
  viewerId: string,
  scope: AccessScope
): Promise<ViewerComment[]> => {
  const channel = await channelOf(liveId, scope)

  const rows = await prisma.viewerComment.findMany({
    where: { ...channel, platformUserId: viewerId },
    include: { author: { select: { displayName: true } } },
    orderBy: { createdAt: 'desc' },
    take: LIVE_SETTINGS.viewerCommentsSize,
  })

  return rows.map(toComment)
}

/**
 * Leave a comment on a viewer
 * @param {Object} input - Comment
 * @param {string} input.liveId - Live the card opens on
 * @param {string} input.viewerId - Platform user identifier
 * @param {string} input.authorId - Member writing
 * @param {FormValues} input.values - Parsed body
 * @param {AccessScope} input.scope - Writer perimeter
 * @return {Promise<ViewerComment>} - Created comment
 */

export const addViewerComment = async (input: {
  liveId: string
  viewerId: string
  authorId: string
  values: FormValues
  scope: AccessScope
}): Promise<ViewerComment> => {
  const channel = await channelOf(input.liveId, input.scope)
  // On Twitch the login comes from Twitch, never from the browser
  const login =
    channel.platform === LivePlatforms.Twitch
      ? (await findTwitchUser(input.viewerId, 'id').catch(() => null))?.login
      : readText(input.values, 'login')

  const row = await prisma.viewerComment.create({
    data: {
      ...channel,
      platformUserId: input.viewerId,
      viewerLogin: login ?? input.viewerId,
      authorAccountId: input.authorId,
      body: encryptField(readRequiredText(input.values, 'body')) ?? '',
    },
    include: { author: { select: { displayName: true } } },
  })

  return toComment(row)
}

/**
 * Notes left on the creator's viewers while a live ran
 * @param {Object} live - Channel and span of the live
 * @param {string} live.youtuberId - Creator
 * @param {'TWITCH' | 'YOUTUBE'} live.platform - Platform
 * @param {Date} live.start - Live start
 * @param {Date} live.end - Live end
 * @return {Promise<LiveNote[]>} - Oldest first
 */

export const liveNotes = async (live: {
  youtuberId: string
  platform: 'TWITCH' | 'YOUTUBE'
  start: Date
  end: Date
}): Promise<LiveNote[]> => {
  const rows = await prisma.viewerComment.findMany({
    where: {
      youtuberId: live.youtuberId,
      platform: live.platform,
      createdAt: { gte: live.start, lte: live.end },
    },
    include: { author: { select: { displayName: true } } },
    orderBy: { createdAt: 'asc' },
    take: LIVE_SETTINGS.logLines,
  })

  return rows.map((row) => ({
    id: row.id,
    authorId: row.authorAccountId,
    authorName: row.author?.displayName ?? '',
    viewerLogin: row.viewerLogin,
    body: decryptField(row.body) ?? '',
    at: row.createdAt.toISOString(),
  }))
}
