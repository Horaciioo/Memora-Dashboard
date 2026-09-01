import type { FieldOption } from '@/types/forms'
import { capitalizeFirstLetter } from '@/utils/format/strings'

// Locale every label is drawn in
const DISPLAY_LOCALE = 'fr'

/**
 * Languages a member may declare, stored as ISO 639-1
 * @type {string[]}
 */

const LANGUAGE_CODES: string[] = [
  'fr',
  'en',
  'es',
  'de',
  'it',
  'pt',
  'nl',
  'pl',
  'ro',
  'ru',
  'uk',
  'ar',
  'tr',
  'zh',
  'ja',
  'ko',
  'hi',
  'sv',
  'no',
  'da',
  'fi',
  'cs',
  'el',
  'he',
  'th',
  'vi',
  'id',
  'hu',
  'bg',
  'sr',
  'hr',
  'ca',
  'eu',
]

const languageNames = new Intl.DisplayNames([DISPLAY_LOCALE], { type: 'language' })

/**
 * Choices of the spoken languages field
 * @type {FieldOption[]}
 */

export const LANGUAGE_OPTIONS: FieldOption[] = LANGUAGE_CODES.map((code) => ({
  value: code,
  label: capitalizeFirstLetter(languageNames.of(code) ?? code),
  hint: code.toUpperCase(),
})).sort((left, right) => left.label.localeCompare(right.label, DISPLAY_LOCALE))

/**
 * Read the offset a zone stands at right now
 * @param {string} zone - IANA zone
 * @return {string} - Offset label
 */

const zoneOffset = (zone: string): string => {
  const parts = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: zone,
    timeZoneName: 'longOffset',
  }).formatToParts(new Date())

  return parts.find((part) => part.type === 'timeZoneName')?.value ?? ''
}

// Offsets shift with daylight saving, so the built list is kept for one day only
let cachedDay = ''
let cachedZones: FieldOption[] = []

/**
 * Choices of the timezone field, the whole IANA catalogue
 * @return {FieldOption[]} - Zone options
 */

export const timezoneOptions = (): FieldOption[] => {
  const today = new Date().toISOString().slice(0, 10)
  if (today === cachedDay) return cachedZones

  cachedDay = today
  cachedZones = Intl.supportedValuesOf('timeZone').map((zone) => ({
    value: zone,
    label: zone.replace(/_/g, ' '),
    hint: zoneOffset(zone),
  }))

  return cachedZones
}
