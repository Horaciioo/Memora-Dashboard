'use client'

import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { ScrollCard } from '@/components/structures/data/ScrollCard'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'

/**
 * Consignes of the session, written in place under the timeline
 * @return {JSX.Element}
 */

export const InstructionsCard = () => {
  const { file, fields, can } = useRecruitmentState()

  return (
    <ScrollCard title={RECRUITMENT_COPY.instructionsTitle}>
      <InlineMarkdown
        id="recruitment-instructions"
        value={file.instructions}
        placeholder={RECRUITMENT_COPY.instructionsPlaceholder}
        disabled={!can.writeInstructions}
        maxLength={fields.instruction[0]?.maxLength}
        onCommit={file.saveInstructions}
      />
    </ScrollCard>
  )
}
