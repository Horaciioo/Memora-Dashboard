import 'server-only'

import { prisma } from '@/core/lib/db'
import { conflict, invalidInput } from '@/core/lib/errors'
import { DISCORD_ID_COPY, SNOWFLAKE_LENGTH } from '@/declarations/discord/copy'
import type { DiscordIdentifierView } from '@/types/discord'
import { DiscordIdKinds } from '@/utils/constants/discord'
import type { DiscordIdKindName } from '@/utils/constants/discord'
import type { DiscordIdentifier } from '@prisma/client'
import { MINUTE_MS } from '@/utils/constants/time'

// Collection runs at most this often
const COLLECT_INTERVAL_MS = MINUTE_MS

let lastCollected = 0

/**
 * Map a row to its view
 * @param {DiscordIdentifier} row - Stored row
 * @return {DiscordIdentifierView} - Client view
 */

export const toIdentifierView = (row: DiscordIdentifier): DiscordIdentifierView => ({
  id: row.id,
  discordId: row.discordId,
  kind: row.kind,
  name: row.name,
  youtuberId: row.youtuberId,
})

/**
 * Turn a duplicate identifier into a conflict
 * @param {unknown} error - Caught value
 * @return {never} - Always throws
 */

export const rethrowDuplicate = (error: unknown): never => {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    if ((error as { code: unknown }).code === 'P2002') throw conflict()
  }

  throw error
}

/**
 * Check a Discord snowflake
 * @param {string} value - Submitted identifier
 * @return {string} - Trimmed identifier
 */

export const readSnowflake = (value: string): string => {
  const id = value.trim()
  const pattern = new RegExp(`^\\d{${SNOWFLAKE_LENGTH.min},${SNOWFLAKE_LENGTH.max}}$`)
  if (!pattern.test(id))
    throw invalidInput([{ field: 'discordId', message: DISCORD_ID_COPY.invalid }])

  return id
}

/**
 * Store every member and candidate identifier already collected
 * @return {Promise<void>} - Stored
 */

export const collectKnownIdentifiers = async (): Promise<void> => {
  if (Date.now() - lastCollected < COLLECT_INTERVAL_MS) return
  lastCollected = Date.now()

  const [accounts, candidates] = await Promise.all([
    prisma.account.findMany({ select: { discordId: true, displayName: true } }),
    prisma.recruitmentCandidate.findMany({ select: { discordId: true, displayName: true } }),
  ])

  // Accounts first so their names win
  await prisma.discordIdentifier.createMany({
    data: [...accounts, ...candidates].map((entry) => ({
      discordId: entry.discordId,
      kind: DiscordIdKinds.Member,
      name: entry.displayName ?? entry.discordId,
    })),
    skipDuplicates: true,
  })
}

/**
 * Identifiers a creator announcement can name
 * @param {string} youtuberId - Creator identifier
 * @return {Promise<DiscordIdentifierView[]>} - Shared ones and the creator's own
 */

export const identifiersForCreator = async (
  youtuberId: string
): Promise<DiscordIdentifierView[]> => {
  await collectKnownIdentifiers()

  const rows = await prisma.discordIdentifier.findMany({
    where: { OR: [{ youtuberId: null }, { youtuberId }] },
    orderBy: { name: 'asc' },
  })

  return rows.map(toIdentifierView)
}

/**
 * Store a new identifier
 * @param {Object} input - Identifier to store
 * @param {string} input.discordId - Discord snowflake
 * @param {DiscordIdKindName} input.kind - What it points at
 * @param {string} input.name - Name shown instead of the number
 * @param {string | null} input.youtuberId - Creator it belongs to
 * @return {Promise<DiscordIdentifierView>} - Stored identifier
 */

export const createIdentifier = async (input: {
  discordId: string
  kind: DiscordIdKindName
  name: string
  youtuberId: string | null
}): Promise<DiscordIdentifierView> => {
  const row = await prisma.discordIdentifier
    .create({ data: { ...input, discordId: readSnowflake(input.discordId) } })
    .catch(rethrowDuplicate)

  return toIdentifierView(row)
}
