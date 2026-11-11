import 'server-only'

import { conflict } from '@/core/lib/errors'
import { listFeatureRows, setFeatures } from '@/core/services/features'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { FEATURE_MAP, subtreeOf } from '@/declarations/features'
import type { FeatureModeName } from '@/declarations/features'
import { SYSTEM_COPY } from '@/declarations/nexus/modulesCopy'

const update: NexusHandler = async (context) => {
  const key = context.params.name
  if (!FEATURE_MAP.has(key)) throw conflict(SYSTEM_COPY.unknownFeature)

  const mode = String(context.args.mode).toUpperCase() as FeatureModeName
  const note = context.args.note ? String(context.args.note) : null

  // Verdict of the whole subtree before and after
  const subtree = subtreeOf(key)
  const rows = await listFeatureRows()
  const before = Object.fromEntries(
    rows.filter((row) => subtree.includes(row.key)).map((row) => [row.key, row.mode])
  )
  const after = Object.fromEntries(subtree.map((child) => [child, mode]))
  if (context.dryRun) return { output: { before, after }, target: `feature:${key}` }

  await setFeatures({ keys: [key], mode, note, withChildren: true }, context.accountId)

  return { output: { before, after }, before, after, target: `feature:${key}`, level: 'warning' }
}

/**
 * Feature switches
 * @type {Record<string, NexusHandler>}
 */

export const FEATURE_HANDLERS: Record<string, NexusHandler> = { 'memora.featureUpdate': update }
