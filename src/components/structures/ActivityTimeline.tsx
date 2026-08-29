import { Avatar } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { ACTIVITY_COPY } from '@/declarations/activity/copy'
import { ACTIVITY_EVENT_REGISTRY } from '@/declarations/activity/registries'
import { JOURNAL_STYLES } from '@/declarations/ui/variants'
import { formatDayTime } from '@/utils/format/dates'
import type { ActivityEntry } from '@/core/services/system/ActivityService'

export interface ActivityTimelineProps {
  entries: ActivityEntry[]
}

/**
 * Vertical journal of recorded events, newest first — the portrait of whoever acted opens
 * each row, its tag carrying the nature of the act in colour
 * @param {ActivityEntry[]} entries - Journal entries
 * @return {JSX.Element}
 */

export const ActivityTimeline = ({ entries }: ActivityTimelineProps) => (
  <ol className={JOURNAL_STYLES.list}>
    {entries.map((entry, index) => {
      const event = entry.event ? ACTIVITY_EVENT_REGISTRY.get(entry.event) : null
      const actor = entry.actorName ?? ACTIVITY_COPY.system

      return (
        <li key={entry.id} className={JOURNAL_STYLES.item}>
          <div className={JOURNAL_STYLES.entry}>
            <Avatar name={actor} src={entry.actorAvatar} size="xs" />
            <div className={JOURNAL_STYLES.body}>
              <span className={JOURNAL_STYLES.head}>
                <Badge label={event?.label ?? entry.origin} tone={event?.tone ?? 'neutral'} />
                <span className={JOURNAL_STYLES.tick} aria-hidden="true" />
                <span className={JOURNAL_STYLES.moment}>{formatDayTime(entry.createdAt)}</span>
              </span>
              {event && (
                <p className={JOURNAL_STYLES.sentence}>
                  {`${actor} ${ACTIVITY_COPY.did} `}
                  <strong className={JOURNAL_STYLES.verb}>{event.verb}</strong>
                  {` ${event.target}.`}
                </p>
              )}
            </div>
          </div>
          {index < entries.length - 1 && (
            <span className={JOURNAL_STYLES.separator} aria-hidden="true" />
          )}
        </li>
      )
    })}
  </ol>
)
