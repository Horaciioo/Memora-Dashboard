import 'server-only'

import { dayHealth, uptimePercent } from '../../../../status/history.ts'
import type { StatusState } from '../../../../status/history.ts'
import { HEALTH_LEVELS, SETTINGS } from '../../../../status/declarations.ts'
import type { Health } from '../../../../status/declarations.ts'
import { STATUS_LINK } from '@/declarations/system/monitoring/status'
import { DAY_MS } from '@/utils/constants/time'

/**
 * One day of history
 * @typedef {Object} StatusDay
 * @property {string} day - Day key
 * @property {Health | null} health - Day level
 */

export interface StatusDay {
  day: string
  health: Health | null
}

/**
 * One watched service
 * @typedef {Object} StatusService
 * @property {string} id - Component key
 * @property {string} label - Display name
 * @property {string} lead - What it does
 * @property {Health | null} health - Last result
 * @property {number | null} ms - Last answer time
 * @property {number | null} uptime - Percent over the history
 * @property {StatusDay[]} days - Oldest first, one per day
 */

export interface StatusService {
  id: string
  label: string
  lead: string
  health: Health | null
  ms: number | null
  uptime: number | null
  days: StatusDay[]
}

/**
 * Report of the status service
 * @typedef {Object} StatusReport
 * @property {boolean} reachable - The service answered
 * @property {Health | null} overall - Worst level
 * @property {StatusService[]} services - One per component
 * @property {StatusState['incidents']} incidents - Newest first
 * @property {string | null} checkedAt - ISO last round
 */

export interface StatusReport {
  reachable: boolean
  overall: Health | null
  services: StatusService[]
  incidents: StatusState['incidents']
  checkedAt: string | null
}

// Answer of the status endpoint
type StatusPayload = StatusState & { meta: { id: string; label: string; lead: string }[] }

const OFFLINE: StatusReport = {
  reachable: false,
  overall: null,
  services: [],
  incidents: [],
  checkedAt: null,
}

// Day keys, oldest first
const lastDays = (): string[] =>
  Array.from({ length: SETTINGS.historyDays }, (_, index) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: SETTINGS.timeZone }).format(
      new Date(Date.now() - (SETTINGS.historyDays - 1 - index) * DAY_MS)
    )
  )

/**
 * Read the status service
 * @return {Promise<StatusReport>} - Report, offline when unreachable
 */

export const readStatusReport = async (): Promise<StatusReport> => {
  try {
    const response = await fetch(STATUS_LINK.endpoint, {
      cache: 'no-store',
      signal: AbortSignal.timeout(STATUS_LINK.timeoutMs),
    })
    if (!response.ok) return OFFLINE

    const payload = (await response.json()) as StatusPayload
    const days = lastDays()

    const services = payload.meta.map((meta) => {
      const state = payload.components[meta.id]

      return {
        ...meta,
        health: state?.health ?? null,
        ms: state?.ms ?? null,
        uptime: state ? uptimePercent(state) : null,
        days: days.map((day) => ({ day, health: dayHealth(state?.days[day]) })),
      }
    })

    const levels = services.map((service) => service.health)

    return {
      reachable: true,
      overall: levels.some((level) => !level)
        ? null
        : (HEALTH_LEVELS.toReversed().find((level) => levels.includes(level)) ?? 'up'),
      services,
      incidents: payload.incidents,
      checkedAt: payload.checkedAt,
    }
  } catch {
    return OFFLINE
  }
}
