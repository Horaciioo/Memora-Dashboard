'use server'

import { dismissTrophyNotice } from '@/core/services/play'
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
