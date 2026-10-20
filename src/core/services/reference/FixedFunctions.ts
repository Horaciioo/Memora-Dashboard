import 'server-only'

import { prisma } from '@/core/lib/db'
import { FIXED_FUNCTIONS } from '@/declarations/reference/fixed'

// Written once per server process
let written: Promise<void> | null = null

/**
 * Write the functions fixed in code onto their rows, grants and teams then find them
 * @return {Promise<void>} - Written
 */

export const ensureFixedFunctions = (): Promise<void> => {
  written ??= (async () => {
    for (const { name, ...rest } of FIXED_FUNCTIONS) {
      await prisma.jobFunction.upsert({
        where: { name },
        update: { ...rest, archived: false },
        create: { name, ...rest },
      })
    }
  })().catch((error: unknown) => {
    written = null
    throw error
  })

  return written
}
