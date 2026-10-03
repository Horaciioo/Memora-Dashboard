import 'server-only'

import { prisma } from '@/core/lib/db'
import { DISCORD_ANCHOR_REGISTRY, memberToken } from '@/declarations/discord/registries'
import { WORK_DISCORD_COPY } from '@/declarations/work/copy'
import type { FieldOption } from '@/types/forms'
import { MemberStatuses } from '@/utils/constants/hierarchy'

/**
 * Everything an announcement of one creator may mention: members, then its roles and channels
 * @param {string | null} youtuberId - Creator the announcement is written for
 * @return {Promise<FieldOption[]>} - Mentions, each value the token Discord reads
 */

export const mentionOptions = async (youtuberId: string | null): Promise<FieldOption[]> => {
  const [members, anchors] = await Promise.all([
    prisma.account.findMany({
      where: {
        status: { in: [MemberStatuses.Active, MemberStatuses.Academy] },
        ...(youtuberId ? { youtubers: { some: { id: youtuberId } } } : {}),
      },
      select: { discordId: true, displayName: true, avatarUrl: true },
      orderBy: { displayName: 'asc' },
    }),
    prisma.discordAnchor.findMany({
      where: {
        archived: false,
        OR: [{ youtuberId: null }, ...(youtuberId ? [{ youtuberId }] : [])],
      },
      orderBy: [{ kind: 'asc' }, { position: 'asc' }],
    }),
  ])

  return [
    ...members.map((member) => ({
      value: memberToken(member.discordId),
      label: member.displayName,
      image: member.avatarUrl,
      group: WORK_DISCORD_COPY.membersGroup,
    })),
    ...anchors.map((anchor) => {
      const kind = DISCORD_ANCHOR_REGISTRY.get(anchor.kind)

      return {
        value: kind.token(anchor.discordId),
        label: anchor.name,
        accent: anchor.accent ?? undefined,
        group: kind.group,
      }
    }),
  ]
}
