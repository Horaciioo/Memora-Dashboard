import 'server-only'

import { conflict } from '@/core/lib/errors'
import type { NexusHandler } from '@/core/services/nexus/handlers/types'
import { readMaintenance, setMaintenance } from '@/core/services/system/MaintenanceModeService'
import { SYSTEM_COPY } from '@/declarations/nexus/modulesCopy'

const status: NexusHandler = async () => {
  const state = await readMaintenance()

  return { output: { ...state }, level: state.enabled ? 'warning' : 'info' }
}

const enable: NexusHandler = async (context) => {
  const message = context.args.message ? String(context.args.message) : null
  const until = context.args.until instanceof Date ? context.args.until : null
  if (until && until.getTime() < Date.now()) throw conflict('Date de retour dans le passé')

  const before = await readMaintenance()
  const after = { enabled: true, message, until }
  if (context.dryRun) return { output: { before, after } }

  await setMaintenance(after, context.accountId)

  return {
    output: { before, after },
    before,
    after,
    target: 'systemFlag:maintenance',
    data: { note: SYSTEM_COPY.maintenanceOn },
    level: 'warning',
  }
}

const disable: NexusHandler = async (context) => {
  const before = await readMaintenance()
  const after = { enabled: false, message: null, until: null }
  if (context.dryRun) return { output: { before, after } }

  await setMaintenance(after, context.accountId)

  return {
    output: { before, after },
    before,
    after,
    target: 'systemFlag:maintenance',
    data: { note: SYSTEM_COPY.maintenanceOff },
  }
}

/**
 * Maintenance of the system module
 * @type {Record<string, NexusHandler>}
 */

export const MAINTENANCE_HANDLERS: Record<string, NexusHandler> = {
  'system.maintenanceStatus': status,
  'system.maintenanceEnable': enable,
  'system.maintenanceDisable': disable,
}
