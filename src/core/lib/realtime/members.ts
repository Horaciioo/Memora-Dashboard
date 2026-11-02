import type { PresenceMember, PresenceSeat, PresenceStatus } from '@/types/presence'

// Display order of statuses
const STATUS_RANK: Record<PresenceStatus, number> = { active: 0, idle: 1, left: 2 }

// Active first, then by name
const orderMembers = (members: PresenceMember[]): PresenceMember[] =>
  members.toSorted(
    (left, right) =>
      STATUS_RANK[left.status] - STATUS_RANK[right.status] || left.name.localeCompare(right.name)
  )

/**
 * One member per account, tabs merged
 * @param {PresenceSeat[]} seats - Open tabs
 * @param {PresenceMember[]} departed - Recently gone
 * @return {PresenceMember[]} - Members, active first
 */

export const membersOf = (seats: PresenceSeat[], departed: PresenceMember[]): PresenceMember[] => {
  const byAccount = new Map<string, PresenceMember>()

  // Any active tab wins, latest block kept
  for (const seat of seats) {
    const known = byAccount.get(seat.accountId)
    const isLatest = !known || seat.at >= known.at
    byAccount.set(seat.accountId, {
      accountId: seat.accountId,
      name: seat.name,
      image: seat.image,
      status: known?.status === 'active' || seat.activity === 'active' ? 'active' : 'idle',
      place: isLatest ? seat.place : (known?.place ?? null),
      at: Math.max(seat.at, known?.at ?? 0),
    })
  }

  // Gone only when no tab remains
  for (const member of departed) {
    if (!byAccount.has(member.accountId))
      byAccount.set(member.accountId, { ...member, status: 'left' })
  }

  return orderMembers([...byAccount.values()])
}
