'use client'

import { FileTabs } from '@/components/structures/page/FileTabs'
import { AcademyHistoryPanel } from '@/composites/academy/AcademyHistoryPanel'
import { SessionsPanel, type SessionsPanelProps } from '@/composites/academy/SessionsPanel'
import { ACADEMY_HISTORY_COPY } from '@/declarations/academy/historyCopy'

/**
 * Academy page: the sessions, then the history for those who manage
 * @param {SessionsPanelProps} props - Sessions, form and rights
 * @return {JSX.Element}
 */

export const AcademyView = (props: SessionsPanelProps) => {
  // Nobody below Responsable reads the archives
  if (!props.canManage) return <SessionsPanel {...props} />

  return (
    <FileTabs
      label={ACADEMY_HISTORY_COPY.tabsLabel}
      tabs={[
        {
          value: 'sessions',
          label: ACADEMY_HISTORY_COPY.tabSessions,
          icon: 'academy',
          render: () => <SessionsPanel {...props} />,
        },
        {
          value: 'history',
          label: ACADEMY_HISTORY_COPY.tabHistory,
          icon: 'history',
          render: () => <AcademyHistoryPanel />,
        },
      ]}
    />
  )
}
