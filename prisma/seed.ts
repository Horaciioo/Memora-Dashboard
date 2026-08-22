import { PrismaPg } from '@prisma/adapter-pg'
import { MemberRole, MemberStatus, PrismaClient } from '@prisma/client'

// Prisma 7 no longer loads .env on its own
try {
  process.loadEnvFile()
} catch {
  // No .env file, variables come from the environment
}

const discordId = process.env.ADMIN_DISCORD_ID?.trim() ?? ''
const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() ?? ''

const MISSING_IDENTIFIER = 'ADMIN_DISCORD_ID is required to seed the root account'
const MISSING_NAME = 'ADMIN_DISPLAY_NAME is required to seed the root account'

/**
 * Write the root administrator into the database, its name never living in the repository
 * @return {Promise<void>} - Seeded
 */

const seed = async (): Promise<void> => {
  if (discordId.length === 0) throw new Error(MISSING_IDENTIFIER)
  if (displayName.length === 0) throw new Error(MISSING_NAME)

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  // The name is refreshed on every seed, the identifier stays the key
  await prisma.account.upsert({
    where: { discordId },
    update: {
      displayName,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      leftAt: null,
    },
    create: {
      discordId,
      displayName,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
    },
  })

  await prisma.$disconnect()
}

void seed()
