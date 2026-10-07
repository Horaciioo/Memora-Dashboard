import 'server-only'

import { prisma } from '@/core/lib/db'
import { memberToken } from '@/declarations/discord/registries'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import type { FieldOption } from '@/types/forms'
import { MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Members an announcement of one creator may mention
 * @param {string | null} youtuberId - Creator the announcement is written for
 * @return {Promise<FieldOption[]>} - Mentions
 */

export const mentionOptions = async (youtuberId: string | null): Promise<FieldOption[]> => {
  const members = await prisma.account.findMany({
    where: {
      status: { in: [MemberStatuses.Active, MemberStatuses.Academy] },
      ...(youtuberId ? { youtubers: { some: { id: youtuberId } } } : {}),
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
