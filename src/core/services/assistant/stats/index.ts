import 'server-only'

import { tokenize } from '@/core/lib/assistant/normalize'
import { readStatsWindow } from '@/core/lib/assistant/statsPeriod'
import { rankNamed } from '@/core/lib/assistant/topics'
import { READERS } from '@/core/services/assistant/stats/measures'
import { askChoice, fill, refuse, speak } from '@/core/services/assistant/reply'
import type { Resolver } from '@/core/services/assistant/reply'
import { STAT_MEASURES, STATS_COPY } from '@/declarations/assistant/stats'
import type { StatMeasureDef, StatMeasureId } from '@/declarations/assistant/stats'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { instantToWall } from '@/utils/format/time/zone'

// A gap under this share is not worth a word
const GAP_NOTICEABLE = 0.1

/**
 * Time as a member reads it
 * @param {number} seconds - Duration
 * @return {string} - « 3 h 20 »
 */

const durationOf = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)

  return hours > 0
    ? `${hours} ${STATS_COPY.hours}${minutes > 0 ? ` ${minutes}` : ''}`
    : `${minutes} ${STATS_COPY.minutes}`
}

/**
 * Sentence for a figure
 * @param {StatMeasureDef} measure - Figure told
 * @param {number} value - Raw value
 * @param {string} period - Window as said
 * @return {string} - Sentence
 */

const sentenceOf = (measure: StatMeasureDef, value: number, period: string): string => {
  const says = value === 0 ? measure.says.zero : value === 1 ? measure.says.one : measure.says.many
  const shown = measure.unit === 'duration' ? durationOf(value) : String(value)

  return fill(says, { value: shown, period })
}

/**
 * Word on the gap with the window before, none while it stays small
 * @param {number} value - This window
 * @param {number} before - Window before
 * @return {string | null} - Sentence or nothing
 */

const gapOf = (value: number, before: number): string | null => {
  if (before === 0 || value === before) return null

  const ratio = value / before
  if (Math.abs(ratio - 1) < GAP_NOTICEABLE) return null

  const gap = ratio >= 2 || ratio <= 0.5 ? STATS_COPY.twice : STATS_COPY.little

  return fill(ratio > 1 ? STATS_COPY.more : STATS_COPY.less, { gap })
}

/**
 * Tell one figure of the member, never beyond the right of the page that shows it
 * @type {Resolver}
 */

export const resolveStats: Resolver = async (context) => {
  const { access, session, request, parsed } = context
  const entries = (Object.entries(STAT_MEASURES) as [StatMeasureId, StatMeasureDef][]).map(
    ([id, measure]) => ({ id, measure, phrases: measure.phrases })
  )
  const allowed = entries.filter(
    ({ measure }) => !measure.permission || access.can(measure.permission)
  )

  // The measure named, or the one the member picked after a question
  const ranked = rankNamed(tokenize(request.text), entries)
  const top = ranked.filter(({ score }) => score === ranked[0]?.score)
  const picked = entries.find(({ id }) => id === request.filled.topic)
  const chosen = picked ?? (top.length === 1 ? top[0].entry : null)

  if (!chosen) {
    const choices = (top.length > 1 ? top.map(({ entry }) => entry) : allowed).slice(
      0,
      ASSISTANT_SETTINGS.maxChoices
    )

    return askChoice({
      intent: parsed.intent!,
      slotKey: 'topic',
      reply: STATS_COPY.which,
      choices: choices.map(({ id, measure }) => ({ value: id, label: measure.label })),
    })
  }

  if (!allowed.some(({ id }) => id === chosen.id)) {
    return refuse(parsed.intent!, ASSISTANT_COPY.denied)
  }

  const today = instantToWall(new Date()).slice(0, 10)
  const window = readStatsWindow(tokenize(request.text), today)
  const read = READERS[chosen.id]
  const value = await read({ accountId: session.id, window, today })
  const before = chosen.measure.hasPeriod
    ? await read({ accountId: session.id, window: window.before, today })
    : null
  const gap = before === null ? null : gapOf(value, before)

  return speak({
    intent: parsed.intent,
    lines: [
      {
        text: sentenceOf(chosen.measure, value, chosen.measure.hasPeriod ? window.label : ''),
        link: { href: chosen.measure.href, label: chosen.measure.label },
      },
      ...(gap ? [{ text: gap }] : []),
    ],
  })
}
