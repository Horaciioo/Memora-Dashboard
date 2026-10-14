'use client'

import { useState } from 'react'

import { Status } from '@/components/elements/display/Status'
import { Timeline } from '@/components/structures/Timeline'
import type { TimelineItem, TimelineState } from '@/components/structures/Timeline'
import { PERIOD_TIMELINE_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { TONES } from '@/declarations/ui/theme'
import type { Tone } from '@/declarations/ui/theme'
import { PERIOD_TIMELINE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One period of a timeline with the moments it holds
 * @typedef {Object} PeriodTimelineGroup
 * @property {string} id - Period identifier
 * @property {string} title - Period name
 * @property {string} lead - What the period is for
 * @property {string | null} [dates] - Days it runs between
 * @property {IconName} icon - Glyph
 * @property {Tone} tone - Colour family
 * @property {TimelineState} state - Where the period stands
 * @property {number} done - Moments done
 * @property {TimelineItem[]} items - Its moments
 */

export interface PeriodTimelineGroup {
  id: string
  title: string
  lead: string
  dates?: string | null
  icon: IconName
  tone: Tone
  state: TimelineState
  done: number
  items: TimelineItem[]
}

export interface PeriodTimelineProps {
  groups: PeriodTimelineGroup[]
  label: string
}

// Wording and tone of each state
const STATE_STATUS: Record<TimelineState, { label: string; tone: Tone }> = {
  done: { label: PERIOD_TIMELINE_COPY.done, tone: 'success' },
  current: { label: PERIOD_TIMELINE_COPY.current, tone: 'info' },
  late: { label: PERIOD_TIMELINE_COPY.late, tone: 'danger' },
  upcoming: { label: PERIOD_TIMELINE_COPY.upcoming, tone: 'neutral' },
}

/**
 * Timeline cut into periods, the one in course open and lit, the ones behind folded
 * @param {PeriodTimelineGroup[]} groups - Periods in running order
 * @param {string} label - Accessible name
 * @return {JSX.Element}
 */

export const PeriodTimeline = ({ groups, label }: PeriodTimelineProps) => {
  // Periods behind start folded, the others open
  const [folded, setFolded] = useState<Set<string>>(
    () => new Set(groups.filter((group) => group.state === 'done').map((group) => group.id))
  )

  const toggle = (id: string) =>
    setFolded((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)

      return next
    })

  return (
    <div className={PERIOD_TIMELINE.root} role="group" aria-label={label}>
      {groups.map((group) => {
        const Glyph = ICONS[group.icon]
        const Chevron = ICONS.expand
        const tone = TONES[group.tone]
        const isOpen = !folded.has(group.id)
        const status = STATE_STATUS[group.state]

        return (
          <section
            key={group.id}
            className={cn(
              PERIOD_TIMELINE.card,
              group.state === 'current' && cn(PERIOD_TIMELINE.cardCurrent, tone.border),
              group.state === 'done' && PERIOD_TIMELINE.cardDone,
              group.state === 'upcoming' && PERIOD_TIMELINE.cardUpcoming
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(group.id)}
              className={cn(PERIOD_TIMELINE.head, PERIOD_TIMELINE.headButton)}
            >
              <Glyph className={cn(PERIOD_TIMELINE.badgeGlyph, tone.text)} aria-hidden="true" />
              <span className={PERIOD_TIMELINE.title}>
                <span className={PERIOD_TIMELINE.name}>{group.title}</span>
                {group.dates && <span className={PERIOD_TIMELINE.dates}>{group.dates}</span>}
                <span className={PERIOD_TIMELINE.lead}>{group.lead}</span>
              </span>
              <span className={PERIOD_TIMELINE.side}>
                <Status label={status.label} tone={status.tone} />
                <span className={PERIOD_TIMELINE.count}>
                  {PERIOD_TIMELINE_COPY.steps(group.done, group.items.length)}
                </span>
              </span>
              <Chevron
                className={cn(PERIOD_TIMELINE.chevron, isOpen && PERIOD_TIMELINE.chevronOpen)}
                aria-hidden="true"
              />
            </button>
            {isOpen && (
              <div className={PERIOD_TIMELINE.body}>
                <Timeline items={group.items} label={group.title} />
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
