import 'server-only'

import { conflict } from '@/core/lib/errors'
import { clearFeatureCache } from '@/core/services/features'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { SYSTEM_COPY } from '@/declarations/nexus/modulesCopy'
import { runtime } from '@/managers/infrastructure/Core/runtime'

// Redis keys counted by first segment
const KEY_SAMPLE = 10000

// Caches the owner may empty, by name
const CLEARABLE = ['features'] as const

const status: NexusHandler = async () => {
  const container = runtime()
  const tables = (container?.database.tables ?? []).map((table) => ({
    cache: `table:${table.table}`,
    entries: table.size,
    hits: table.stats.hits,
    misses: table.stats.misses,
  }))

  // Prefix counts come from SCAN, never KEYS
  const keys =
    container?.redis.isReady() === true
      ? await container.redis.findKeys('*', { limit: KEY_SAMPLE }).catch(() => [])
      : []
  const prefixes = Object.entries(
    Object.groupBy(keys, (key) => key.split(':').slice(0, 2).join(':'))
  ).map(([prefix, group]) => ({ cache: `redis:${prefix}`, entries: group?.length ?? 0 }))

  return {
    output: [...tables, ...prefixes, ...CLEARABLE.map((name) => ({ cache: name, entries: null }))],
  }
}

const invalidate: NexusHandler = async (context) => {
  const name = String(context.args.cache)
  const tables = runtime()?.database.tables ?? []
  const table = name.startsWith('table:')
    ? tables.find((candidate) => `table:${candidate.table}` === name)
    : null
  const known = CLEARABLE.some((entry) => entry === name) || Boolean(table)
  if (!known) throw conflict(SYSTEM_COPY.unknownCache)
  if (context.dryRun) return { output: { cache: name, effect: 'vidé' } }

  if (table) table.clear()
  else clearFeatureCache()

  return { output: { cache: name, effect: 'vidé' }, target: `cache:${name}`, level: 'success' }
}

/**
 * Caches of the system module
 * @type {Record<string, NexusHandler>}
 */

export const CACHE_HANDLERS: Record<string, NexusHandler> = {
  'system.cacheStatus': status,
  'system.cacheInvalidate': invalidate,
}
