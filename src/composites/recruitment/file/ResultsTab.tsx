'use client'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { KanbanBoard, type BoardColumn } from '@/components/structures/data/KanbanBoard'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { CANDIDATE_CARD } from '@/declarations/ui/variants'
import type { CandidateView } from '@/types/recruitment'

/**
 * One candidate in the results board: a name, a hint while unscheduled
 * @param {CandidateView} candidate - Applicant rendered
 * @return {JSX.Element}
 */

const candidateCard = (candidate: CandidateView) => (
  <span className={CANDIDATE_CARD.body}>
    <span className={CANDIDATE_CARD.name}>{candidate.name}</span>
    {!candidate.interviewAt && (
      <span className={CANDIDATE_CARD.metaEmpty}>{RECRUITMENT_COPY.toSchedule}</span>
    )}
  </span>
)

/**
 * Results board: candidates dragged from one outcome to the next
 * @return {JSX.Element}
 */

export const ResultsTab = () => {
  const { detail, file, can, candidateForm, candidateMenu, openCandidate } = useRecruitmentState()

  const columns: BoardColumn[] = detail.outcomes.map((outcome) => ({
    id: outcome.id,
    label: outcome.label,
    accent: outcome.accent,
    count: file.candidates.filter((candidate) => candidate.outcomeId === outcome.id).length,
  }))

  return (
    <Section title={RECRUITMENT_COPY.resultsTitle} description={RECRUITMENT_COPY.resultsLead} bare>
      {columns.length === 0 ? (
        <EmptyState
          figure="members"
          title={RECRUITMENT_COPY.outcomesEmptyTitle}
          description={RECRUITMENT_COPY.outcomesEmptyDescription}
          action={<MaturityTag maturity="alpha" interactive={false} />}
        />
      ) : (
        <KanbanBoard
          columns={columns}
          items={file.candidates.map((candidate) => ({
            ...candidate,
            columnId: candidate.outcomeId,
          }))}
          renderCard={candidateCard}
          onMove={(itemId, columnId, index) => void file.moveCandidate(itemId, columnId, index)}
          onOpen={(item) => openCandidate(item.id)}
          cardMenu={candidateMenu}
          addLabel={RECRUITMENT_COPY.candidateAdd}
          canCreate={can.writeCandidates}
          onCreate={() => candidateForm(null)}
          canMove={can.writeCandidates}
          tintByColumn
        />
      )}
    </Section>
  )
}
