import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { setOverlay } from '@/declarations/configurations/overlay'

/**
 * Load the owner's settings before readers run
 * @return {Promise<number>} - Keys loaded
 */

export const loadConfigOverlay = async (): Promise<number> => {
  if (!process.env.DATABASE_URL) return 0

  // Own short client, the app one reads settings itself
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }),
  })

  try {
    const rows = await client.configOverride.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    })
    setOverlay(rows.map((row) => [`${row.category}.${row.path}`, row.value]))

    return rows.length
  } catch {
    // A missing table must not stop the boot
    return 0
  } finally {
    await client.$disconnect()
  }
}
