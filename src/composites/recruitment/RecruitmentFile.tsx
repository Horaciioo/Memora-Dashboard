'use client'

import { useSearchParams } from 'next/navigation'
import { ANNOUNCEMENT_PARAM } from '@/declarations/work/announcements'
import { Avatar } from '@/components/elements/display/Avatar'
import Link from '@/components/elements/navigation/AppLink'
import { ActivityPanel } from '@/components/structures/ActivityPanel'
import { FileHead } from '@/components/structures/FileHead'
import { FileTabs } from '@/components/structures/FileTabs'
import { CalendarTab } from '@/composites/recruitment/file/CalendarTab'
import { CandidatesTab } from '@/composites/recruitment/file/CandidatesTab'
import { OverviewTab } from '@/composites/recruitment/file/OverviewTab'
import { RecruitmentDrawers } from '@/composites/recruitment/file/RecruitmentDrawers'
import { RecruitmentFileProvider } from '@/composites/recruitment/file/RecruitmentFileContext'
import { ResultsTab } from '@/composites/recruitment/file/ResultsTab'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { ROUTES } from '@/declarations/navigation'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import type { RecruitmentDetail, RecruitmentFields, RecruitmentRights } from '@/types/recruitment'

export interface RecruitmentFileProps {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  activity: ActivityEntry[]
}

/**
 * Recruitment session file: its head, then its tabs
 * @param {RecruitmentDetail} detail - File resolved server-side
 * @param {RecruitmentFields} fields - Declarations of the forms
 * @param {RecruitmentRights} can - What the viewer may do
 * @param {ActivityEntry[]} activity - Journal entries
 * @return {JSX.Element}
 */

export const RecruitmentFile = ({ detail, fields, can, activity }: RecruitmentFileProps) => {
  const { summary } = detail
  const isFocused = useSearchParams().has(ANNOUNCEMENT_PARAM)
  return (
    <RecruitmentFileProvider detail={detail} fields={fields} can={can}>
      <div className="flex flex-col gap-8">
        <FileHead
          lead={<Avatar name={summary.youtuber.label} src={summary.youtuber.image} size="xl" />}
          title={summary.name}
          meta={
            summary.academySessionId &&
            summary.promotionTitle && (
              <span>
                {RECRUITMENT_COPY.attachedAcademy} :{' '}
                <Link href={ROUTES.session(summary.academySessionId)} className="underline">
                  {summary.promotionTitle}
                </Link>
              </span>
            )
          }
        />

        <FileTabs
          label={RECRUITMENT_COPY.title}
          initial={isFocused ? 'calendar' : undefined}
          tabs={[
            {
              value: 'overview',
              label: SESSION_FILE_COPY.tabOverview,
              icon: 'sheet',
              render: () => <OverviewTab />,
            },
            {
              value: 'candidates',
              label: RECRUITMENT_COPY.tabCandidates,
              icon: 'members',
              render: () => <CandidatesTab />,
            },
            {
              value: 'calendar',
              label: RECRUITMENT_COPY.tabCalendar,
              icon: 'meetings',
              render: () => <CalendarTab />,
            },
            {
              value: 'results',
              label: RECRUITMENT_COPY.tabResults,
              icon: 'projects',
              render: () => <ResultsTab />,
            },
            {
              value: 'logs',
              label: SESSION_FILE_COPY.tabLogs,
              icon: 'history',
              visible: can.readLogs,
              render: () => <ActivityPanel entries={activity} />,
            },
          ]}
        />

        <RecruitmentDrawers />
      </div>
    </RecruitmentFileProvider>
  )
}
