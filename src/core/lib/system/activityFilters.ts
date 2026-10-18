import {
  JOURNAL_DEFAULT_PERIOD,
  JOURNAL_LIMITS,
  JOURNAL_PARAMS,
  JOURNAL_PERIODS,
} from '@/declarations/system/monitoring/journal'
import type { JournalPeriod } from '@/declarations/system/monitoring/journal'
import { EVENT_ORIGINS, EVENT_TYPES, LOG_LEVELS } from '@/utils/constants/events'
import type { EventOriginName, EventTypeName, LogLevelName } from '@/utils/constants/events'

/**
 * Filters of the journal
 * @typedef {Object} ActivityFilters
 * @property {LogLevelName | null} level - Severity
 * @property {EventTypeName | null} event - Event kind
 * @property {EventOriginName | null} origin - Origin
 * @property {string | null} actor - Account identifier
 * @property {JournalPeriod} period - Time window
 * @property {string} search - Free text
 * @property {number} page - Page number
 */

export interface ActivityFilters {
  level: LogLevelName | null
  event: EventTypeName | null
  origin: EventOriginName | null
  actor: string | null
  period: JournalPeriod
  search: string
  page: number
}

// Value kept only when it names a member of the set
const pick = <T extends string>(value: string | null, names: readonly T[]): T | null =>
  names.find((name) => name === value) ?? null

/**
 * Read filters off a query string
 * @param {URLSearchParams} params - Query string
 * @return {ActivityFilters} - Safe filters
 */

export const parseActivityFilters = (params: URLSearchParams): ActivityFilters => {
  const page = Number(params.get(JOURNAL_PARAMS.page))

  return {
    level: pick(params.get(JOURNAL_PARAMS.level), LOG_LEVELS.names),
    event: pick(params.get(JOURNAL_PARAMS.event), EVENT_TYPES.names),
    origin: pick(params.get(JOURNAL_PARAMS.origin), EVENT_ORIGINS.names),
    actor: params.get(JOURNAL_PARAMS.actor) || null,
    period:
      pick(params.get(JOURNAL_PARAMS.period), Object.keys(JOURNAL_PERIODS) as JournalPeriod[]) ??
      JOURNAL_DEFAULT_PERIOD,
    search: (params.get(JOURNAL_PARAMS.search) ?? '').trim().slice(0, JOURNAL_LIMITS.searchLength),
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}
