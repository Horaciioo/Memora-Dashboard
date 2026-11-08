import 'server-only'

import { Prisma } from '@prisma/client'

// Account reads that list members
const LISTING_OPERATIONS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'groupBy',
  'aggregate',
])

/**
 * Where clause without bots, unless asked
 * @param {Record<string, unknown> | undefined} where - Caller filter
 * @return {Record<string, unknown>} - Member filter
 */

export const withoutBots = (where: Record<string, unknown> | undefined): Record<string, unknown> =>
  where && 'botKind' in where ? where : { AND: [where ?? {}, { botKind: null }] }

/**
 * Client extension hiding Play bots from member lists
 * @type {ReturnType<typeof Prisma.defineExtension>}
 */

export const botFilterExtension = Prisma.defineExtension({
  name: 'play-bot-filter',
  query: {
    account: {
      $allOperations: ({ operation, args, query }) => {
        if (!LISTING_OPERATIONS.has(operation)) return query(args)
        const filtered = args as { where?: Record<string, unknown> }

        return query({ ...filtered, where: withoutBots(filtered.where) } as typeof args)
      },
    },
  },
})
