'use server'

import { claimQuest, dismissLevelNotice, dismissTrophyNotice } from '@/core/services/play'
import { requirePermission } from '@/core/wrappers/requireUser'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Mark the trophy back payment as read
 * @return {Promise<void>} - Written
 */

export async function dismissTrophyNoticeAction(): Promise<void> {
  const { session } = await requirePermission(Permissions.PlayAccess)

  await dismissTrophyNotice(session.id)
}

/**
 * Mark the level ladder change as read
 * @return {Promise<void>} - Written
 */

export async function dismissLevelNoticeAction(): Promise<void> {
  const { session } = await requirePermission(Permissions.PlayAccess)

  await dismissLevelNotice(session.id)
}

/**
 * Take the reward of a finished quest
 * @param {string} slot - Quest slot or bonus key
 * @return {Promise<number>} - XP paid
 */

export async function claimQuestAction(slot: string): Promise<number> {
  const { session } = await requirePermission(Permissions.PlayAccess)

  return claimQuest(session.id, slot)
}
