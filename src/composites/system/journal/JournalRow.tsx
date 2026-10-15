import { Status } from '@/components/elements/display/Status'
import { ActivityDetail } from '@/components/structures/ActivityDetail'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_COPY, JOURNAL_LEVEL_TONES } from '@/declarations/system/journal'
import { JOURNAL_TABLE_STYLES } from '@/declarations/ui/variants'
import { EVENT_TYPES, LOG_LEVELS } from '@/utils/constants/events'
import { formatDayTime } from '@/utils/format/dates'

export interface JournalRowProps {
  entry: ActivityEntry
}

// One labelled fact of the detail
const Fact = ({ label, value }: { label: string; value: string | null }) => (
  <>
    <dt className={JOURNAL_TABLE_STYLES.factLabel}>{label}</dt>
    <dd className={JOURNAL_TABLE_STYLES.factValue}>{value ?? JOURNAL_COPY.detailUnknown}</dd>
  </>
)

/**
 * One journal line, opened for its context
 * @param {ActivityEntry} entry - Journal entry
 * @return {JSX.Element}
 */

export const JournalRow = ({ entry }: JournalRowProps) => {
  const target = entry.targetType ? `${entry.targetType} ${entry.targetId ?? ''}`.trim() : null

  return (
    <li className={JOURNAL_TABLE_STYLES.row}>
      <details>
        <summary className={JOURNAL_TABLE_STYLES.summary}>
          <span className={JOURNAL_TABLE_STYLES.moment}>{formatDayTime(entry.createdAt)}</span>
          <Status
            label={LOG_LEVELS.byName(entry.level).label}
            tone={JOURNAL_LEVEL_TONES[entry.level]}
          />
          <span className={JOURNAL_TABLE_STYLES.cell}>
            {entry.event ? EVENT_TYPES.byName(entry.event).label : entry.origin}
          </span>
          <span className={JOURNAL_TABLE_STYLES.muted}>
            {entry.actorName ?? JOURNAL_COPY.system}
          </span>
          <span className={JOURNAL_TABLE_STYLES.cell}>{entry.summary}</span>
        </summary>
        <div className={JOURNAL_TABLE_STYLES.detail}>
          <dl className={JOURNAL_TABLE_STYLES.facts}>
            <Fact label={JOURNAL_COPY.detailOrigin} value={entry.origin} />
            <Fact label={JOURNAL_COPY.detailRoute} value={entry.route} />
            <Fact label={JOURNAL_COPY.detailAddress} value={entry.ip} />
            <Fact label={JOURNAL_COPY.detailClient} value={entry.userAgent} />
            <Fact label={JOURNAL_COPY.detailTarget} value={target} />
          </dl>
          <ActivityDetail entry={entry} />
        </div>
      </details>
    </li>
  )
}
