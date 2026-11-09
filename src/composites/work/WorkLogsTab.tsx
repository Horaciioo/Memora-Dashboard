'use client'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Status } from '@/components/elements/display/Status'
import { ActivityTimeline } from '@/components/structures/data/ActivityTimeline'
import { Section } from '@/components/structures/page/Section'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface WorkLogsTabProps {
  copy: { tabLogs: string; logsEmptyTitle: string; logsEmptyDescription: string }
  activity: ActivityEntry[]
}

/**
 * Journal tab of a work file
 * @param {WorkLogsTabProps} props - Copy and entries
 * @return {JSX.Element}
 */

export const WorkLogsTab = ({ copy, activity }: WorkLogsTabProps) => (
  <Section title={copy.tabLogs} maturity="beta" bare>
    <div className="flex flex-col gap-4">
      {activity.length === 0 ? (
        <EmptyState
          figure="notes"
          title={copy.logsEmptyTitle}
          description={copy.logsEmptyDescription}
          action={<Status label={copy.tabLogs} tone="neutral" />}
        />
      ) : (
        <div className={cn(SECTION_STYLES.panel, SECTION_STYLES.panelPadded)}>
          <ActivityTimeline entries={activity} />
        </div>
      )}
    </div>
  </Section>
)
