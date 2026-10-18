'use client'

import { useRouter } from 'next/navigation'

import Link from '@/components/elements/navigation/AppLink'
import { Avatar } from '@/components/elements/display/Avatar'
import { FileHead } from '@/components/structures/page/FileHead'
import { CandidateComments } from '@/composites/recruitment/candidate/CandidateComments'
import { CandidateOverview } from '@/composites/recruitment/candidate/CandidateOverview'
import { CandidateTimeline } from '@/composites/recruitment/candidate/CandidateTimeline'
import {
  RecruitmentFileProvider,
  useRecruitmentState,
} from '@/composites/recruitment/file/RecruitmentFileContext'
import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import { API_ROUTES } from '@/core/lib/api/routes'
import { candidateRecordValues } from '@/core/lib/recruitment/candidateRecord'
import { candidateStates } from '@/core/lib/recruitment/candidateTimeline'
import { ROUTES } from '@/declarations/navigation'
import type { RecruitmentDetail, RecruitmentFields, RecruitmentRights } from '@/types/recruitment'

const CANDIDATE_ENTITY = { label: 'Candidat', gender: 'masculine' } as const

/**
 * Body of the open candidate: head, corner timeline, fields, interview and remarks
 * @param {Object} props - Component props
 * @param {string} props.candidateId - Candidate identifier
 * @return {JSX.Element | null}
 */

const CandidateBody = ({ candidateId }: { candidateId: string }) => {
  const router = useRouter()
  const { detail, file, can } = useRecruitmentState()
  const candidate = file.candidates.find((entry) => entry.id === candidateId)!
  const record = useRecordFile({
    path: API_ROUTES.candidate(candidate.id),
    entity: CANDIDATE_ENTITY,
    initialValues: candidateRecordValues(candidate),
  })

  const attended = record.values.attended === true
  const states = candidateStates(
    {
      interviewAt: typeof record.values.interviewAt === 'string' ? record.values.interviewAt : null,
      attended,
      outcomeId: typeof record.values.outcomeId === 'string' ? record.values.outcomeId : null,
    },
    detail.outcomes,
    candidate.stageMarks
  )

  return (
    <div className="flex flex-col gap-8">
      <FileHead
        lead={<Avatar name={candidate.name} size="xl" />}
        title={candidate.name}
        meta={
          <Link href={ROUTES.recruitment(detail.summary.id)} className="underline">
            {detail.summary.promotionTitle ?? detail.summary.name}
          </Link>
        }
      />

      <CandidateOverview
        candidate={candidate}
        record={record}
        side={
          <CandidateTimeline
            states={states}
            canPass={can.writeCandidates}
            onReview={() => router.push(ROUTES.interview(detail.summary.id, candidate.id))}
            onPass={() =>
              void file
                .markStage(candidate.id, 'interviewing', true)
                .then(() => router.push(ROUTES.interview(detail.summary.id, candidate.id)))
            }
            onToggle={
              can.writeCandidates
                ? (stage) => void file.markStage(candidate.id, stage, states[stage] !== 'done')
                : undefined
            }
          />
        }
      >
        <CandidateComments candidate={candidate} />
      </CandidateOverview>
    </div>
  )
}

export interface CandidateFileProps {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  candidateId: string
}

/**
 * One candidate as a full page
 * @param {RecruitmentDetail} detail - Session resolved server-side
 * @param {RecruitmentFields} fields - Declarations of the forms
 * @param {RecruitmentRights} can - What the viewer may do
 * @param {string} candidateId - Candidate identifier
 * @return {JSX.Element}
 */

export const CandidateFile = ({ detail, fields, can, candidateId }: CandidateFileProps) => (
  <RecruitmentFileProvider detail={detail} fields={fields} can={can}>
    <CandidateBody candidateId={candidateId} />
  </RecruitmentFileProvider>
)
