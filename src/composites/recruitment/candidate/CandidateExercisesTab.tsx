'use client'

import { Section } from '@/components/structures/page/Section'
import { LinkList } from '@/composites/recruitment/exercise/LinkList'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useExerciseLinks } from '@/core/hooks/data/recruitment/useExerciseLinks'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'

export interface CandidateExercisesTabProps {
  candidateId: string
}

/**
 * Written-context links handed to the candidate
 * @param {string} candidateId - Applicant followed
 * @return {JSX.Element}
 */

export const CandidateExercisesTab = ({ candidateId }: CandidateExercisesTabProps) => {
  const { can } = useRecruitmentState()
  const { links, isSaving, expire } = useExerciseLinks(candidateId)

  if (links.length === 0) return null

  return (
    <Section title={CANDIDATE_COPY.tabExercises} bare>
      <LinkList
        links={links}
        disabled={!can.writeCandidates || isSaving}
        onExpire={(id) => void expire(id)}
      />
    </Section>
  )
}
