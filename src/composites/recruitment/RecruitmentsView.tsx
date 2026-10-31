'use client'

import { FileTabs } from '@/components/structures/page/FileTabs'
import { HistoryPanel } from '@/composites/recruitment/history/HistoryPanel'
import {
  RecruitmentsPanel,
  type RecruitmentsPanelProps,
} from '@/composites/recruitment/RecruitmentsPanel'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'

/**
 * Recruitment page: the sessions, then the history for those who manage
 * @param {RecruitmentsPanelProps} props - Sessions, forms and rights
 * @return {JSX.Element}
 */

export const RecruitmentsView = (props: RecruitmentsPanelProps) => {
  // Nobody below Responsable reads the archives
  if (!props.canManage) return <RecruitmentsPanel {...props} />

  return (
    <FileTabs
      label={HISTORY_COPY.tabsLabel}
      tabs={[
        {
          value: 'sessions',
          label: HISTORY_COPY.tabSessions,
          icon: 'recruitment',
          render: () => <RecruitmentsPanel {...props} />,
        },
        {
          value: 'history',
          label: HISTORY_COPY.tabHistory,
          icon: 'history',
          render: () => <HistoryPanel />,
        },
      ]}
    />
  )
}
