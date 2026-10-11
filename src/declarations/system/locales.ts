import type { FieldOption } from '@/types/forms'
import { capitalizeFirstLetter } from '@/utils/format/strings'

// Locale every label is drawn in
const DISPLAY_LOCALE = 'fr'

/**
 * Languages a member may declare
 * @type {string[]}
 */

const LANGUAGE_CODES: string[] = [
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

// Country whose flag stands for each language
export const LANGUAGE_COUNTRIES: Record<string, string> = {
  fr: 'FR',
  en: 'GB',
  es: 'ES',
  de: 'DE',
  it: 'IT',
  pt: 'PT',
  nl: 'NL',
  pl: 'PL',
  ro: 'RO',
  ru: 'RU',
  uk: 'UA',
  ar: 'SA',
  tr: 'TR',
  zh: 'CN',
  ja: 'JP',
  ko: 'KR',
  hi: 'IN',
  sv: 'SE',
  no: 'NO',
  da: 'DK',
  fi: 'FI',
  cs: 'CZ',
  el: 'GR',
  he: 'IL',
  th: 'TH',
  vi: 'VN',
  id: 'ID',
  hu: 'HU',
  bg: 'BG',
  sr: 'RS',
  hr: 'HR',
  ca: 'ES',
  eu: 'ES',
  'fr-BE': 'BE',
  lb: 'LU',
}

const languageNames = new Intl.DisplayNames([DISPLAY_LOCALE], { type: 'language' })

/**
 * Languages the team speaks most, listed first and in this order
 * @type {{ code: string, label?: string }[]}
 */

const PRIORITY_LANGUAGES: { code: string; label?: string }[] = [
  { code: 'fr' },
  { code: 'fr-BE', label: 'Belge' },
  { code: 'lb' },
]

/**
 * One language as a picker option
 * @param {string} code - Language code
 * @param {string} [label] - Name when the locale data has none that fits
 * @return {FieldOption} - Option
 */

const toLanguageOption = (code: string, label?: string): FieldOption => ({
  value: code,
  label: label ?? capitalizeFirstLetter(languageNames.of(code) ?? code),
  hint: code.toUpperCase(),
  flag: LANGUAGE_COUNTRIES[code],
})

/**
 * Choices of the spoken languages field: the usual ones, a line, then the rest by name
 * @type {FieldOption[]}
 */

export const LANGUAGE_OPTIONS: FieldOption[] = [
  ...PRIORITY_LANGUAGES.map(({ code, label }, index) => ({
    ...toLanguageOption(code, label),
    hasDividerAfter: index === PRIORITY_LANGUAGES.length - 1,
  })),
  ...LANGUAGE_CODES.map((code) => toLanguageOption(code)).sort((left, right) =>
    left.label.localeCompare(right.label, DISPLAY_LOCALE)
  ),
]

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

// Offsets shift with daylight saving
let cachedDay = ''
let cachedZones: FieldOption[] = []

/**
 * Choices of the timezone field
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
