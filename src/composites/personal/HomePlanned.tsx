import Link from 'next/link'

import { Glyph } from '@/components/elements/display/Glyph'
import { Section } from '@/components/structures/Section'
import { HOME_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_PLAN } from '@/declarations/ui/variants'
import type { HomePlanned as PlannedEntry } from '@/types/personal'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/dates'

// Day alone until the pointer asks for the hour
const dayLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

export interface HomePlannedProps {
  entries: PlannedEntry[]
}

/**
 * What the calendar plans next, one line after the other, the rest left to the calendar
 * @param {PlannedEntry[]} entries - Coming entries, one more than shown at most
 * @return {JSX.Element}
 */

export const HomePlanned = ({ entries }: HomePlannedProps) => {
  const shown = entries.slice(0, HOME_SETTINGS.plannedMax)
  const next = entries[HOME_SETTINGS.plannedMax]
  const ChevronIcon = ICONS.next
  const SpotIcon = ICONS.meetings
  const CheckIcon = ICONS.picked

  return (
    <Section title={PERSONAL_COPY.plannedTitle} bare>
      {shown.length === 0 ? (
        <p className={HOME_PLAN.empty}>{PERSONAL_COPY.plannedEmpty}</p>
      ) : (
        <div className={HOME_PLAN.list}>
          {shown.map((entry) => (
            <Link key={entry.id} href={ROUTES.calendarEvent(entry.id)} className={HOME_PLAN.row}>
              <span className={HOME_PLAN.when}>{dayLabel(entry.startsAt)}</span>
              {entry.isDone ? (
                <CheckIcon className={HOME_PLAN.glyph} aria-hidden="true" />
              ) : entry.emoji ? (
                <Glyph value={entry.emoji} size="row" />
              ) : (
                <SpotIcon className={HOME_PLAN.glyph} aria-hidden="true" />
              )}
              <span className={cn(HOME_PLAN.title, entry.isDone && HOME_PLAN.titleDone)}>
                {entry.title}
              </span>
              {!entry.allDay && (
                <span className={HOME_PLAN.whenExact}>{formatClock(entry.startsAt)}</span>
              )}
              <ChevronIcon className={HOME_PLAN.chevron} aria-hidden="true" />
            </Link>
          ))}
          {next && (
            <Link href={ROUTES.calendarDay(next.startsAt.slice(0, 10))} className={HOME_PLAN.more}>
              {PERSONAL_COPY.plannedMore}
              <ChevronIcon className={HOME_PLAN.glyph} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </Section>
  )
}
