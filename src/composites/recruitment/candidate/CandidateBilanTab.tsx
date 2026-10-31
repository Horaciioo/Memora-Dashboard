'use client'

import { Section } from '@/components/structures/page/Section'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { CandidateExercisesTab } from '@/composites/recruitment/candidate/CandidateExercisesTab'
import { BilanQuestionCards } from '@/composites/recruitment/candidate/BilanQuestionCards'
import { InterviewTally } from '@/composites/recruitment/interview/InterviewTally'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useQuestionnaire } from '@/core/hooks/data/recruitment/useQuestionnaire'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { BILAN, FILE_BOX } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { CandidateView } from '@/types/recruitment'

export interface CandidateBilanTabProps {
  candidate: CandidateView
}

/**
 * Bilan, verdict, tally, notes and exercises
 * @param {CandidateView} candidate - Applicant interviewed
 * @return {JSX.Element}
 */

export const CandidateBilanTab = ({ candidate }: CandidateBilanTabProps) => {
  const { detail, file, can } = useRecruitmentState()
  const { youtuber, platform } = detail.summary
  const { picked } = useQuestionnaire(platform, youtuber.label, file.questionKeys, candidate.formal)

  return (
    <div className={BILAN.stack}>
      <Section title={CANDIDATE_COPY.bilanWritten} padded>
        <InlineMarkdown
          id="candidate-review"
          value={candidate.review}
          placeholder={QUESTIONNAIRE_COPY.reviewPlaceholder}
          disabled={!can.writeCandidates}
          onCommit={(next) => file.saveReview(candidate.id, next)}
        />
      </Section>

      <div className={cn(FILE_BOX.box, BILAN.verdictBox)}>
        <div className={BILAN.tally}>
          <InterviewTally
            questions={picked}
            answers={candidate.answers}
            comments={candidate.comments}
          />
        </div>
      </div>

      <Section title={CANDIDATE_COPY.bilanComments} bare>
        <BilanQuestionCards candidate={candidate} />
      </Section>

      {can.writeCandidates && <CandidateExercisesTab candidateId={candidate.id} />}
    </div>
  )
}
