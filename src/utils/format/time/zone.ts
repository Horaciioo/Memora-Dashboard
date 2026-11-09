import { DEFAULT_ZONE } from '@/declarations/ui/dates'

// Wall clock as written in a datetime field
const WALL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

// Text carrying its own offset is already a moment
const INSTANT_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/

// One formatter per zone
const formatters = new Map<string, Intl.DateTimeFormat>()

// Browser zone, one member
let activeZone = DEFAULT_ZONE

// Per-request zone on the server
let zoneReader: (() => string | null) | null = null

/**
 * Check a zone name
 * @param {string | null | undefined} zone - IANA zone
 * @return {boolean} - Zone exists
 */

export const isKnownZone = (zone: string | null | undefined): zone is string => {
  if (!zone) return false

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

/**
 * Pick the zone clock times read in
 * @param {string | null | undefined} zone - Member zone
 * @return {void}
 */

export const setActiveZone = (zone: string | null | undefined): void => {
  activeZone = isKnownZone(zone) ? zone : DEFAULT_ZONE
}

/**
 * Zone clock times read in
 * @return {string} - IANA zone
 */

export const getActiveZone = (): string => zoneReader?.() ?? activeZone

/**
 * Plug the server zone source
 * @param {() => string | null} reader - Request zone
 * @return {void}
 */

export const bindZoneReader = (reader: () => string | null): void => {
  zoneReader = reader
}

/**
 * Formatter splitting a moment into zone fields
 * @param {string} zone - IANA zone
 * @return {Intl.DateTimeFormat} - Cached formatter
 */

const formatterOf = (zone: string): Intl.DateTimeFormat => {
  const cached = formatters.get(zone)
  if (cached) return cached

  const created = new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  formatters.set(zone, created)

  return created
}

/**
 * Wall clock of a moment in a zone, as if it were UTC
 * @param {number} time - Epoch milliseconds
 * @param {string} zone - IANA zone
 * @return {number} - Epoch milliseconds of the same wall clock in UTC
 */

const wallAsUtc = (time: number, zone: string): number => {
  const fields: Record<string, number> = {}
  for (const part of formatterOf(zone).formatToParts(new Date(time))) {
    if (part.type !== 'literal') fields[part.type] = Number(part.value)
  }

  return Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second
  )
}

/**
 * Write a moment as the wall clock of a zone
 * @param {Date | string} value - Moment
 * @param {string} [zone] - IANA zone
 * @return {string} - "YYYY-MM-DDTHH:mm"
 */

export const instantToWall = (value: Date | string, zone: string = getActiveZone()): string => {
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return ''

  return new Date(wallAsUtc(time, zone)).toISOString().slice(0, 16)
}

/**
 * Read the wall clock of a zone as a moment
 * @param {string} wall - "YYYY-MM-DDTHH:mm"
 * @param {string} [zone] - IANA zone
 * @return {Date} - Moment
 */

export const wallToInstant = (wall: string, zone: string = getActiveZone()): Date => {
  const target = Date.parse(`${wall.slice(0, 16)}:00Z`)
  if (Number.isNaN(target)) return new Date(Number.NaN)

  // Two passes settle the offset around a daylight saving change
  let guess = target
  for (let pass = 0; pass < 2; pass += 1) {
    guess = target - (wallAsUtc(guess, zone) - guess)
  }

  return new Date(guess)
}

/**
 * Check a text carries its own offset
 * @param {unknown} value - Field value
 * @return {boolean} - Text is a moment
 */

export const isInstantText = (value: unknown): value is string =>
  typeof value === 'string' && WALL_PATTERN.test(value) && INSTANT_PATTERN.test(value)

/**
 * Check a field text is a bare wall clock
 * @param {unknown} value - Field value
 * @return {boolean} - Wall clock without offset
 */

export const isWallClock = (value: unknown): value is string =>
  typeof value === 'string' && WALL_PATTERN.test(value) && !INSTANT_PATTERN.test(value)

/**
 * Date whose local getters read the wall clock of a zone
 * @param {Date | string} value - Moment
 * @param {string} [zone] - IANA zone
 * @return {Date} - Shifted date, for reading only
 */

export const shiftToZone = (value: Date | string, zone: string = getActiveZone()): Date => {
  const wall = WALL_PATTERN.exec(instantToWall(value, zone))
  if (!wall) return new Date(value)

  const [, year, month, day, hour, minute] = wall.map(Number)

  return new Date(year, month - 1, day, hour, minute)
}
