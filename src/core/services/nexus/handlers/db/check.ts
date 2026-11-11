import 'server-only'

import { conflict } from '@/core/lib/errors'
import { DB_CHECKS } from '@/core/services/nexus/handlers/db/checks'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { NEXUS_DB } from '@/declarations/nexus/modulesSettings'

const check: NexusHandler = async (context) => {
  const only = context.args.rule ? String(context.args.rule) : null
  const rules = DB_CHECKS.filter((rule) => !only || rule.id === only)
  if (rules.length === 0) throw conflict('Règle inconnue')

  // Each rule runs alone, a failure stays local
  const found = await Promise.all(
    rules.map(async (rule) => {
      const ids = await rule.run(NEXUS_DB.checkRows).catch(() => null)

      return {
        rule: rule.id,
        label: rule.label,
        found: ids === null ? 'échec de la règle' : ids.length,
        examples: ids?.slice(0, 5).join(', ') ?? '',
        fix: rule.fix,
      }
    })
  )

  return { output: found, level: found.some((row) => row.found !== 0) ? 'warning' : 'success' }
}

/**
 * Inconsistency scan of the database module
 * @type {Record<string, NexusHandler>}
 */

export const DB_CHECK_HANDLERS: Record<string, NexusHandler> = { 'db.check': check }
