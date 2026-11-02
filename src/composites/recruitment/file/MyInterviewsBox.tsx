'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { RowList, type RowListGroup, type RowListItem } from '@/components/structures/data/RowList'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useStartInterview } from '@/composites/recruitment/file/useStartInterview'
import { isQuestionnaireOpen, oldestFirst, type MySeat } from '@/core/lib/recruitment/mySchedule'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { ROUTES } from '@/declarations/navigation'
import type { CandidateView } from '@/types/recruitment'
import { formatDayTime } from '@/utils/format/dates'

export interface MyInterviewsBoxProps {
  title: string
  empty: string
  seat: MySeat
  candidates: CandidateView[]
  now: number
}

/**
 * Interviews of the viewer, by status then by time
 * @param {MyInterviewsBoxProps} props - Seat and interviews
 * @return {JSX.Element}
 */

export const MyInterviewsBox = ({ title, empty, seat, candidates, now }: MyInterviewsBoxProps) => {
  const router = useRouter()
  const { detail, can, openCandidate } = useRecruitmentState()
  const startInterview = useStartInterview()
  const isLead = seat === 'recruiters'
  const label = isLead ? RECRUITMENT_COPY.openQuestionnaire : RECRUITMENT_COPY.joinObservation
  // Leads start the questionnaire, observers join it
  const open = (candidateId: string) =>
    isLead
      ? startInterview(candidateId)
      : router.push(ROUTES.interview(detail.summary.id, candidateId))

  const rowOf = (candidate: CandidateView): RowListItem => {
    const isOpen = isQuestionnaireOpen(candidate.interviewAt, now, candidate.verdictAt)

    return {
      id: candidate.id,
      title: candidate.name,
      meta: candidate.interviewAt ? formatDayTime(candidate.interviewAt) : undefined,
      lead: <Avatar name={candidate.name} src={candidate.avatarUrl} size="md" />,
      trail:
        isOpen && (isLead ? can.writeCandidates : true) ? (
          <Button
            variant="primary"
            icon={isLead ? 'mediaPlay' : 'viewer'}
            aria-label={label}
            title={label}
            onClick={(event) => {
              event.stopPropagation()
              open(candidate.id)
            }}
          />
        ) : undefined,
      menu: [],
      onOpen: () => openCandidate(candidate.id),
    }
  }

  // One heading per status, interviews in time order under each
  const groups: RowListGroup[] = detail.outcomes
    .map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      accent: outcome.accent,
      items: oldestFirst(candidates.filter((candidate) => candidate.outcomeId === outcome.id)).map(
        rowOf
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Section title={title} bare>
      {candidates.length === 0 ? (
        <EmptyState figure="members" title={title} description={empty} action={null} />
      ) : (
        <RowList groups={groups} />
      )}
    </Section>
  )
}
