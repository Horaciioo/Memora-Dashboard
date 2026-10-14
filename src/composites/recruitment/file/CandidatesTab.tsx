'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { RowList, type RowListGroup } from '@/components/structures/RowList'
import { Section } from '@/components/structures/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { formatDayTime } from '@/utils/format/dates'

/**
 * Candidates of the session, under the outcome each one reached
 * @return {JSX.Element}
 */

export const CandidatesTab = () => {
  const { detail, file, can, candidateForm, candidateMenu, openCandidate } = useRecruitmentState()

  // One heading per outcome, the interview day on the right
  const groups: RowListGroup[] = [
    ...detail.outcomes.map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      accent: outcome.accent,
    })),
    { id: 'none', label: RECRUITMENT_COPY.noOutcomeLegend, accent: 'neutral' },
  ]
    .map((group) => ({
      ...group,
      items: file.candidates
        .filter((candidate) => (candidate.outcomeId ?? 'none') === group.id)
        .map((candidate) => ({
          id: candidate.id,
          title: candidate.name,
          lead: <Avatar name={candidate.name} size="md" />,
          trail: candidate.interviewAt
            ? formatDayTime(candidate.interviewAt)
            : RECRUITMENT_COPY.toSchedule,
          menu: candidateMenu(candidate),
          onOpen: () => openCandidate(candidate.id),
        })),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Section title={RECRUITMENT_COPY.tabCandidates} bare>
      {file.candidates.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.candidatesEmptyTitle}
          description={RECRUITMENT_COPY.candidatesEmptyDescription}
          action={
            <Button
              variant="primary"
              icon="add"
              disabled={!can.manage}
              onClick={() => candidateForm(null)}
            >
              {RECRUITMENT_COPY.candidateAdd}
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <RowList groups={groups} />
          <AddRow
            label={RECRUITMENT_COPY.candidateAdd}
            disabled={!can.manage}
            onClick={() => candidateForm(null)}
          />
        </div>
      )}
    </Section>
  )
}
