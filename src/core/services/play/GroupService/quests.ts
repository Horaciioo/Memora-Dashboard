import 'server-only'
import { prisma } from '@/core/lib/db'
import { conflict, notFound } from '@/core/lib/errors'
import { readBodyText } from '@/core/lib/play'
import { PLAY_GROUP_ERRORS } from '@/declarations/play'
import {
  groupQuestOf,
  PLAY_GROUP_QUEST_BOOST,
  PlayGroupQuestKinds,
} from '@/declarations/play/groupQuests'
import type { PlayGroupQuestView } from '@/types/play'
import { HOUR_MS } from '@/utils/constants/time'
import { requireHostGroup, tellGroup } from '@/core/services/play/GroupService/shared'

interface QuestRow {
  id: string
  key: string
  startedAt: Date
  completedAt: Date | null
}

interface Member {
  accountId: string
  joinedAt: Date
}

// What each eligible member brought since the quest started
const countFeats = async (
  kind: string,
  since: Date,
  ids: string[]
): Promise<Map<string, number>> => {
  const feats = new Map<string, number>()
  const add = (id: string, by = 1) => feats.set(id, (feats.get(id) ?? 0) + by)
  if (ids.length === 0) return feats

  if (kind === PlayGroupQuestKinds.Words) {
    const answers = await prisma.baccalaureatAnswer.groupBy({
      by: ['accountId'],
      where: {
        accountId: { in: ids },
        valid: true,
        round: { session: { startedAt: { gte: since } } },
      },
      _count: { _all: true },
    })
    for (const row of answers) add(row.accountId, row._count._all)

    return feats
  }

  const seats = await prisma.playSeat.findMany({
    where: {
      accountId: { in: ids },
      outcome: { not: null },
      kickedAt: null,
      session: { finishedAt: { not: null }, startedAt: { gte: since } },
    },
    select: { accountId: true, outcome: true, sessionId: true },
  })

  if (kind === PlayGroupQuestKinds.Together) {
    // A table counts once, for each member who shared it
    const tables = new Map<string, string[]>()
    for (const seat of seats) {
      tables.set(seat.sessionId, [...(tables.get(seat.sessionId) ?? []), seat.accountId])
    }
    for (const table of tables.values()) if (table.length >= 2) table.forEach((id) => add(id))

    return feats
  }

  for (const seat of seats) {
    if (kind === PlayGroupQuestKinds.Played || seat.outcome === 'WIN') add(seat.accountId)
  }

  return feats
}

/**
 * Current quest of a group, paid once when its target is reached
 * @param {string} groupId - Group
 * @param {Member[]} members - Members now, with their arrival
 * @param {string} viewerId - Reader
 * @return {Promise<PlayGroupQuestView | null>} - Latest quest, null when none was ever opened
 */

export const readGroupQuest = async (
  groupId: string,
  members: Member[],
  viewerId: string
): Promise<PlayGroupQuestView | null> => {
  const row: QuestRow | null = await prisma.playGroupQuest.findFirst({
    where: { groupId },
    orderBy: { startedAt: 'desc' },
  })
  const template = row && groupQuestOf(row.key)
  if (!row || !template) return null

  // Late arrivals never count, nor get paid
  const eligible = members.filter((member) => member.joinedAt <= row.startedAt)
  const feats = row.completedAt
    ? new Map<string, number>()
    : await countFeats(
        template.kind,
        row.startedAt,
        eligible.map((member) => member.accountId)
      )
  const total = [...feats.values()].reduce((sum, value) => sum + value, 0)
  let completedAt = row.completedAt

  if (!completedAt && total >= template.target) {
    const doneAt = new Date()
    completedAt = doneAt
    const won = await prisma.$transaction(async (tx) => {
      const marked = await tx.playGroupQuest.updateMany({
        where: { id: row.id, completedAt: null },
        data: { completedAt: doneAt },
      })
      if (marked.count === 0) return false
      const boostUntil = new Date(doneAt.getTime() + PLAY_GROUP_QUEST_BOOST.hours * HOUR_MS)
      for (const member of eligible) {
        await tx.playProfile.upsert({
          where: { accountId: member.accountId },
          create: {
            accountId: member.accountId,
            bonusXp: template.xp,
            questBoostUntil: boostUntil,
          },
          update: { bonusXp: { increment: template.xp }, questBoostUntil: boostUntil },
        })
      }

      return true
    })
    if (!won) completedAt = null
  }

  return {
    id: row.id,
    key: template.key,
    title: template.title,
    hint: template.hint,
    target: template.target,
    xp: template.xp,
    done: Math.min(total, template.target),
    isDone: Boolean(completedAt),
    completedAt: completedAt?.toISOString() ?? null,
    isEligible: eligible.some((member) => member.accountId === viewerId),
    feats: eligible.map((member) => ({
      accountId: member.accountId,
      count: feats.get(member.accountId) ?? 0,
    })),
  }
}

/**
 * Open a quest for the group, once the last one is over
 * @param {string} accountId - Host
 * @param {string} groupId - Group
 * @param {Record<string, unknown>} raw - Body with the template key
 * @return {Promise<void>} - Started
 */

export const startGroupQuest = async (
  accountId: string,
  groupId: string,
  raw: Record<string, unknown>
): Promise<void> => {
  const group = await requireHostGroup(accountId, groupId)
  const template = groupQuestOf(readBodyText(raw, 'key', PLAY_GROUP_ERRORS.questUnknown))
  if (!template) throw notFound(PLAY_GROUP_ERRORS.questUnknown)

  const current = await readGroupQuest(group.id, group.members, accountId)
  if (current && !current.isDone) throw conflict(PLAY_GROUP_ERRORS.questRunning)

  await prisma.playGroupQuest.create({ data: { groupId: group.id, key: template.key } })
  await tellGroup(group)
}
