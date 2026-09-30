import { prisma, fx, fxDiscordId } from '../lib/client.ts'
import { day } from '../lib/dates.ts'
import { between, chance, pick, sample, weighted } from '../lib/random.ts'
import {
  CO_ADMIN,
  LANGUAGE_SETS,
  MODERATOR_NAMES,
  RESPONSABLES,
  TIMEZONES,
  type FunctionKey,
} from '../data/roster.ts'
import { MEMBER_NOTES } from '../data/texts.ts'
import { memberPortrait, storeImage } from './images.ts'
import type { Reference } from './reference.ts'

type Role = 'ADMIN' | 'RESPONSABLE' | 'MODERATEUR'
type Status = 'PENDING' | 'ACADEMY' | 'ACTIVE' | 'PAUSED' | 'LEFT'

/**
 * One person of the fixtures, as later steps need them
 * @typedef {Object} Person
 */

export interface Person {
  id: string
  name: string
  discordId: string
  role: Role
  status: Status
  creators: string[]
  functions: FunctionKey[]
  joinedAt: Date
  leftAt: Date | null
}

/**
 * People of the fixtures, the real root administrator included
 * @typedef {Object} Cast
 */

export interface Cast {
  root: Person
  admins: Person[]
  responsables: Person[]
  moderators: Person[]
  everyone: Person[]
  teams: { id: string; creatorId: string; leadId: string | null; memberIds: string[] }[]
}

/**
 * Lowercase handle of a pseudo
 * @param {string} name - Pseudo
 * @return {string} - Handle
 */

const slug = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()

/**
 * French mobile number
 * @return {string} - Phone
 */

const phone = (): string =>
  `+33 6 ${Array.from({ length: 4 }, () => String(between(10, 99))).join(' ')}`

/**
 * Division rank a status and seniority lead to
 * @param {Status} status - Membership status
 * @return {number | null} - Division rank
 */

const divisionRank = (status: Status): number | null => {
  if (status === 'ACADEMY' || status === 'PENDING') return 0
  if (status === 'LEFT' && chance(0.4)) return null

  return weighted([
    [1, 45],
    [2, 35],
    [3, 20],
  ])
}

/**
 * Write one account with everything its file shows
 * @param {object} seed - Who to write
 * @param {Reference} reference - Reference rows
 * @param {number} index - Rank, used for identifiers and colours
 * @return {Promise<Person>} - Written person
 */

const writeAccount = async (
  seed: {
    name: string
    role: Role
    status: Status
    creators: string[]
    functions: FunctionKey[]
    joinedAt: Date
    leftAt: Date | null
    divisionRank: number | null
  },
  reference: Reference,
  index: number
): Promise<Person> => {
  const id = fx('account')
  const discordId = fxDiscordId(index)
  const anonymised = seed.status === 'LEFT' && chance(0.5)
  const handle = slug(seed.name)
  const avatarUrl = chance(0.85)
    ? await storeImage('avatars', memberPortrait(seed.name, index))
    : null
  const division = reference.divisions.find((entry) => entry.rank === seed.divisionRank)

  await prisma.account.create({
    data: {
      id,
      discordId,
      discordUsername: anonymised ? null : handle,
      displayName: seed.name,
      email: anonymised || chance(0.25) ? null : `${handle}@example.com`,
      phone: anonymised || chance(0.45) ? null : phone(),
      birthday:
        anonymised || chance(0.15)
          ? null
          : new Date(Date.UTC(between(1994, 2008), between(0, 11), between(1, 28))),
      celebrateBirthday: chance(0.7),
      joinedAt: seed.joinedAt,
      leftAt: seed.leftAt,
      anonymisedAt: anonymised ? seed.leftAt : null,
      historyConsentAt: seed.joinedAt,
      historyConsentVersion: 1,
      languages: pick(LANGUAGE_SETS),
      timezone: pick(TIMEZONES),
      avatarUrl,
      role: seed.role,
      status: seed.status,
      divisionId: division?.id ?? null,
      createdAt: seed.joinedAt,
      youtubers: { connect: seed.creators.map((creatorId) => ({ id: creatorId })) },
      functions: {
        create: seed.functions.map((key) => ({
          id: fx('account-function'),
          functionId: reference.functions[key].id,
        })),
      },
    },
  })

  return { id, discordId, ...seed }
}

/**
 * Principal functions of a moderator, most hold one, a few hold two
 * @return {FunctionKey[]} - Functions
 */

const principalFunctions = (): FunctionKey[] =>
  weighted<FunctionKey[]>([
    [['functionDiscord'], 42],
    [['functionLive'], 38],
    [['functionAnimator'], 8],
    [['functionDiscord', 'functionLive'], 12],
  ])

/**
 * Write every fixture person, their teams and their file contents
 * @param {Reference} reference - Reference rows
 * @return {Promise<Cast>} - People and teams
 */

export const seedPeople = async (reference: Reference): Promise<Cast> => {
  const rootDiscordId = process.env.ADMIN_DISCORD_ID?.trim() ?? ''
  const rootRow = await prisma.account.findUnique({ where: { discordId: rootDiscordId } })
  if (!rootRow) throw new Error('Compte administrateur racine absent, lance d’abord yarn db:seed')

  const root: Person = {
    id: rootRow.id,
    name: rootRow.displayName,
    discordId: rootRow.discordId,
    role: 'ADMIN',
    status: 'ACTIVE',
    creators: reference.creators.map((creator) => creator.id),
    functions: [],
    joinedAt: rootRow.joinedAt,
    leftAt: null,
  }

  const creatorByName = new Map(reference.creators.map((creator) => [creator.name, creator.id]))
  let index = 1

  const coAdmin = await writeAccount(
    {
      name: CO_ADMIN.name,
      role: 'ADMIN',
      status: 'ACTIVE',
      creators: [],
      functions: [],
      joinedAt: day(-CO_ADMIN.seniority),
      leftAt: null,
      divisionRank: 3,
    },
    reference,
    index++
  )

  const responsables: Person[] = []
  for (const seed of RESPONSABLES) {
    responsables.push(
      await writeAccount(
        {
          name: seed.name,
          role: 'RESPONSABLE',
          status: 'ACTIVE',
          creators: [creatorByName.get(seed.creator)!],
          functions: seed.functions,
          joinedAt: day(-seed.seniority),
          leftAt: null,
          divisionRank: 3,
        },
        reference,
        index++
      )
    )
  }

  const moderators: Person[] = []
  for (const [position, name] of MODERATOR_NAMES.entries()) {
    const status = weighted<Status>([
      ['ACTIVE', 62],
      ['ACADEMY', 14],
      ['PAUSED', 7],
      ['PENDING', 5],
      ['LEFT', 12],
    ])
    const isNew = status === 'ACADEMY' || status === 'PENDING'
    const joinedAt = isNew ? day(-between(3, 40)) : day(-between(60, 900))
    const leftAt = status === 'LEFT' ? day(-between(5, 150)) : null
    const main = reference.creators[position % reference.creators.length].id
    const second = chance(0.15) ? pick(reference.creators).id : main
    const secondaries: FunctionKey[] =
      status === 'ACTIVE' && chance(0.22)
        ? [pick<FunctionKey>(['functionRecruiter', 'functionTrainer'])]
        : []

    moderators.push(
      await writeAccount(
        {
          name,
          role: 'MODERATEUR',
          status,
          creators: [...new Set([main, second])],
          functions: [...principalFunctions(), ...secondaries],
          joinedAt,
          leftAt,
          divisionRank: divisionRank(status),
        },
        reference,
        index++
      )
    )
  }

  // Each responsable anchored on their creator, as only an administrator can do
  for (const responsable of responsables) {
    await prisma.youtuberLead.create({
      data: { id: fx('lead'), youtuberId: responsable.creators[0], accountId: responsable.id },
    })
  }

  const teams = await seedTeams(reference, responsables, moderators)
  const everyone = [coAdmin, ...responsables, ...moderators]

  await seedFileContents(reference, everyone, responsables)

  return { root, admins: [root, coAdmin], responsables, moderators, everyone, teams }
}

// Teams every creator splits its moderators into
const TEAM_NAMES: [string, string, FunctionKey | null][] = [
  ['Lives du soir', 'Couvre les lives de 19 h à la fin.', 'functionLive'],
  ['Discord', 'Tickets, salons et automod.', 'functionDiscord'],
  ['Week-end', 'Relais du samedi et du dimanche.', null],
]

/**
 * Split each creator's moderators into teams led by its responsables
 * @param {Reference} reference - Reference rows
 * @param {Person[]} responsables - Responsables
 * @param {Person[]} moderators - Moderators
 * @return {Promise<Cast['teams']>} - Teams
 */

const seedTeams = async (
  reference: Reference,
  responsables: Person[],
  moderators: Person[]
): Promise<Cast['teams']> => {
  const teams: Cast['teams'] = []

  for (const creator of reference.creators) {
    const leads = responsables.filter((person) => person.creators.includes(creator.id))
    const pool = moderators.filter(
      (person) => person.creators.includes(creator.id) && person.status !== 'LEFT'
    )

    for (const [position, [name, summary, key]] of TEAM_NAMES.entries()) {
      const members = pool.filter((person) => (key ? person.functions.includes(key) : chance(0.35)))
      const lead = leads.length > 0 ? leads[position % leads.length] : null
      const id = fx('team')

      await prisma.team.create({
        data: {
          id,
          name: `${name} · ${creator.name}`,
          summary,
          leadId: lead?.id ?? null,
          youtuberId: creator.id,
          archived: false,
          members: {
            create: members.map((person) => ({ id: fx('team-member'), accountId: person.id })),
          },
        },
      })

      teams.push({
        id,
        creatorId: creator.id,
        leadId: lead?.id ?? null,
        memberIds: members.map((person) => person.id),
      })
    }
  }

  // One old team, archived, so the archive has something to show
  const archived = fx('team')
  await prisma.team.create({
    data: {
      id: archived,
      name: 'Équipe été 2025',
      summary: 'Renfort estival, dissoute à la rentrée.',
      youtuberId: reference.creators[0].id,
      archived: true,
    },
  })

  return teams
}

/**
 * Fill what each moderator file shows: networks, constraints, private notes, overrides
 * @param {Reference} reference - Reference rows
 * @param {Person[]} everyone - Fixture people
 * @param {Person[]} responsables - Authors of the notes
 * @return {Promise<void>} - Written
 */

const seedFileContents = async (
  reference: Reference,
  everyone: Person[],
  responsables: Person[]
): Promise<void> => {
  for (const person of everyone) {
    if (chance(0.65)) {
      const networks = sample(reference.networks, between(1, 3))
      await prisma.socialLink.createMany({
        data: networks.map((network, position) => ({
          id: fx('social'),
          accountId: person.id,
          networkId: network.id,
          label: network.name,
          handle: slug(person.name),
          url: `${network.urlPrefix}${slug(person.name)}`,
          accent: network.accent,
          position,
        })),
      })
    }

    if (chance(0.1)) {
      await prisma.accountConstraint.create({
        data: {
          id: fx('constraint'),
          accountId: person.id,
          kind: pick(['MEDICAL', 'ILLNESS', 'PRIVATE'] as const),
          body: pick([
            'Pas disponible après 23 h en semaine.',
            'Traitement en cours, fatigue possible certains jours.',
            'Garde partagée, absent un week-end sur deux.',
          ]),
        },
      })
    }

    const authors = responsables.filter((lead) =>
      lead.creators.some((creatorId) => person.creators.includes(creatorId))
    )

    if (person.role === 'MODERATEUR' && authors.length > 0 && chance(0.45)) {
      for (let count = between(1, 4); count > 0; count -= 1) {
        const createdAt = day(-between(1, 170), between(9, 23), between(0, 59))
        await prisma.accountNote.create({
          data: {
            id: fx('note'),
            accountId: person.id,
            authorId: pick(authors).id,
            body: pick(MEMBER_NOTES),
            pinned: chance(0.15),
            createdAt,
          },
        })
      }
    }
  }

  // A handful of personal overrides, some narrowed to one creator
  const overridden = sample(
    everyone.filter((person) => person.role === 'MODERATEUR' && person.status === 'ACTIVE'),
    8
  )
  for (const [position, person] of overridden.entries()) {
    await prisma.accountPermission.create({
      data: {
        id: fx('account-grant'),
        accountId: person.id,
        permission: pick([
          'project:create',
          'task:create',
          'livecon:update',
          'communication:write',
        ]),
        effect: position % 3 === 0 ? 'DENY' : 'ALLOW',
        youtuberId: position % 2 === 0 ? person.creators[0] : null,
      },
    })
  }
}
