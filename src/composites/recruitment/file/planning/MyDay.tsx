'use client'

import { Avatar, AvatarStack } from '@/components/elements/display/Avatar'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { PAST_INTERVIEW_OUTCOMES } from '@/declarations/reference/fixed'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { MY_DAY } from '@/declarations/ui/variants'
import type { CandidateView } from '@/types/recruitment'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/dates'
import { formatDayKey } from '@/utils/format/days'

export interface MyDayProps {
  candidates: CandidateView[]
  now: number
}

/**
 * Interviews of today in time order
 * @param {MyDayProps} props - Interviews and server time
 * @return {JSX.Element}
 */

export const MyDay = ({ candidates, now }: MyDayProps) => {
  const { detail, openCandidate } = useRecruitmentState()
  const today = formatDayKey(new Date(now))

  // Planned today only
  const slots = candidates
    .filter((candidate) => candidate.interviewAt && formatDayKey(candidate.interviewAt) === today)
    .sort((first, second) => first.interviewAt!.localeCompare(second.interviewAt!))

  // Interview already over
  const isDone = (candidate: CandidateView) =>
    PAST_INTERVIEW_OUTCOMES.includes(
      detail.outcomes.find((outcome) => outcome.id === candidate.outcomeId)?.name ?? ''
    )

  return (
    <Section title={RECRUITMENT_COPY.dayToday} padded>
      {slots.length === 0 ? (
        <p className={MY_DAY.empty}>{RECRUITMENT_COPY.dayEmpty}</p>
      ) : (
        <ol className={MY_DAY.list}>
          {slots.map((candidate) => (
            <li key={candidate.id}>
              <button
                type="button"
                className={cn(MY_DAY.slot, isDone(candidate) && MY_DAY.done)}
                onClick={() => openCandidate(candidate.id)}
              >
                <span className={MY_DAY.clock}>{formatClock(candidate.interviewAt!)}</span>
                <Avatar name={candidate.name} src={candidate.avatarUrl} size="sm" />
                <span className={MY_DAY.name}>{candidate.name}</span>
                {candidate.observers.length > 0 && (
                  <AvatarStack
                    size="sm"
                    max={candidate.observers.length}
                    people={candidate.observers.map((member) => ({
                      id: member.id,
                      name: member.label,
                      src: member.image,
                    }))}
                  />
                )}
              </button>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}
