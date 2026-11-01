import 'server-only'

import type { ModerationKind } from '@prisma/client'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput, notFound } from '@/core/lib/errors'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import { FORM_COPY } from '@/declarations/ui/copy/forms'

/**
 * Fields of a gesture a responsable corrects
 * @typedef {Object} GesturePatch
 * @property {string} [kind] - Kind of gesture
 * @property {string | null} [targetLogin] - Viewer aimed at
 * @property {number | null} [durationSeconds] - Timeout length
 * @property {string | null} [reason] - Reason given
 */

export interface GesturePatch {
  kind?: string
  targetLogin?: string | null
  durationSeconds?: number | null
  reason?: string | null
}

/**
 * Correct one gesture of a live
 * @param {string} liveId - Live
 * @param {string} actionId - Gesture
 * @param {GesturePatch} patch - Fields to change
 * @return {Promise<void>}
 */

export const editGesture = async (
  liveId: string,
  actionId: string,
  patch: GesturePatch
): Promise<void> => {
  if (patch.kind !== undefined && !(patch.kind in MODERATION_KINDS)) {
    throw invalidInput([{ field: 'kind', message: FORM_COPY.notAnOption }])
  }
  if (patch.durationSeconds != null && !(patch.durationSeconds >= 0)) {
    throw invalidInput([{ field: 'durationSeconds', message: FORM_COPY.notAnOption }])
  }

  const done = await prisma.moderationAction.updateMany({
    where: { id: actionId, liveId },
    data: {
      ...(patch.kind !== undefined && { kind: patch.kind as ModerationKind }),
      ...(patch.targetLogin !== undefined && { targetLogin: patch.targetLogin }),
      ...(patch.durationSeconds !== undefined && { durationSeconds: patch.durationSeconds }),
      ...(patch.reason !== undefined && { reason: patch.reason }),
    },
  })
  if (done.count === 0) throw notFound()
}

/**
 * Erase one gesture of a live
 * @param {string} liveId - Live
 * @param {string} actionId - Gesture
 * @return {Promise<void>}
 */

export const removeGesture = async (liveId: string, actionId: string): Promise<void> => {
  const done = await prisma.moderationAction.deleteMany({ where: { id: actionId, liveId } })
  if (done.count === 0) throw notFound()
}

/**
 * Set the time a member moderated a live, folded into their latest session
 * @param {string} liveId - Live
 * @param {string} accountId - Member
 * @param {number} activeSeconds - Time active in the Mod View
 * @return {Promise<void>}
 */

export const editModTime = async (
  liveId: string,
  accountId: string,
  activeSeconds: number
): Promise<void> => {
  if (!(activeSeconds >= 0))
    throw invalidInput([{ field: 'activeSeconds', message: FORM_COPY.notAnOption }])

  const sessions = await prisma.modViewPresence.findMany({
    where: { liveId, accountId },
    orderBy: { openedAt: 'asc' },
  })
  const last = sessions.at(-1)
  if (!last) throw conflict()

  const others = sessions.slice(0, -1).reduce((sum, row) => sum + row.activeSeconds, 0)
  const active = Math.max(0, Math.round(activeSeconds) - others)

  await prisma.modViewPresence.update({
    where: { id: last.id },
    data: { activeSeconds: active, visibleSeconds: Math.max(last.visibleSeconds, active) },
  })
}

/**
 * Rename a live
 * @param {string} liveId - Live
 * @param {string} title - New title
 * @return {Promise<void>}
 */

export const renameLive = async (liveId: string, title: string): Promise<void> => {
  const name = title.trim()
  if (!name) throw invalidInput([{ field: 'title', message: FORM_COPY.required }])

  await prisma.live.update({ where: { id: liveId }, data: { title: name } })
}
