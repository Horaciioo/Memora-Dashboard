import { prisma, fx, fxDiscordId, FIXTURE_PREFIX } from './lib/client.ts'
import { day, plusMinutes } from './lib/dates.ts'
import { FIXED_RECRUITMENT_OUTCOMES, OutcomeNames } from '../declarations/reference/fixed.ts'

// Usage: recruitment-demo.ts <sessionId> [viewerAccountId]
const sessionId = process.argv[2]
if (!sessionId) throw new Error('Identifiant de session manquant')

const session = await prisma.recruitmentSession.findUnique({ where: { id: sessionId } })
if (!session) throw new Error(`Session introuvable : ${sessionId}`)

// The viewer, an administrator by default
const viewer = process.argv[3]
  ? await prisma.account.findUnique({ where: { id: process.argv[3] } })
  : await prisma.account.findFirst({
      where: { role: 'ADMIN', status: 'ACTIVE', id: { not: { startsWith: FIXTURE_PREFIX } } },
      orderBy: { createdAt: 'asc' },
    })
if (!viewer) throw new Error('Compte introuvable')

// Fixed outcomes, written as the seed does when the table is empty
for (const [index, outcome] of FIXED_RECRUITMENT_OUTCOMES.entries()) {
  await prisma.recruitmentOutcome.upsert({
    where: { name: outcome.name },
    update: {},
    create: { ...outcome, position: index },
  })
}
const outcomes = new Map((await prisma.recruitmentOutcome.findMany()).map((o) => [o.name, o.id]))

// Moderators who sit beside the viewer, the first one most often
const partners = await prisma.account.findMany({
  where: {
    id: { not: viewer.id },
    status: 'ACTIVE',
    role: { in: ['MODERATEUR', 'RESPONSABLE'] },
    displayName: { in: ['Procy', 'Florian', 'Shiny', 'Luzrod'] },
  },
})
const byName = (name: string) => partners.find((entry) => entry.displayName === name)
const pool = ['Procy', 'Procy', 'Procy', 'Florian', 'Shiny', 'Luzrod']
  .map(byName)
  .filter((entry): entry is (typeof partners)[number] => entry !== undefined)
if (pool.length === 0) throw new Error('Aucun partenaire trouvé')

// Own rows only, fixtures of an earlier run
const old = await prisma.recruitmentCandidate.findMany({
  where: { sessionId, id: { startsWith: `${FIXTURE_PREFIX}rdemo-` } },
  select: { id: true },
})
await prisma.recruitmentCandidate.deleteMany({ where: { id: { in: old.map((o) => o.id) } } })

// The viewer holds a seat of each kind on the session
for (const model of ['recruitmentRecruiter', 'recruitmentObserver'] as const) {
  await (prisma[model] as typeof prisma.recruitmentRecruiter).upsert({
    where: { sessionId_accountId: { sessionId, accountId: viewer.id } },
    update: {},
    create: { id: fx(model), sessionId, accountId: viewer.id },
  })
}

const NAMES = [
  'Lina',
  'Hugo',
  'Maëlle',
  'Théo',
  'Camille',
  'Nolan',
  'Jade',
  'Enzo',
  'Inès',
  'Lucas',
  'Manon',
  'Ethan',
  'Chloé',
  'Mathis',
  'Zoé',
  'Axel',
  'Louise',
  'Tom',
  'Emma',
  'Noah',
  'Sarah',
  'Yanis',
  'Anaïs',
  'Rayan',
  'Léna',
  'Gabin',
  'Océane',
  'Kylian',
  'Eva',
  'Mehdi',
]
const REVIEWS = [
  'Motivé, parle clairement, a déjà modéré un serveur de taille moyenne.',
  'Bonne réactivité sur les cas pratiques, un peu timide à l’oral.',
  'Profil sérieux, disponibilités larges, connaît bien la communauté.',
  'Réponses courtes mais justes, à revoir sur la gestion du stress.',
  'Très à l’aise, a posé les bonnes questions sur le fonctionnement de l’équipe.',
]

// Verdicts given in turn, final decisions mixed in
const VERDICTS = [
  OutcomeNames.Favorable,
  OutcomeNames.Accepted,
  OutcomeNames.Mixed,
  OutcomeNames.Refused,
  OutcomeNames.Favorable,
  OutcomeNames.Unfavorable,
  OutcomeNames.Accepted,
  OutcomeNames.Favorable,
  OutcomeNames.Refused,
  OutcomeNames.Mixed,
]

// Interviews per day, six days back to the day after tomorrow
const PLAN: { offset: number; slots: number }[] = [
  { offset: -6, slots: 2 },
  { offset: -5, slots: 4 },
  { offset: -4, slots: 3 },
  { offset: -3, slots: 5 },
  { offset: -2, slots: 1 },
  { offset: -1, slots: 6 },
  { offset: 0, slots: 4 },
  { offset: 1, slots: 3 },
  { offset: 2, slots: 2 },
]

let index = 0
let created = 0

for (const { offset, slots } of PLAN) {
  for (let slot = 0; slot < slots; slot += 1) {
    const at = day(offset, 14 + slot, slot % 2 === 0 ? 0 : 30)
    const isPast = offset < 0 || (offset === 0 && slot < 2)
    const partner = pool[index % pool.length]!
    // Two interviews out of three are led by the viewer, the rest observed
    const isLed = index % 3 !== 2
    const minutes = 20 + ((index * 7) % 25)
    const started = plusMinutes(at, 2)
    const outcome = isPast ? VERDICTS[index % VERDICTS.length]! : OutcomeNames.Scheduled

    const candidate = await prisma.recruitmentCandidate.create({
      data: {
        id: fx('rdemo'),
        sessionId,
        discordId: fxDiscordId(5000 + index),
        displayName: NAMES[index % NAMES.length],
        outcomeId: outcomes.get(outcome),
        interviewAt: at,
        attended: isPast,
        position: index,
        interviewStartedAt: isPast ? started : null,
        interviewEndedAt: isPast ? plusMinutes(started, minutes) : null,
        verdictAt: isPast ? plusMinutes(started, minutes + 1) : null,
        review: isPast ? REVIEWS[index % REVIEWS.length]! : '',
        recruiters: {
          create: isLed
            ? [{ accountId: viewer.id }, ...(index % 4 === 0 ? [] : [{ accountId: partner.id }])]
            : [{ accountId: partner.id }],
        },
        observers: { create: isLed ? [] : [{ accountId: viewer.id }] },
      },
    })
    void candidate
    index += 1
    created += 1
  }
}

console.log(`${created} candidats créés sur « ${session.name} » pour ${viewer.displayName}`)
await prisma.$disconnect()
