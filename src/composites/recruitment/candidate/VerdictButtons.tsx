'use client'

import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { DELIBERATION_VERDICTS } from '@/declarations/recruitment/outcomes'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { CandidateView } from '@/types/recruitment'
import { cn } from '@/utils/classnames'

export interface VerdictButtonsProps {
  candidate: CandidateView
}

/**
 * Favourable, mixed or unfavourable, the issue following the verdict
 * @param {CandidateView} candidate - Applicant judged
 * @return {JSX.Element}
 */

export const VerdictButtons = ({ candidate }: VerdictButtonsProps) => {
  const { detail, file, can } = useRecruitmentState()

  return (
    <div className={INTERVIEW.verdicts}>
      {DELIBERATION_VERDICTS.map((verdict) => {
        // Found by stable name, never by label
        const outcome = detail.outcomes.find((entry) => entry.name === verdict.outcome)
        if (!outcome) return null

        const isOn = candidate.outcomeId === outcome.id

        return (
          <button
            key={verdict.outcome}
            type="button"
            aria-pressed={isOn}
            disabled={!can.writeCandidates || file.isSaving}
            onClick={() =>
              void file.setInterview(candidate.id, { verdictOutcomeId: isOn ? null : outcome.id })
            }
            className={cn(INTERVIEW.verdict, isOn && INTERVIEW.verdictOn[verdict.tone])}
          >
            {verdict.label}
          </button>
        )
      })}
    </div>
  )
}
