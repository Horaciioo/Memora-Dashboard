'use client'

import { Avatar, AvatarStack } from '@/components/elements/display/Avatar'
import { RowList } from '@/components/structures/data/RowList'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { upcomingInterviews } from '@/core/lib/recruitment/mySchedule'
import { RECRUITMENT_SETTINGS } from '@/declarations/configurations/recruitment'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { formatDayTime } from '@/utils/format/dates'

export interface UpcomingInterviewsProps {
  serverTime: string
}

/**
 * Next interviews of the session, soonest first
 * @param {UpcomingInterviewsProps} props - Server time at load
 * @return {JSX.Element | null}
 */

export const UpcomingInterviews = ({ serverTime }: UpcomingInterviewsProps) => {
  const { file, openCandidate } = useRecruitmentState()
  const coming = upcomingInterviews(
    file.candidates,
    new Date(serverTime).getTime(),
    RECRUITMENT_SETTINGS.upcomingInterviews
  )

  if (coming.length === 0) return null

  return (
    <Section title={RECRUITMENT_COPY.upcomingTitle} bare>
      <RowList
        groups={[
          {
            id: 'upcoming',
            label: '',
            items: coming.map((candidate) => ({
              id: candidate.id,
              title: candidate.name,
              lead: <Avatar name={candidate.name} src={candidate.avatarUrl} size="md" />,
              trail: (
                <span className="flex items-center gap-3">
                  {candidate.recruiters.length > 0 && (
                    <AvatarStack
                      size="sm"
                      max={candidate.recruiters.length}
                      people={candidate.recruiters.map((member) => ({
                        id: member.id,
                        name: member.label,
                        src: member.image,
                      }))}
                    />
                  )}
                  <span>{formatDayTime(candidate.interviewAt as string)}</span>
                </span>
              ),
              menu: [],
              onOpen: () => openCandidate(candidate.id),
            })),
          },
        ]}
      />
    </Section>
  )
}
