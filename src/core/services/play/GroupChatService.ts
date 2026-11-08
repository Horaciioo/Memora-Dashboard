import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { requireGroup, tellGroup } from '@/core/services/play/GroupService'
import { PLAY_GROUP_ERRORS, PLAY_SETTINGS } from '@/declarations/play'

/**
 * Write a line in the chat of a group
 * @param {string} accountId - Author, a member
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the text
 * @return {Promise<void>} - Written
 */

export const sendGroupMessage = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const group = await requireGroup(accountId, groupId)
  const body = readBodyText(raw, 'body', PLAY_GROUP_ERRORS.message)
  if (body.length > PLAY_SETTINGS.group.messageMax) {
    throw invalidInput([{ field: 'body', message: PLAY_GROUP_ERRORS.messageLong }])
  }
  await prisma.playGroupMessage.create({ data: { groupId: group.id, accountId, body } })
  await tellGroup(group)
}
