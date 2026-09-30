import Link from 'next/link'

import { Glyph } from '@/components/elements/display/Glyph'
import { Section } from '@/components/structures/Section'
import { DayStamp } from '@/composites/personal/DayStamp'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY } from '@/declarations/personal/copy'
import { ATTENDEE_KIND_REGISTRY } from '@/declarations/reference/registries'
import { ICONS } from '@/declarations/ui/icons'
import { HOME_STYLES } from '@/declarations/ui/variants'
import { MEETING_AUDIENCE_REGISTRY } from '@/declarations/work/registries'
import type { HomeMeeting } from '@/types/personal'
import { timeLabel, parseDay } from '@/utils/format/days'

export interface HomeMeetingsProps {
  items: HomeMeeting[]
  canOpen: boolean
}

/**
 * Coming meetings the member is expected at, the whole team's ones included
 * @param {HomeMeeting[]} items - Coming meetings, soonest first
 * @param {boolean} canOpen - Member may open a meeting file
 * @return {JSX.Element}
 */

export const HomeMeetings = ({ items, canOpen }: HomeMeetingsProps) => (
  <Section title={PERSONAL_COPY.meetingsTitle}>
    {items.length === 0 ? (
      <p className={HOME_STYLES.empty}>{PERSONAL_COPY.meetingsEmpty}</p>
    ) : (
      <ul className={HOME_STYLES.list}>
        {items.map((item) => {
          const audience = MEETING_AUDIENCE_REGISTRY.get(item.audience)
          const AudienceIcon = ICONS[audience.icon]
          const seat = item.seat ? ATTENDEE_KIND_REGISTRY.label(item.seat) : null

          const body = (
            <>
              <DayStamp date={item.scheduledAt} />
              <span className={HOME_STYLES.rowBody}>
                <span className={HOME_STYLES.rowTitle}>
                  <Glyph value={item.emoji} size="row" /> {item.title}
                </span>
                <span className={HOME_STYLES.rowMeta}>
                  {[timeLabel(parseDay(item.scheduledAt)), seat].filter(Boolean).join(' · ')}
                </span>
              </span>
              <span className={HOME_STYLES.marker} title={audience.summary}>
                <AudienceIcon className={HOME_STYLES.markerIcon} aria-hidden="true" />
                {audience.label}
              </span>
            </>
          )

          return (
            <li key={item.id}>
              {canOpen ? (
                <Link href={ROUTES.meeting(item.id)} className={HOME_STYLES.rowLink}>
                  {body}
                </Link>
              ) : (
                <div className={HOME_STYLES.row}>{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    )}
  </Section>
)
