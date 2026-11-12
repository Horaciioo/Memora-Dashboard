import { decryptField } from '@/core/lib/crypto'
import { allowedActions } from '@/core/lib/unban/actions'
import { readAnswers } from '@/core/lib/unban/answers'
import { linkStateOf } from '@/core/lib/unban/linkState'
import type { UnbanCaller } from '@/core/services/unban/links/shared'
import type { UnbanPerson, UnbanRequestDetail, UnbanRequestItem } from '@/types/unban'
import type { Prisma } from '@prisma/client'

// Member columns shown beside a request
const PERSON = { select: { id: true, displayName: true, avatarUrl: true } } as const

// What a list row carries, nothing sealed
export const ITEM_INCLUDE = { assignee: PERSON, youtuber: { select: { name: true } } } as const

// What the file carries on top
export const DETAIL_INCLUDE = {
  ...ITEM_INCLUDE,
  decidedBy: PERSON,
  liftedBy: PERSON,
  formVersion: { select: { id: true, number: true } },
  link: { select: { id: true, expiresAt: true, usedAt: true, revokedAt: true } },
} as const

export type ItemRow = Prisma.UnbanRequestGetPayload<{ include: typeof ITEM_INCLUDE }>
export type DetailRow = Prisma.UnbanRequestGetPayload<{ include: typeof DETAIL_INCLUDE }>

type PersonRow = { id: string; displayName: string; avatarUrl: string | null } | null

/**
 * Member as shown beside a request
 * @param {PersonRow} row - Account columns
 * @return {UnbanPerson | null} - Person
 */

const toPerson = (row: PersonRow): UnbanPerson | null =>
  row && { id: row.id, name: row.displayName, avatarUrl: row.avatarUrl }

/**
 * Row of the list
 * @param {ItemRow} row - Stored request
 * @return {UnbanRequestItem} - List item
 */

export const toItem = (row: ItemRow): UnbanRequestItem => ({
  id: row.id,
  reference: row.reference,
  status: row.status,
  youtuberId: row.youtuberId,
  youtuberName: row.youtuber.name,
  discordId: row.discordId,
  discordName: row.discordName,
  discordAvatar: row.discordAvatar,
  assignee: toPerson(row.assignee),
  submittedAt: row.submittedAt.toISOString(),
  statusChangedAt: row.statusChangedAt.toISOString(),
})

/**
 * File of a request, with the actions the caller may take on it
 * @param {DetailRow} row - Stored request
 * @param {number} activeFormNumber - Form version served now
 * @param {UnbanCaller} caller - Who reads
 * @return {UnbanRequestDetail} - Detail
 */

export const toDetail = (
  row: DetailRow,
  activeFormNumber: number,
  caller: UnbanCaller
): UnbanRequestDetail => ({
  ...toItem(row),
  version: row.version,
  answers: readAnswers(row.answers),
  formVersion: row.formVersion,
  activeFormNumber,
  reviewNote: decryptField(row.reviewNote),
  decidedAt: row.decidedAt?.toISOString() ?? null,
  decidedBy: toPerson(row.decidedBy),
  discordLiftedAt: row.discordLiftedAt?.toISOString() ?? null,
  discordLiftedBy: toPerson(row.liftedBy),
  link: {
    id: row.link.id,
    state: linkStateOf(row.link),
    expiresAt: row.link.expiresAt.toISOString(),
  },
  actions: allowedActions({
    status: row.status,
    assigneeId: row.assigneeId,
    actorId: caller.actorId,
    access: caller.access,
  }),
})
