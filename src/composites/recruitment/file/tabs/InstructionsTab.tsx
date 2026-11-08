'use client'

import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { Section } from '@/components/structures/page/Section'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'

/**
 * Consignes of the session, written in place
 * @return {JSX.Element}
 */

export const InstructionsTab = () => {
  const { file, fields, can } = useRecruitmentState()

  return (
    <Section title={RECRUITMENT_COPY.instructionsTitle} padded>
      <InlineMarkdown
        id="recruitment-instructions"
        value={file.instructions}
        placeholder={
          can.writeInstructions
            ? RECRUITMENT_COPY.instructionsPlaceholder
            : RECRUITMENT_COPY.instructionsNone
        }
        disabled={!can.writeInstructions}
        maxLength={fields.instruction[0]?.maxLength}
        onCommit={file.saveInstructions}
      />
    </Section>
  )
}
