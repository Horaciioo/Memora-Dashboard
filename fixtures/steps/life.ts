import { prisma, fx } from '../lib/client.ts'
import { HISTORY_DAYS, day, plusMinutes, spanDays } from '../lib/dates.ts'
import { between, chance, pick, sample, weighted } from '../lib/random.ts'
import {
  ABSENCE_REASONS_TEXT,
  ABSENCE_REVIEWS,
  CALENDAR_TITLES,
  LIVECON_REASONS,
} from '../data/texts.ts'
import type { Cast, Person } from './people.ts'
import type { Reference } from './reference.ts'
import type { Work } from './work.ts'

/**
 * Responsables able to review one person's absences
 * @param {Cast} cast - People
 * @param {Person} person - Absent person
 * @return {Person[]} - Reviewers
 */

const reviewersOf = (cast: Cast, person: Person): Person[] => {
  const leads = cast.responsables.filter((lead) =>
    lead.creators.some((creatorId) => person.creators.includes(creatorId))
  )

  return leads.length > 0 ? leads : cast.admins
}

/**
 * Write absences over the whole history
 * @param {Cast} cast - People
 * @return {Promise<{ id: string, accountId: string, reviewerId: string | null, status: string }[]>} - Absences
 */

export const seedAbsences = async (cast: Cast) => {
  const written: { id: string; accountId: string; reviewerId: string | null; status: string }[] = []

  // The root admin takes time off too
  for (const person of [cast.root, ...cast.everyone]) {
    if (person.status === 'PENDING') continue

    // Veterans take more time off than newcomers
    const count =
      person.id === cast.root.id ? 3 : person.status === 'ACADEMY' ? between(0, 1) : between(0, 4)

    for (let index = 0; index < count; index += 1) {
      const startOffset =
        person.status === 'LEFT' ? -between(160, HISTORY_DAYS) : between(-HISTORY_DAYS, 40)
      const length = weighted([
        [1, 20],
        [3, 30],
        [7, 30],
        [14, 15],
        [21, 5],
      ])
      const startDate = day(startOffset)
      const endDate = day(startOffset + length - 1)
      const isFuture = startOffset > 0
      const status: 'PENDING' | 'APPROVED' | 'REFUSED' | 'CANCELLED' = isFuture
        ? weighted([
            ['PENDING', 55],
            ['APPROVED', 40],
            ['CANCELLED', 5],
          ])
        : weighted([
            ['APPROVED', 78],
            ['REFUSED', 8],
            ['CANCELLED', 8],
            ['PENDING', 6],
          ])
      const reviewer =
        status === 'APPROVED' || status === 'REFUSED' ? pick(reviewersOf(cast, person)) : null
      const createdAt = day(startOffset - between(2, 14), between(8, 22))
      const id = fx('absence')

      await prisma.absence.create({
        data: {
          id,
          accountId: person.id,
          startDate,
          endDate,
          dayCount: spanDays(startDate, endDate),
          reasonCode: between(0, 4),
          reason: chance(0.7) ? pick(ABSENCE_REASONS_TEXT) : null,
          status,
          reviewerId: reviewer?.id ?? null,
          reviewedAt: reviewer ? plusMinutes(createdAt, between(60, 2880)) : null,
          reviewNote: reviewer && chance(0.6) ? pick(ABSENCE_REVIEWS) : null,
          createdAt,
        },
      })

      written.push({ id, accountId: person.id, reviewerId: reviewer?.id ?? null, status })
    }
  }

  // Someone is always away today
  for (const person of sample(
    cast.moderators.filter((entry) => entry.status === 'ACTIVE'),
    5
  )) {
    const startDate = day(-between(1, 4))
    const endDate = day(between(2, 9))
    const reviewer = pick(reviewersOf(cast, person))
    const id = fx('absence')

    await prisma.absence.create({
      data: {
        id,
        accountId: person.id,
        startDate,
        endDate,
        dayCount: spanDays(startDate, endDate),
        reasonCode: between(0, 4),
        reason: pick(ABSENCE_REASONS_TEXT),
        status: 'APPROVED',
        reviewerId: reviewer.id,
        reviewedAt: day(-between(5, 8), 14),
        reviewNote: pick(ABSENCE_REVIEWS),
        createdAt: day(-between(9, 12), 10),
      },
    })

    written.push({ id, accountId: person.id, reviewerId: reviewer.id, status: 'APPROVED' })
  }

  return written
}

/**
 * Write the livecon history of every creator
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @return {Promise<{ id: string, actorId: string | null, creatorId: string }[]>} - Entries
 */

export const seedLivecon = async (reference: Reference, cast: Cast) => {
  const written: { id: string; actorId: string | null; creatorId: string }[] = []
  const levelOf = new Map(reference.levels.map((level) => [level.level, level.id]))

  for (const creator of reference.creators) {
    const actors = [
      ...cast.responsables.filter((person) => person.creators.includes(creator.id)),
      ...cast.moderators.filter(
        (person) =>
          person.creators.includes(creator.id) && person.functions.includes('functionLive')
      ),
    ]
    let offset = -HISTORY_DAYS
    let level = 3

    while (offset < 0) {
      const next = offset + between(2, 12)
      // Tight levels never last long
      level =
        level === 3
          ? weighted([
              [2, 60],
              [1, 40],
            ])
          : weighted([
              [3, 70],
              [2, 20],
              [1, 10],
            ])
      const id = fx('livecon')
      const startedAt = day(offset, between(17, 22), between(0, 59))
      const actor = actors.length > 0 ? pick(actors) : null

      await prisma.liveconEntry.create({
        data: {
          id,
          levelId: levelOf.get(level) ?? reference.levels[0].id,
          youtuberId: creator.id,
          actorId: actor?.id ?? null,
          reason: pick(LIVECON_REASONS),
          startedAt,
          endedAt: next < 0 ? day(next, between(17, 22), between(0, 59)) : null,
        },
      })

      written.push({ id, actorId: actor?.id ?? null, creatorId: creator.id })
      offset = next
    }
  }

  return written
}

/**
 * Write the shared calendar: lives, events, recruitment windows, roll calls
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @param {Work} work - Projects and meetings
 * @return {Promise<{ id: string, attendeeIds: string[] }[]>} - Roll-call events
 */

export const seedCalendar = async (reference: Reference, cast: Cast, work: Work) => {
  const template = (name: string) =>
    reference.templates.find((entry) => entry.name === name) ?? null
  const live = template('Live')
  const rollCalls: { id: string; attendeeIds: string[] }[] = []

  // Three to four lives a week per creator
  for (const creator of reference.creators) {
    const owner =
      cast.responsables.find((person) => person.creators.includes(creator.id)) ?? cast.admins[1]

    for (let offset = -56; offset <= 28; offset += 1) {
      if (!chance(0.5)) continue

      const [emoji, title] = pick(CALENDAR_TITLES.slice(0, 2))
      const startsAt = day(offset, pick([18, 19, 20, 21]))

      await prisma.calendarEvent.create({
        data: {
          id: fx('event'),
          title: `${title} · ${creator.name}`,
          emoji,
          kind: 'EVENT',
          templateId: live?.id ?? null,
          accent: live?.accent ?? null,
          ownerId: owner.id,
          youtuberId: creator.id,
          startsAt,
          endsAt: plusMinutes(startsAt, pick([120, 180, 240])),
          visibility: 'EVERYONE',
          remindAt: offset > 0 && chance(0.3) ? plusMinutes(startsAt, -60) : null,
        },
      })
    }
  }

  // Monthly community events
  const community = template('Événement communautaire')
  for (let offset = -170; offset <= 40; offset += between(24, 36)) {
    const creator = pick(reference.creators)
    const project = chance(0.5) ? pick(work.projects) : null

    await prisma.calendarEvent.create({
      data: {
        id: fx('event'),
        title: project ? project.title : `Semaine spéciale · ${creator.name}`,
        emoji: '🎉',
        description: 'Programme détaillé dans le salon annonces.',
        kind: 'PERIOD',
        templateId: community?.id ?? null,
        accent: community?.accent ?? null,
        ownerId: pick(cast.responsables).id,
        youtuberId: creator.id,
        projectId: project?.id ?? null,
        startsAt: day(offset),
        endsAt: day(offset + between(2, 6)),
        allDay: true,
        visibility: 'EVERYONE',
      },
    })
  }

  // Recruitment windows
  const recruitment = template('Période de recrutement')
  for (const offset of [-150, -80, -20, 25]) {
    await prisma.calendarEvent.create({
      data: {
        id: fx('event'),
        title: 'Candidatures ouvertes',
        emoji: '📣',
        kind: 'ZONE',
        templateId: recruitment?.id ?? null,
        accent: recruitment?.accent ?? null,
        ownerId: pick(cast.responsables).id,
        youtuberId: pick(reference.creators).id,
        startsAt: day(offset),
        endsAt: day(offset + 14),
        allDay: true,
        visibility: 'RESPONSABLES',
      },
    })
  }

  // Responsable check-ins and admin maintenance windows
  const leads = template('Point responsables')
  const maintenance = template('Maintenance Discord')
  for (let offset = -120; offset <= 30; offset += 14) {
    const startsAt = day(offset, 21)
    await prisma.calendarEvent.create({
      data: {
        id: fx('event'),
        title: 'Point responsables',
        emoji: '🤝',
        kind: 'EVENT',
        templateId: leads?.id ?? null,
        accent: leads?.accent ?? null,
        ownerId: cast.root.id,
        startsAt,
        endsAt: plusMinutes(startsAt, 45),
        visibility: 'RESPONSABLES',
      },
    })

    if (chance(0.4)) {
      const at = day(offset + 3, 9)
      await prisma.calendarEvent.create({
        data: {
          id: fx('event'),
          title: 'Maintenance du serveur',
          emoji: '🛠️',
          kind: 'EVENT',
          templateId: maintenance?.id ?? null,
          accent: maintenance?.accent ?? null,
          ownerId: cast.root.id,
          startsAt: at,
          endsAt: plusMinutes(at, 120),
          visibility: 'ADMINS',
        },
      })
    }
  }

  // One-to-one moments about a single member
  for (const person of sample(
    cast.moderators.filter((entry) => entry.status !== 'LEFT'),
    12
  )) {
    const startsAt = day(between(-60, 20), 20, 30)
    await prisma.calendarEvent.create({
      data: {
        id: fx('event'),
        title: `Point individuel avec ${person.name}`,
        emoji: '💬',
        kind: 'EVENT',
        ownerId: pick(cast.responsables).id,
        accountId: person.id,
        youtuberId: person.creators[0],
        startsAt,
        endsAt: plusMinutes(startsAt, 30),
        visibility: 'RESPONSABLES',
      },
    })
  }

  // Roll calls on team events
  for (const team of sample(cast.teams, Math.min(8, cast.teams.length))) {
    for (const offset of [between(-40, -5), between(1, 21)]) {
      const startsAt = day(offset, 20)
      const attendeeIds = [...team.memberIds, cast.root.id]
      const id = fx('event')
      const isPast = offset < 0

      await prisma.calendarEvent.create({
        data: {
          id,
          title: 'Soirée vocale d’équipe',
          emoji: '🎙️',
          kind: 'EVENT',
          ownerId: team.leadId ?? cast.root.id,
          youtuberId: team.creatorId,
          startsAt,
          endsAt: plusMinutes(startsAt, 90),
          visibility: 'EVERYONE',
          rollCall: true,
          rollCallTeamIds: [team.id],
          remindAt: isPast ? null : plusMinutes(startsAt, -1440),
          attendances: {
            create: attendeeIds.map((accountId) => {
              const status = isPast
                ? weighted([
                    ['PRESENT', 75],
                    ['ABSENT', 20],
                    ['PENDING', 5],
                  ])
                : accountId === cast.root.id
                  ? 'PENDING'
                  : weighted([
                      ['PENDING', 50],
                      ['PRESENT', 40],
                      ['ABSENT', 10],
                    ])

              return {
                id: fx('attendance'),
                accountId,
                status: status as 'PENDING' | 'PRESENT' | 'ABSENT',
                respondedAt: status === 'PENDING' ? null : day(offset - between(1, 4), 18),
              }
            }),
          },
        },
      })

      rollCalls.push({ id, attendeeIds })
    }
  }

  return rollCalls
}
