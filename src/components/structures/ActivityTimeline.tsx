import { Badge } from '@/components/elements/display/Badge'
import { TIMELINE_STYLES } from '@/declarations/ui/variants'
import { formatDayTime } from '@/utils/format/dates'
import type { ActivityEntry } from '@/core/services/system/ActivityService'

export interface ActivityTimelineProps {
  entries: ActivityEntry[]
}

/**
 * Vertical journal of recorded events, newest first
 * @param {ActivityEntry[]} entries - Journal entries
 * @return {JSX.Element}
 */

export const ActivityTimeline = ({ entries }: ActivityTimelineProps) => (
  <ol className={TIMELINE_STYLES.list}>
    {entries.map((entry, index) => (
      <li key={entry.id} className={TIMELINE_STYLES.item}>
        {index < entries.length - 1 && <span className={TIMELINE_STYLES.rail} aria-hidden="true" />}
        <span className={`${TIMELINE_STYLES.dot} bg-[var(--color-brand-600)]`} aria-hidden="true" />
        <div className={TIMELINE_STYLES.body}>
          <span className="flex flex-wrap items-center gap-2">
            <Badge label={entry.label} tone="brand" />
            <span className="truncate">{entry.summary}</span>
          </span>
          <span className={TIMELINE_STYLES.meta}>
            {[formatDayTime(entry.createdAt), entry.actorName, entry.origin]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
      </li>
    ))}
  </ol>
)
