import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ActivityTimeline } from '@/components/structures/ActivityTimeline'
import { Section } from '@/components/structures/Section'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { ActivityEntry } from '@/core/services/system/ActivityService'

export interface ActivityPanelProps {
  entries: ActivityEntry[]
}

/**
 * Journal tab of a file
 * @param {ActivityEntry[]} entries - Journal entries
 * @return {JSX.Element}
 */

export const ActivityPanel = ({ entries }: ActivityPanelProps) => (
  <Section title={SESSION_FILE_COPY.tabLogs} bare>
    {entries.length === 0 ? (
      <EmptyState
        figure="notes"
        title={SESSION_FILE_COPY.logsEmptyTitle}
        description={SESSION_FILE_COPY.logsEmptyDescription}
        action={<Status label={SESSION_FILE_COPY.tabLogs} tone="neutral" />}
      />
    ) : (
      <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded)}>
        <ActivityTimeline entries={entries} />
      </div>
    )}
  </Section>
)
