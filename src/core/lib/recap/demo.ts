import { composeThreads } from '@/core/lib/recap/compose'
import { RECAP_SETTINGS } from '@/declarations/configurations/settings'
import { DEMO_MOVES, DEMO_PEOPLE } from '@/declarations/recap/demo'
import type { Recap, RecapDraft } from '@/types/recap'
import { DAY_MS, HOUR_MS } from '@/utils/constants/time'

/**
 * A recap made up of invented members and movements, built through the real composition
 * @param {Date} now - Present moment
 * @return {Recap} - Recap flagged as made up
 */

export const buildDemoRecap = (now: Date): Recap => {
  const byName = new Map(DEMO_PEOPLE.map((person) => [person.name, person]))
  const drafts = DEMO_MOVES.map((move): RecapDraft => ({
    beat: move.beat,
    alert: move.alert,
    at: new Date(+now - move.hoursAgo * HOUR_MS),
    actorIds: move.actors.flatMap((name) => byName.get(name)?.id ?? []),
    count: move.count,
    target: move.target,
    targetId: move.target ? `demo-${move.target}-${move.subject ?? ''}` : null,
    subject: move.subject,
    figures: move.figures,
  }))
  const since = new Date(+now - 3 * DAY_MS)

  return {
    since: since.toISOString(),
    until: now.toISOString(),
    isAway: true,
    isDemo: true,
    demoAvailable: true,
    threads: composeThreads(drafts, new Map(DEMO_PEOPLE.map((p) => [p.id, p])), {
      threads: RECAP_SETTINGS.maxThreads,
      beats: RECAP_SETTINGS.maxBeats,
      people: RECAP_SETTINGS.maxPeople,
    }),
  }
}
