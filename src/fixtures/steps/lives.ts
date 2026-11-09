import { prisma, fx } from '../lib/client.ts'
import { day, plusMinutes } from '../lib/dates.ts'
import { between, pick } from '../lib/random.ts'
import type { Cast, Person } from './people.ts'
import type { Reference } from './reference.ts'

type Kind = 'DELETE' | 'TIMEOUT' | 'BAN' | 'WARN'

// Gestures a moderator spreads over a stretch
const KINDS: Kind[] = ['DELETE', 'DELETE', 'DELETE', 'TIMEOUT', 'TIMEOUT', 'WARN', 'BAN']
const REASONS = ['Spam', 'Insulte', 'Pub non autorisée', 'Spoil', 'Flood', 'Provocation']
// Notes a moderator leaves on a viewer
const NOTES = [
  'Revient après chaque timeout, à surveiller.',
  'Compte créé hier, probablement un contournement de ban.',
  'Habitué sympa, pas de souci.',
  'Spam de liens, prévenu deux fois.',
  'A insulté un autre viewer, s’est excusé ensuite.',
]
const VIEWERS = [
  'xX_pixel_Xx',
  'bigfan42',
  'ghostly',
  'rageBoy',
  'kiwi_toast',
  'nova_77',
  'zeroLag',
]

// Anyone who can sit on a live, fixture or real account
type Who = Pick<Person, 'id' | 'name'>

/**
 * What one moderator did on a live
 * @typedef {Object} Appearance
 * @property {Person} who - Moderator
 * @property {[Date, Date][]} stints - Stretches spent moderating
 * @property {[Date, Date] | null} declared - Hours given on the roll-call, none when skipped
 * @property {'PRESENT' | 'ABSENT' | 'PENDING'} answer - Roll-call answer
 * @property {string | null} reinforcedBy - Responsable who called them in
 * @property {number} gestures - Gestures made
 */

interface Appearance {
  who: Who
  stints: [Date, Date][]
  declared: [Date, Date] | null
  answer: 'PRESENT' | 'ABSENT' | 'PENDING'
  reinforcedBy: string | null
  gestures: number
}

interface LiveSeed {
  title: string
  plannedStart: Date
  plannedEnd: Date
  startedAt: Date
  endedAt: Date
  appearances: Appearance[]
  coordinators: { who: Who; from: Date; to: Date }[]
  // Moderators followed in Focus mode by someone else
  focuses?: { watcher: Who; target: Who; from: Date; to: Date }[]
  // Livecon levels in force along the live
  levels?: { level: number; from: Date; to: Date | null; actor: Who }[]
  // Audience at the top of the bump
  peak?: number
}

/**
 * Write one finished live with its roll-call, time spent and gestures
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @param {Person} owner - Responsable who announced it
 * @param {LiveSeed} seed - What happened
 * @return {Promise<{ id: string, title: string }>} - The live written
 */

const writeLive = async (
  reference: Reference,
  owner: Person,
  seed: LiveSeed
): Promise<{ id: string; title: string }> => {
  const creator = reference.creators[0]
  const template = reference.templates.find((entry) => entry.name === 'Live') ?? null
  const eventId = fx('event')
  const liveId = fx('live')

  await prisma.calendarEvent.create({
    data: {
      id: eventId,
      title: seed.title,
      emoji: '🎥',
      kind: 'EVENT',
      templateId: template?.id ?? null,
      accent: template?.accent ?? null,
      ownerId: owner.id,
      youtuberId: creator.id,
      startsAt: seed.plannedStart,
      endsAt: seed.plannedEnd,
      visibility: 'EVERYONE',
      rollCall: true,
    },
  })

  await prisma.live.create({
    data: {
      id: liveId,
      youtuberId: creator.id,
      platform: 'TWITCH',
      title: seed.title,
      status: 'ENDED',
      plannedStartAt: seed.plannedStart,
      plannedEndAt: seed.plannedEnd,
      startedAt: seed.startedAt,
      endedAt: seed.endedAt,
      announcedById: owner.id,
      calendarEventId: eventId,
      instructions: 'Slow mode à 5 s si le chat s’emballe. Pas de spoil sur la présentation.',
    },
  })

  for (const { who, from, to } of seed.coordinators) {
    await prisma.liveCoordination.create({
      data: {
        id: fx('coordination'),
        liveId,
        accountId: who.id,
        status: 'ACCEPTED',
        startsAt: from,
        endsAt: to,
        respondedAt: plusMinutes(seed.plannedStart, -240),
      },
    })
  }

  for (const focus of seed.focuses ?? []) {
    await prisma.modViewFocus.create({
      data: {
        id: fx('focus'),
        liveId,
        watcherId: focus.watcher.id,
        targetId: focus.target.id,
        startedAt: focus.from,
        endedAt: focus.to,
      },
    })
  }

  for (const entry of seed.levels ?? []) {
    const level = reference.levels.find((row) => row.level === entry.level)
    if (!level) continue
    await prisma.liveconEntry.create({
      data: {
        id: fx('livecon'),
        levelId: level.id,
        youtuberId: creator.id,
        liveId,
        actorId: entry.actor.id,
        reason: pick(['Chat calme', 'Le chat s’emballe', 'Raid en cours', 'Retour au calme']),
        startedAt: entry.from,
        endedAt: entry.to,
      },
    })
  }

  for (const entry of seed.appearances) {
    const { who, declared, answer, reinforcedBy } = entry

    await prisma.liveMember.create({
      data: {
        liveId,
        accountId: who.id,
        reinforcement: reinforcedBy !== null,
        requestedById: reinforcedBy,
      },
    })
    await prisma.eventAttendance.create({
      data: {
        id: fx('attendance'),
        eventId,
        accountId: who.id,
        status: answer,
        respondedAt: answer === 'PENDING' ? null : plusMinutes(seed.plannedStart, -120),
        availableFrom: answer === 'PRESENT' ? (declared?.[0] ?? null) : null,
        availableTo: answer === 'PRESENT' ? (declared?.[1] ?? null) : null,
      },
    })

    for (const [from, to] of entry.stints) {
      const seconds = Math.round((+to - +from) / 1000)

      await prisma.liveModStint.create({
        data: { id: fx('stint'), liveId, accountId: who.id, startedAt: from, stoppedAt: to },
      })
      await prisma.modViewPresence.create({
        data: {
          id: fx('presence'),
          liveId,
          accountId: who.id,
          openedAt: from,
          lastBeatAt: to,
          closedAt: to,
          visibleSeconds: Math.round(seconds * 0.92),
          activeSeconds: Math.round(seconds * 0.6),
          closeReason: 'LIVE_ENDED',
        },
      })

      // A note or two on viewers, the busy ones write more
      if (entry.gestures > 8) {
        for (let index = 0; index < (entry.gestures > 20 ? 2 : 1); index += 1) {
          await prisma.viewerComment.create({
            data: {
              id: fx('note'),
              youtuberId: creator.id,
              platform: 'TWITCH',
              platformUserId: `fx-viewer-${between(1, 7)}`,
              viewerLogin: pick(VIEWERS),
              authorAccountId: who.id,
              // Plain values are read as they are on a dev database
              body: `plain:${pick(NOTES)}`,
              createdAt: new Date(+from + Math.random() * (+to - +from)),
            },
          })
        }
      }

      // Gestures spread over the stretch
      const share = Math.max(1, Math.round(entry.gestures / entry.stints.length))
      for (let index = 0; index < share; index += 1) {
        const kind = pick(KINDS)
        await prisma.moderationAction.create({
          data: {
            id: fx('action'),
            liveId,
            platform: 'TWITCH',
            actorAccountId: who.id,
            actorLogin: who.name.toLowerCase(),
            targetLogin: pick(VIEWERS),
            targetPlatformUserId: `fx-viewer-${between(1, 7)}`,
            kind,
            durationSeconds: kind === 'TIMEOUT' ? pick([60, 300, 600, 1800]) : null,
            reason: kind === 'DELETE' ? null : pick(REASONS),
            liveconLevel: 2,
            origin: 'MEMORA',
            status: 'SUCCEEDED',
            occurredAt: new Date(+from + Math.random() * (+to - +from)),
          },
        })
      }
    }
  }

  // Viewers every five minutes, a bump in the middle
  const minutes = Math.round((+seed.endedAt - +seed.startedAt) / 60_000)
  for (let at = 0; at <= minutes; at += 5) {
    const bump = Math.sin((at / Math.max(minutes, 1)) * Math.PI)
    await prisma.liveSample.create({
      data: {
        id: fx('sample'),
        liveId,
        at: plusMinutes(seed.startedAt, at),
        viewers: Math.round(4000 + bump * ((seed.peak ?? 13000) - 4000) + between(-300, 300)),
      },
    })
  }

  return { id: liveId, title: seed.title }
}

// Report alert of a closed live, still unopened: it reads as a task for who missed the live
const RAISE_REPORT_KIND = 22

/**
 * Raise the report alert of closed lives to members who were not in the Mod View
 * @param {{ id: string, title: string }[]} lives - Lives closed
 * @param {Who[]} recipients - Members who missed them
 * @param {string} actorId - Member who closed them
 * @return {Promise<void>} - Raised
 */

const raiseReports = async (
  lives: { id: string; title: string }[],
  recipients: Who[],
  actorId: string
): Promise<void> => {
  await prisma.notification.createMany({
    data: lives.flatMap((live, index) =>
      recipients.map((who) => ({
        id: fx('notification'),
        recipientId: who.id,
        actorId,
        kind: RAISE_REPORT_KIND,
        targetType: 'liveReport',
        targetId: live.id,
        subject: live.title,
        createdAt: plusMinutes(new Date(), -(60 + index * 90)),
      }))
    ),
  })
}

interface OpenLiveSeed {
  creatorIndex: number
  platform: 'TWITCH' | 'YOUTUBE'
  title: string
  status: 'ANNOUNCED' | 'LIVE' | 'ENDED'
  plannedStart: Date
  plannedEnd: Date
  startedAt: Date | null
  endedAt: Date | null
  // Roll-call and presence of the team
  members: {
    who: Who
    answer: 'PRESENT' | 'ABSENT' | 'PENDING'
    declared: [Date, Date] | null
    reinforcedBy: string | null
    // Stretch still running, the member is in the Mod View now
    since: Date | null
  }[]
  coordinators: { who: Who; status: 'ASKED' | 'ACCEPTED'; from: Date | null; to: Date | null }[]
}

/**
 * Write a live still to come or running, with who is asked and who is in the Mod View
 * @param {Reference} reference - Reference rows
 * @param {Person} owner - Responsable who announced it
 * @param {OpenLiveSeed} seed - State of the live
 * @return {Promise<void>} - Written
 */

const writeOpenLive = async (
  reference: Reference,
  owner: Person,
  seed: OpenLiveSeed
): Promise<void> => {
  const creator = reference.creators[seed.creatorIndex] ?? reference.creators[0]
  const template = reference.templates.find((entry) => entry.name === 'Live') ?? null
  const eventId = fx('event')
  const liveId = fx('live')

  await prisma.calendarEvent.create({
    data: {
      id: eventId,
      title: seed.title,
      emoji: '🎥',
      kind: 'EVENT',
      templateId: template?.id ?? null,
      accent: template?.accent ?? null,
      ownerId: owner.id,
      youtuberId: creator.id,
      startsAt: seed.plannedStart,
      endsAt: seed.plannedEnd,
      visibility: 'EVERYONE',
      rollCall: true,
    },
  })
  await prisma.live.create({
    data: {
      id: liveId,
      youtuberId: creator.id,
      platform: seed.platform,
      title: seed.title,
      status: seed.status,
      plannedStartAt: seed.plannedStart,
      plannedEndAt: seed.plannedEnd,
      startedAt: seed.startedAt,
      endedAt: seed.endedAt,
      announcedById: owner.id,
      calendarEventId: eventId,
      instructions: 'Slow mode à 5 s si le chat s’emballe. Pas de spoil sur la présentation.',
    },
  })

  for (const seat of seed.coordinators) {
    await prisma.liveCoordination.create({
      data: {
        id: fx('coordination'),
        liveId,
        accountId: seat.who.id,
        status: seat.status,
        startsAt: seat.from,
        endsAt: seat.to,
        respondedAt: seat.status === 'ACCEPTED' ? new Date() : null,
      },
    })
  }

  for (const member of seed.members) {
    await prisma.liveMember.create({
      data: {
        liveId,
        accountId: member.who.id,
        reinforcement: member.reinforcedBy !== null,
        requestedById: member.reinforcedBy,
      },
    })
    await prisma.eventAttendance.create({
      data: {
        id: fx('attendance'),
        eventId,
        accountId: member.who.id,
        status: member.answer,
        respondedAt: member.answer === 'PENDING' ? null : new Date(),
        availableFrom: member.answer === 'PRESENT' ? (member.declared?.[0] ?? null) : null,
        availableTo: member.answer === 'PRESENT' ? (member.declared?.[1] ?? null) : null,
      },
    })

    if (member.since) {
      await prisma.liveModStint.create({
        data: { id: fx('stint'), liveId, accountId: member.who.id, startedAt: member.since },
      })
      await prisma.modViewPresence.create({
        data: {
          id: fx('presence'),
          liveId,
          accountId: member.who.id,
          openedAt: member.since,
          lastBeatAt: new Date(),
          visibleSeconds: Math.round((Date.now() - +member.since) / 1000),
          activeSeconds: Math.round((Date.now() - +member.since) / 1500),
        },
      })
    }
  }
}

// Hour of the evening, past 24 it rolls over to the next day
const evening = (hours: number): Date => plusMinutes(day(-2, 0), Math.round(hours * 60))

/**
 * A long live with seventeen moderators: shifts, a coordinator, Focus, levels, absences,
 * reinforcements and a lot of gestures, the one that shows every block of the Bilan
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @param {Person} owner - Responsable who announced it
 * @param {Person} coordinator - Member coordinating
 * @return {Promise<{ id: string, title: string } | null>} - The live written
 */

const writeBigLive = async (
  reference: Reference,
  cast: Cast,
  owner: Person,
  coordinator: Person
): Promise<{ id: string; title: string } | null> => {
  const crowd = cast.moderators.filter(
    (person) => person.status === 'ACTIVE' && person.id !== coordinator.id
  )
  crowd.sort(
    (left, right) =>
      Number(right.functions.includes('functionLive')) -
      Number(left.functions.includes('functionLive'))
  )
  const squad = [coordinator, ...crowd.slice(0, 16)]
  if (squad.length < 17) return null

  // Shifts of the evening: [from, to, declared from, declared to]
  const shifts: [number, number, number | null, number | null][] = [
    [19.95, 22.6, 19.5, 22.5],
    [21, 24, 21, 24],
    [23.5, 25.3, 23, 25.5],
    [22, 25.4, 22, 24],
    [20, 21.5, null, null],
  ]
  const appearances: Appearance[] = squad.map((who, index) => {
    // The coordinator holds the whole live
    if (index === 0) {
      return {
        who,
        declared: [evening(19.5), evening(25.5)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 46,
        stints: [[evening(19.9), evening(25.3)]],
      }
    }
    // One said no, one said yes and never came, one never answered
    if (index === 6) {
      return { who, declared: null, answer: 'ABSENT', reinforcedBy: null, gestures: 0, stints: [] }
    }
    if (index === 8) {
      return {
        who,
        declared: [evening(21), evening(24)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 0,
        stints: [],
      }
    }
    if (index === 10) {
      return {
        who,
        declared: null,
        answer: 'PENDING',
        reinforcedBy: null,
        gestures: 7,
        stints: [[evening(24), evening(25)]],
      }
    }
    // The last ones were called in on the day
    if (index >= 13) {
      return {
        who,
        declared: [evening(22), evening(24)],
        answer: 'PRESENT',
        reinforcedBy: owner.id,
        gestures: between(8, 20),
        stints: [[evening(22.1), evening(24.2)]],
      }
    }
    const [from, to, declaredFrom, declaredTo] = shifts[index % shifts.length]
    const split: [Date, Date][] =
      declaredFrom === null
        ? [
            [evening(from), evening(to)],
            [evening(23), evening(24.5)],
          ]
        : [[evening(from), evening(to)]]

    return {
      who,
      declared: declaredFrom === null ? null : [evening(declaredFrom), evening(declaredTo ?? to)],
      answer: 'PRESENT',
      reinforcedBy: null,
      gestures: between(16, 52),
      stints: split,
    }
  })

  return writeLive(reference, owner, {
    title: 'Grand live, 10 ans de la chaîne',
    plannedStart: evening(20),
    plannedEnd: evening(25),
    startedAt: evening(19.95),
    endedAt: evening(25.35),
    peak: 21000,
    coordinators: [{ who: coordinator, from: evening(19.5), to: evening(25.5) }],
    appearances,
    focuses: [
      { watcher: owner, target: squad[2], from: evening(20.4), to: evening(21.1) },
      { watcher: owner, target: squad[4], from: evening(21.6), to: evening(22.4) },
      { watcher: coordinator, target: squad[5], from: evening(22.2), to: evening(22.8) },
      { watcher: coordinator, target: squad[14], from: evening(23.1), to: evening(23.7) },
      { watcher: owner, target: squad[3], from: evening(24), to: evening(24.5) },
    ],
    levels: [
      { level: 3, from: evening(19.95), to: evening(21.5), actor: coordinator },
      { level: 2, from: evening(21.5), to: evening(23), actor: coordinator },
      { level: 1, from: evening(23), to: evening(23.8), actor: owner },
      { level: 2, from: evening(23.8), to: evening(24.6), actor: coordinator },
      { level: 3, from: evening(24.6), to: evening(25.35), actor: coordinator },
    ],
  })
}

/**
 * Write finished lives that show every case of the bilan and of the moderation logs
 * @param {Reference} reference - Reference rows
 * @param {Cast} cast - People
 * @return {Promise<number>} - Lives written
 */

export const seedLives = async (reference: Reference, cast: Cast): Promise<number> => {
  const creator = reference.creators[0]
  const active = (person: Person) => person.status === 'ACTIVE'
  const team = cast.moderators.filter(
    (person) =>
      active(person) &&
      person.functions.includes('functionLive') &&
      person.creators.includes(creator.id)
  )
  const discord = cast.moderators.filter(
    (person) =>
      active(person) &&
      person.functions.includes('functionDiscord') &&
      !person.functions.includes('functionLive')
  )
  const owner =
    cast.responsables.find((lead) => lead.creators.includes(creator.id)) ?? cast.admins[0]
  if (team.length < 4 || discord.length < 2) return 0

  const [one, two, three, four] = team
  const [helper, volunteer] = discord

  // Yesterday evening: clean, overtime, no show, skipped hours, a reinforcement, a volunteer
  const yesterday = await writeLive(reference, owner, {
    title: 'Terminal 2, Présentation des guests',
    plannedStart: day(-1, 20),
    plannedEnd: day(-1, 23),
    startedAt: day(-1, 20, 4),
    endedAt: day(-1, 23, 30),
    coordinators: [{ who: one, from: day(-1, 20), to: day(-1, 23) }],
    appearances: [
      {
        who: one,
        declared: [day(-1, 20), day(-1, 23)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 34,
        stints: [[day(-1, 20, 2), day(-1, 23, 0)]],
      },
      {
        who: two,
        declared: [day(-1, 20), day(-1, 22)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 22,
        stints: [[day(-1, 20, 5), day(-1, 23, 10)]],
      },
      {
        who: three,
        declared: [day(-1, 21), day(-1, 23)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 0,
        stints: [],
      },
      {
        who: four,
        declared: null,
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 15,
        stints: [
          [day(-1, 20, 30), day(-1, 21, 30)],
          [day(-1, 22), day(-1, 22, 45)],
        ],
      },
      {
        who: helper,
        declared: [day(-1, 21, 30), day(-1, 22, 30)],
        answer: 'PRESENT',
        reinforcedBy: owner.id,
        gestures: 12,
        stints: [[day(-1, 21, 35), day(-1, 22, 40)]],
      },
      {
        who: volunteer,
        declared: null,
        answer: 'PENDING',
        reinforcedBy: null,
        gestures: 6,
        stints: [[day(-1, 22), day(-1, 22, 30)]],
      },
    ],
  })

  // A few days earlier: a quieter one, with a reinforcement
  await writeLive(reference, owner, {
    title: 'Soirée entre potes',
    plannedStart: day(-4, 19),
    plannedEnd: day(-4, 22),
    startedAt: day(-4, 19, 3),
    endedAt: day(-4, 22, 10),
    coordinators: [{ who: two, from: day(-4, 19), to: day(-4, 22) }],
    appearances: [
      {
        who: two,
        declared: [day(-4, 19), day(-4, 22)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 18,
        stints: [[day(-4, 19, 3), day(-4, 22, 10)]],
      },
      {
        who: three,
        declared: [day(-4, 19), day(-4, 21)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 14,
        stints: [[day(-4, 19, 20), day(-4, 21, 5)]],
      },
      {
        who: volunteer,
        declared: [day(-4, 20), day(-4, 21)],
        answer: 'PRESENT',
        reinforcedBy: owner.id,
        gestures: 9,
        stints: [[day(-4, 20, 2), day(-4, 21, 0)]],
      },
    ],
  })

  // Closed before its planned end, a few minutes ago: it can be put back
  const now = new Date()
  await writeLive(reference, owner, {
    title: 'Live du jour, Test',
    plannedStart: plusMinutes(now, -180),
    plannedEnd: plusMinutes(now, 90),
    startedAt: plusMinutes(now, -175),
    endedAt: plusMinutes(now, -30),
    coordinators: [{ who: one, from: plusMinutes(now, -180), to: plusMinutes(now, 90) }],
    appearances: [
      {
        who: one,
        declared: [plusMinutes(now, -180), plusMinutes(now, 90)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 20,
        stints: [[plusMinutes(now, -175), plusMinutes(now, -30)]],
      },
      {
        who: four,
        declared: [plusMinutes(now, -170), plusMinutes(now, 60)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 11,
        stints: [[plusMinutes(now, -168), plusMinutes(now, -35)]],
      },
    ],
  })

  // Real administrators of this database, so the home and the lives page show something to them
  const admins: Who[] = await prisma.account
    .findMany({
      where: { role: 'ADMIN', NOT: { id: { startsWith: 'fx-' } } },
      select: { id: true, displayName: true },
    })
    .then((rows) => rows.map((row) => ({ id: row.id, name: row.displayName })))

  // Closed today, ran to its end: nothing to put back
  const morning = await writeLive(reference, owner, {
    title: 'Live du matin, Réaction',
    plannedStart: plusMinutes(now, -400),
    plannedEnd: plusMinutes(now, -300),
    startedAt: plusMinutes(now, -398),
    endedAt: plusMinutes(now, -290),
    coordinators: [{ who: two, from: plusMinutes(now, -400), to: plusMinutes(now, -300) }],
    appearances: [
      {
        who: two,
        declared: [plusMinutes(now, -400), plusMinutes(now, -300)],
        answer: 'PRESENT',
        reinforcedBy: null,
        gestures: 10,
        stints: [[plusMinutes(now, -398), plusMinutes(now, -290)]],
      },
    ],
  })

  // The big one: seventeen moderators, a coordinator, Focus, levels, reinforcements
  const big = await writeBigLive(reference, cast, owner, one)

  // Nobody from the Responsables was in the Mod View: each gets "Voir le bilan" in their tasks
  await raiseReports(
    big ? [big, morning, yesterday] : [morning, yesterday],
    [owner, ...admins],
    one.id
  )

  // On air now: the team in the Mod View, reinforcements, hours planned for the Team window
  await writeOpenLive(reference, owner, {
    creatorIndex: 0,
    platform: 'TWITCH',
    title: 'Live en cours, Soirée jeux',
    status: 'LIVE',
    plannedStart: plusMinutes(now, -90),
    plannedEnd: plusMinutes(now, 90),
    startedAt: plusMinutes(now, -88),
    endedAt: null,
    coordinators: [
      { who: one, status: 'ACCEPTED', from: plusMinutes(now, -90), to: plusMinutes(now, 90) },
    ],
    members: [
      {
        who: one,
        answer: 'PRESENT',
        declared: [plusMinutes(now, -90), plusMinutes(now, 90)],
        reinforcedBy: null,
        since: plusMinutes(now, -85),
      },
      {
        who: two,
        answer: 'PRESENT',
        declared: [plusMinutes(now, -60), plusMinutes(now, 60)],
        reinforcedBy: null,
        since: plusMinutes(now, -58),
      },
      {
        who: three,
        answer: 'PRESENT',
        declared: [plusMinutes(now, 20), plusMinutes(now, 120)],
        reinforcedBy: null,
        since: null,
      },
      { who: four, answer: 'PENDING', declared: null, reinforcedBy: null, since: null },
      {
        who: helper,
        answer: 'PRESENT',
        declared: [plusMinutes(now, -30), plusMinutes(now, 60)],
        reinforcedBy: owner.id,
        since: plusMinutes(now, -28),
      },
      ...admins.map((who) => ({
        who,
        answer: 'PENDING' as const,
        declared: null,
        reinforcedBy: owner.id,
        since: null,
      })),
    ],
  })

  // Tonight: doors open in the preparation hour, nobody covers the first hours yet
  await writeOpenLive(reference, owner, {
    creatorIndex: 0,
    platform: 'TWITCH',
    title: 'Live de ce soir, Q&A',
    status: 'ANNOUNCED',
    plannedStart: plusMinutes(now, 40),
    plannedEnd: plusMinutes(now, 280),
    startedAt: null,
    endedAt: null,
    coordinators: [
      { who: two, status: 'ACCEPTED', from: plusMinutes(now, 160), to: plusMinutes(now, 280) },
      { who: three, status: 'ASKED', from: null, to: null },
      ...admins.map((who) => ({ who, status: 'ASKED' as const, from: null, to: null })),
    ],
    members: [
      { who: one, answer: 'PENDING', declared: null, reinforcedBy: null, since: null },
      {
        who: two,
        answer: 'PRESENT',
        declared: [plusMinutes(now, 150), plusMinutes(now, 290)],
        reinforcedBy: null,
        since: null,
      },
      { who: three, answer: 'PENDING', declared: null, reinforcedBy: null, since: null },
      { who: four, answer: 'ABSENT', declared: null, reinforcedBy: null, since: null },
      ...admins.map((who) => ({
        who,
        answer: 'PENDING' as const,
        declared: null,
        reinforcedBy: null,
        since: null,
      })),
    ],
  })

  // Tomorrow: too early to enter, a YouTube live, the coordinators only asked
  await writeOpenLive(reference, owner, {
    creatorIndex: 1,
    platform: 'YOUTUBE',
    title: 'Live de demain, Annonce',
    status: 'ANNOUNCED',
    plannedStart: day(1, 21),
    plannedEnd: day(1, 23),
    startedAt: null,
    endedAt: null,
    coordinators: [
      { who: one, status: 'ASKED', from: null, to: null },
      { who: four, status: 'ASKED', from: null, to: null },
    ],
    members: [
      { who: one, answer: 'PENDING', declared: null, reinforcedBy: null, since: null },
      { who: two, answer: 'PENDING', declared: null, reinforcedBy: null, since: null },
      ...admins.map((who) => ({
        who,
        answer: 'PENDING' as const,
        declared: null,
        reinforcedBy: null,
        since: null,
      })),
    ],
  })

  return 8
}
