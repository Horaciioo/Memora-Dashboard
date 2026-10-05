import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

// Prisma 7 no longer loads .env on its own
try {
  process.loadEnvFile()
} catch {
  // No .env file
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

// Every fixture row carries this prefix
export const FIXTURE_PREFIX = 'fx-'

// Discord identifiers of fixture accounts and candidates start here
export const FIXTURE_DISCORD_PREFIX = '9900'

const counters = new Map<string, number>()

/**
 * Next stable identifier of one kind of row
 * @param {string} kind - Short name of the table
 * @return {string} - Identifier
 */

export const fx = (kind: string): string => {
  const next = (counters.get(kind) ?? 0) + 1
  counters.set(kind, next)

  return `${FIXTURE_PREFIX}${kind}-${String(next).padStart(4, '0')}`
}

/**
 * Discord-shaped identifier of a fixture person
 * @param {number} index - Rank of the person
 * @return {string} - 18 digit identifier
 */

export const fxDiscordId = (index: number): string =>
  `${FIXTURE_DISCORD_PREFIX}${String(index).padStart(14, '0')}`
