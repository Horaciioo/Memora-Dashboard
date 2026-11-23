import { INTELLIGENCE_COPY } from '@/declarations/intelligence/copy'
import { DAY_MS } from '@/utils/constants/time'
import { fillTemplate } from '@/utils/format/strings'

/**
 * Greeting of the day, the same all day long
 * @param {string} name - First name
 * @param {number} [now] - Present moment
 * @return {string} - Title of the page
 */

export const greetingOf = (name: string, now: number = Date.now()): string =>
  fillTemplate(
    INTELLIGENCE_COPY.titles[Math.floor(now / DAY_MS) % INTELLIGENCE_COPY.titles.length],
    {
      name,
    }
  )
