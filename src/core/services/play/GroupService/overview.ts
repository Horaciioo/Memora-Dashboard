import 'server-only'
import { prisma } from '@/core/lib/db'
import { groupQuestOf } from '@/declarations/play/groupQuests'
import type { PlayGroupActionView, PlayGroupOverview } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'
import { requireGroup } from '@/core/services/play/GroupService/shared'

// Lines kept in the journal
const JOURNAL_SIZE = 40

/**
 * Statistics and journal of a group, counted since it opened
 * @param {string} accountId - Reader, a member
 * @param {string} groupId - Group
 * @return {Promise<PlayGroupOverview>} - Statistics and journal
 */

export const readGroupOverview = async (
  accountId: string,
  groupId: string
): Promise<PlayGroupOverview> => {
  const group = await requireGroup(accountId, groupId)
  const ids = group.members.map((member) => member.accountId)
  const names = new Map(
    group.members.map((member) => [member.accountId, member.account.displayName])
  )

  const [seats, quests] = await Promise.all([
    prisma.playSeat.findMany({
      where: {
        accountId: { in: ids },
        outcome: { not: null },
        kickedAt: null,
        session: { finishedAt: { not: null }, startedAt: { gte: group.createdAt } },
      },
      select: {
        accountId: true,
        outcome: true,
        sessionId: true,
        xp: true,
        session: { select: { game: true } },
      },
    }),
    prisma.playGroupQuest.findMany({ where: { groupId }, orderBy: { startedAt: 'desc' } }),
  ])

  const tables = new Map<string, number>()
  const games = new Map<PlayGameName, number>()
  const per = new Map(ids.map((id) => [id, { accountId: id, played: 0, wins: 0, xp: 0 }]))
  for (const seat of seats) {
    tables.set(seat.sessionId, (tables.get(seat.sessionId) ?? 0) + 1)
    games.set(seat.session.game, (games.get(seat.session.game) ?? 0) + 1)
    const row = per.get(seat.accountId)
    if (!row) continue
    row.played += 1
    row.xp += seat.xp
    if (seat.outcome === 'WIN') row.wins += 1
  }
  const members = [...per.values()].sort((a, b) => b.xp - a.xp)
  const favourite = [...games.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const actions: PlayGroupActionView[] = [
    ...group.members.map((member) => ({
      id: `joined-${member.id}`,
      kind: 'joined' as const,
      at: member.joinedAt.toISOString(),
      who: member.account.displayName,
      what: null,
    })),
    ...group.messages
      .filter((message) => message.game && message.sessionId)
      .map((message) => ({
        id: `game-${message.id}`,
        kind: 'game' as const,
        at: message.createdAt.toISOString(),
        who: names.get(message.accountId) ?? null,
        what: message.game,
      })),
    ...quests.flatMap((quest) => {
      const title = groupQuestOf(quest.key)?.title ?? null
      const started: PlayGroupActionView = {
        id: `quest-${quest.id}`,
        kind: 'quest',
        at: quest.startedAt.toISOString(),
        who: null,
        what: title,
      }

      return quest.completedAt
        ? [
            started,
            {
              ...started,
              id: `done-${quest.id}`,
              kind: 'questDone' as const,
              at: quest.completedAt.toISOString(),
            },
          ]
        : [started]
    }),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, JOURNAL_SIZE)

  return {
    stats: {
      together: [...tables.values()].filter((count) => count >= 2).length,
      played: seats.length,
      wins: members.reduce((sum, row) => sum + row.wins, 0),
      questsDone: quests.filter((quest) => quest.completedAt).length,
      favourite,
      members,
    },
    actions,
  }
}
