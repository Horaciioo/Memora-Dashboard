import 'server-only'

import { prisma } from '@/core/lib/db'
import { SEAT_COPY } from '@/declarations/members/seats'
import type { ParticipationRole } from '@/types/members'
import type { SessionParticipant } from '@/types/recruitment'

// Person a seat names
interface Person {
  id: string
  displayName: string
  avatarUrl: string | null
}

/**
 * Everyone affiliated to a session: its responsables, its recruiters, its observers, and those who sat in an interview
 * @param {string} sessionId - Session identifier
 * @return {Promise<SessionParticipant[]>} - One line per member, archives deleted shown unidentified
 */

export const readParticipants = async (sessionId: string): Promise<SessionParticipant[]> => {
  const seats = { include: { account: true } } as const
  const [responsables, recruiters, observers, candidates] = await Promise.all([
    prisma.recruitmentResponsable.findMany({ where: { sessionId }, ...seats }),
    prisma.recruitmentRecruiter.findMany({ where: { sessionId }, ...seats }),
    prisma.recruitmentObserver.findMany({ where: { sessionId }, ...seats }),
    prisma.recruitmentCandidate.findMany({
      where: { sessionId },
      select: {
        recruiters: { select: { account: true } },
        observers: { select: { account: true } },
      },
    }),
  ])

  const hidden = new Set(
    [...recruiters, ...observers].filter((seat) => seat.forgottenAt).map((seat) => seat.accountId)
  )
  const revoked = new Set(
    [...recruiters, ...observers].filter((seat) => seat.revokedAt).map((seat) => seat.accountId)
  )
  const temporary = new Set([...recruiters, ...observers].map((seat) => seat.accountId))

  const lines = new Map<string, SessionParticipant>()
  const lineOf = (person: Person) => {
    const line = lines.get(person.id) ?? {
      id: person.id,
      name: person.displayName,
      avatarUrl: person.avatarUrl,
      roles: [] as ParticipationRole[],
      led: 0,
      observed: 0,
      isTemporary: temporary.has(person.id),
      isRevoked: revoked.has(person.id),
    }
    lines.set(person.id, line)

    return line
  }
  const add = (person: Person, role: ParticipationRole) => {
    const line = lineOf(person)
    if (!line.roles.includes(role)) line.roles.push(role)

    return line
  }

  for (const seat of responsables) add(seat.account, 'responsable')
  for (const seat of recruiters) add(seat.account, 'recruiter')
  for (const seat of observers) add(seat.account, 'observer')
  for (const candidate of candidates) {
    for (const { account } of candidate.recruiters) add(account, 'recruiter').led++
    for (const { account } of candidate.observers) add(account, 'observer').observed++
  }

  return [...lines.values()].map((line) =>
    hidden.has(line.id)
      ? {
          ...line,
          id: '',
          name: SEAT_COPY.unidentified[
            line.roles.includes('observer') && !line.roles.includes('recruiter')
              ? 'observer'
              : 'recruiter'
          ],
          avatarUrl: null,
          isTemporary: false,
          isRevoked: false,
        }
      : line
  )
}
