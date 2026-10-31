'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { RowList, type RowListGroup } from '@/components/structures/data/RowList'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useStartInterview } from '@/composites/recruitment/file/useStartInterview'
import { candidateStates, CANDIDATE_STAGES } from '@/core/lib/recruitment/candidateTimeline'
import { groupByDay, isQuestionnaireOpen, type MySeat } from '@/core/lib/recruitment/mySchedule'
import { CANDIDATE_STAGE_COPY } from '@/declarations/recruitment/candidateCopy'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { ROUTES } from '@/declarations/navigation'
import { accentVars } from '@/declarations/ui/theme'
import { PASTEL_TAG } from '@/declarations/ui/variants'
import type { CandidateView } from '@/types/recruitment'
import { addDays, formatDayKey, parseDay } from '@/utils/format/days'
import { formatClock, formatDay } from '@/utils/format/dates'

export interface MyInterviewsBoxProps {
  title: string
  empty: string
  seat: MySeat
  candidates: CandidateView[]
  now: number
}

/**
 * Heading of one day
 * @param {string | null} key - Local day key
 * @param {number} now - Server milliseconds
 * @return {string} - Today, tomorrow, the date or unplanned
 */

const dayLabel = (key: string | null, now: number): string => {
  if (key === null) return RECRUITMENT_COPY.toSchedule
  if (key === formatDayKey(new Date(now))) return RECRUITMENT_COPY.dayToday
  if (key === formatDayKey(addDays(new Date(now), 1))) return RECRUITMENT_COPY.dayTomorrow

  return formatDay(parseDay(key))
}

/**
 * Interviews of the viewer, one heading per day
 * @param {MyInterviewsBoxProps} props - Seat and interviews
 * @return {JSX.Element}
 */

export const MyInterviewsBox = ({ title, empty, seat, candidates, now }: MyInterviewsBoxProps) => {
  const router = useRouter()
  const { detail, can, openCandidate } = useRecruitmentState()
  const startInterview = useStartInterview()
  const isLead = seat === 'recruiters'

  const groups: RowListGroup[] = groupByDay(candidates).map((day) => ({
    id: day.key ?? 'unplanned',
    label: dayLabel(day.key, now),
    items: day.items.map((candidate) => {
      const outcome = detail.outcomes.find((entry) => entry.id === candidate.outcomeId)
      const states = candidateStates(candidate, detail.outcomes, candidate.stageMarks)
      const stage = CANDIDATE_STAGES.find((entry) => states[entry] === 'current')
      const isOpen = isQuestionnaireOpen(candidate.interviewAt, now, candidate.verdictAt)

      return {
        id: candidate.id,
        title: candidate.name,
        meta: stage && CANDIDATE_STAGE_COPY[stage],
        metaEmpty: true,
        lead: <Avatar name={candidate.name} src={candidate.avatarUrl} size="md" />,
        trail: (
          <span className="flex items-center gap-3">
            {outcome && (
              <span className={PASTEL_TAG} style={accentVars(outcome.accent)}>
                {outcome.label}
              </span>
            )}
            {candidate.interviewAt && <span>{formatClock(candidate.interviewAt)}</span>}
            {isOpen && (isLead ? can.writeCandidates : true) && (
              <Button
                variant="primary"
                onClick={(event) => {
                  event.stopPropagation()
                  if (isLead) startInterview(candidate.id)
                  else router.push(ROUTES.interview(detail.summary.id, candidate.id))
                }}
              >
                {isLead ? RECRUITMENT_COPY.openQuestionnaire : RECRUITMENT_COPY.joinObservation}
              </Button>
            )}
          </span>
        ),
        menu: [],
        onOpen: () => openCandidate(candidate.id),
      }
    }),
  }))

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
