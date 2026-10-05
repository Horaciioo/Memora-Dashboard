import { pathToFileURL } from 'node:url'
import { prisma, fxDiscordId } from './lib/client.ts'

// Sits well past every index the seed hands out
const QA_INDEX = 99_999

// Carries the fixture prefixes
export const QA_ACCOUNT_ID = 'fx-qa-0001'
export const QA_DISCORD_ID = fxDiscordId(QA_INDEX)
const QA_NAME = 'QA Claude'

/**
 * Create or refresh the account used to check screens
 * @return {Promise<void>} - Account upserted
 */

export const seedQaAccount = async (): Promise<void> => {
  const [youtubers, functions, division] = await Promise.all([
    prisma.youtuber.findMany({ select: { id: true } }),
    prisma.jobFunction.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
      select: { id: true, kind: true },
    }),
    prisma.division.findFirst({ orderBy: { rank: 'asc' }, select: { id: true } }),
  ])

  const held = [
    functions.find((entry) => entry.kind === 'PRIMARY'),
    functions.find((entry) => entry.kind === 'SECONDARY'),
  ].filter((entry): entry is (typeof functions)[number] => entry !== undefined)

  const data = {
    discordId: QA_DISCORD_ID,
    discordUsername: 'qa-claude',
    displayName: QA_NAME,
    email: 'qa-claude@example.com',
    birthday: new Date(Date.UTC(2000, 5, 15)),
    celebrateBirthday: true,
    historyConsentAt: new Date(),
    historyConsentVersion: 1,
    languages: ['fr'],
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    divisionId: division?.id ?? null,
  }

  await prisma.account.upsert({
    where: { id: QA_ACCOUNT_ID },
    create: {
      id: QA_ACCOUNT_ID,
      ...data,
      youtubers: { connect: youtubers },
      functions: {
        create: held.map((entry, index) => ({
          id: `fx-qa-function-${index + 1}`,
          functionId: entry.id,
        })),
      },
    },
    update: { ...data, youtubers: { set: youtubers } },
  })

  console.log(`Compte QA prêt : ${QA_NAME}, identifiant ${QA_DISCORD_ID}.`)
}

// Runs only when launched directly
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  seedQaAccount()
    .catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
}
