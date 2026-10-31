'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { ActivityPanel } from '@/components/structures/data/ActivityPanel'
import { FileTabs } from '@/components/structures/page/FileTabs'
import { CandidateBilanTab } from '@/composites/recruitment/candidate/CandidateBilanTab'
import { CandidateComments } from '@/composites/recruitment/candidate/CandidateComments'
import { CandidateBack } from '@/composites/recruitment/candidate/CandidateBack'
import { CandidateRail } from '@/composites/recruitment/candidate/CandidateRail'
import { CandidateOverview } from '@/composites/recruitment/candidate/CandidateOverview'
import { useStartInterview } from '@/composites/recruitment/file/useStartInterview'
import { CandidateTimeline } from '@/composites/recruitment/candidate/CandidateTimeline'
import {
  RecruitmentFileProvider,
  useRecruitmentState,
} from '@/composites/recruitment/file/RecruitmentFileContext'
import { useCandidateRecord } from '@/core/hooks/data/recruitment/useCandidateRecord'
import { candidateStates } from '@/core/lib/recruitment/candidateTimeline'
import { ROUTES } from '@/declarations/navigation'
import { CANDIDATE_COPY, CANDIDATE_TAB_PARAM } from '@/declarations/recruitment/candidateCopy'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { useMenu } from '@/managers/front-end'
import { cn } from '@/utils/classnames'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { RecruitmentDetail, RecruitmentFields, RecruitmentRights } from '@/types/recruitment'

/**
 * Body of the open candidate: rail, then the tabs
 * @param {Object} props - Component props
 * @param {string} props.candidateId - Candidate identifier
 * @param {ActivityEntry[]} props.activity - Journal of the candidate
 * @return {JSX.Element}
 */

const CandidateBody = ({
  candidateId,
  activity,
}: {
  candidateId: string
  activity: ActivityEntry[]
}) => {
  const router = useRouter()
  const [tab, setTab] = useState(useSearchParams().get(CANDIDATE_TAB_PARAM) ?? 'overview')
  const { detail, file, can, candidateMenu } = useRecruitmentState()
  const { contextMenu } = useMenu()
  const candidate = file.candidates.find((entry) => entry.id === candidateId)!
  const record = useCandidateRecord(candidate)

  const states = candidateStates(
    {
      interviewAt: typeof record.values.interviewAt === 'string' ? record.values.interviewAt : null,
      interviewStartedAt: candidate.interviewStartedAt,
      interviewEndedAt: candidate.interviewEndedAt,
      verdictAt: candidate.verdictAt,
      outcomeId: typeof record.values.outcomeId === 'string' ? record.values.outcomeId : null,
    },
    detail.outcomes,
    candidate.stageMarks
  )

  const interview = ROUTES.interview(detail.summary.id, candidate.id)
  const back = `${ROUTES.recruitment(detail.summary.id)}?${CANDIDATE_TAB_PARAM}=candidates`
  const startInterview = useStartInterview()

  return (
    <div className={MEMBER_FILE.layout}>
      <CandidateBack label={CANDIDATE_COPY.back} href={back} />
      {/* On a phone the rail belongs to the overview alone */}
      <div
        className={cn(MEMBER_FILE.railStack, tab !== 'overview' && 'hidden md:flex')}
        onContextMenu={
          can.manage ? contextMenu(candidateMenu(candidate), candidate.name) : undefined
        }
      >
        <CandidateRail
          candidate={candidate}
          record={record}
          footer={
            <CandidateTimeline
              states={states}
              canPass={can.writeCandidates}
              onReview={() => router.push(interview)}
              onPass={() => startInterview(candidate.id)}
              onToggle={
                can.writeCandidates
                  ? (stage) => void file.markStage(candidate.id, stage, states[stage] !== 'done')
                  : undefined
              }
            />
          }
        />
      </div>

      <div className={MEMBER_FILE.main}>
        <FileTabs
          label={CANDIDATE_COPY.interview}
          value={tab}
          onChange={setTab}
          tabs={[
            {
              value: 'overview',
              label: CANDIDATE_COPY.tabOverview,
              icon: 'sheet',
              render: () => (
                <CandidateOverview
                  record={record}
                  comments={<CandidateComments candidate={candidate} />}
                />
              ),
            },
            {
              value: 'bilan',
              label: CANDIDATE_COPY.tabBilan,
              icon: 'note',
              render: () => <CandidateBilanTab candidate={candidate} />,
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
      </div>
    </div>
  )
}

export interface CandidateFileProps {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  candidateId: string
  activity: ActivityEntry[]
}

/**
 * One candidate as a full page
 * @param {RecruitmentDetail} detail - Session resolved server-side
 * @param {RecruitmentFields} fields - Declarations of the forms
 * @param {RecruitmentRights} can - What the viewer may do
 * @param {string} candidateId - Candidate identifier
 * @param {ActivityEntry[]} activity - Journal of the candidate
 * @return {JSX.Element}
 */

export const CandidateFile = ({
  detail,
  fields,
  can,
  candidateId,
  activity,
}: CandidateFileProps) => (
  <RecruitmentFileProvider detail={detail} fields={fields} can={can}>
    <CandidateBody candidateId={candidateId} activity={activity} />
  </RecruitmentFileProvider>
)
