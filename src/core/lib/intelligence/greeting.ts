import { INTELLIGENCE_COPY } from '@/declarations/intelligence/copy'
import { DAY_MS } from '@/utils/constants/time'
import { fillTemplate } from '@/utils/format/strings'

const NIGHT_END = 5
const EARLY_END = 8

/**
 * Pool of greetings fitting the hour in Paris
 * @param {number} now - Present moment
 * @return {readonly string[]} - Titles to pick from
 */

const poolOf = (now: number): readonly string[] => {
  const hour =
    Number(
      new Intl.DateTimeFormat('fr-FR', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Europe/Paris',
      }).format(now)
    ) % 24

  if (hour < NIGHT_END) return INTELLIGENCE_COPY.titlesNight
  if (hour < EARLY_END) return INTELLIGENCE_COPY.titlesEarly
  return INTELLIGENCE_COPY.titles
}

/**
 * Greeting of the day, the same all day long
 * @param {string} name - First name
 * @param {number} [now] - Present moment
 * @return {string} - Title of the page
 */

export const greetingOf = (name: string, now: number = Date.now()): string => {
  const pool = poolOf(now)

  return fillTemplate(pool[Math.floor(now / DAY_MS) % pool.length], { name })
}
