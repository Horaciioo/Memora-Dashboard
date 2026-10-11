import 'server-only'

import { prisma } from '@/core/lib/db'
import { memberToken } from '@/declarations/discord/registries'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import type { FieldOption } from '@/types/forms'
import { MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Members an announcement of some creators may mention
 * @param {string[]} youtuberIds - Creators the announcement is written for
 * @return {Promise<FieldOption[]>} - Mentions
 */

export const mentionOptions = async (youtuberIds: string[]): Promise<FieldOption[]> => {
  const members = await prisma.account.findMany({
    where: {
      status: { in: [MemberStatuses.Active, MemberStatuses.Academy] },
      ...(youtuberIds.length > 0 ? { youtubers: { some: { id: { in: youtuberIds } } } } : {}),
    },
    select: { discordId: true, displayName: true, avatarUrl: true },
    orderBy: { displayName: 'asc' },
  })

  return members.map((member) => ({
    value: memberToken(member.discordId),
    label: member.displayName,
    image: member.avatarUrl,
    group: WORK_DISCORD_COPY.membersGroup,
  }))
}
