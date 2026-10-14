import {
  AppreciationButtons,
  SkipGlyph,
} from '@/composites/recruitment/questionnaire/AppreciationButtons'
import { BLANK_ANSWER } from '@/core/lib/recruitment/questionnaire'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'
import { AnswerAppreciations } from '@/utils/constants/recruitment'
import { cn } from '@/utils/classnames'

// Wash of the row per reaction
const TINTS: Record<string, string | undefined> = {
  [AnswerAppreciations.Like]: INTERVIEW.cardLike,
  [AnswerAppreciations.Neutral]: INTERVIEW.cardNeutral,
  [AnswerAppreciations.Dislike]: INTERVIEW.cardDislike,
}

export interface SecondaryAskProps {
  prompt: string
  answer: AnswerState | undefined
  disabled?: boolean
  onChange: (patch: Partial<AnswerState>) => void
}

/**
 * Sub-question shown in the open, with its own reaction and skip
 * @param {string} prompt - What is asked
 * @param {AnswerState | undefined} answer - What was written
 * @param {boolean} [disabled] - Blocks writing
 * @param {(patch: Partial<AnswerState>) => void} onChange - Called with what changed
 * @return {JSX.Element}
 */

export const SecondaryAsk = ({ prompt, answer, disabled, onChange }: SecondaryAskProps) => {
  const state = answer ?? BLANK_ANSWER

  return (
    <div
      className={cn(
        INTERVIEW.ask,
        !state.skipped && TINTS[state.appreciation ?? ''],
        state.skipped && INTERVIEW.cardSkipped
      )}
    >
      <p
        className={cn(
          INTERVIEW.askBody,
          INTERVIEW.askSub,
          state.skipped && INTERVIEW.promptSkipped
        )}
      >
        {prompt}
      </p>
      <div className={INTERVIEW.actions}>
        {!state.skipped && (
          <AppreciationButtons
            value={state.appreciation}
            disabled={disabled}
            onChange={(appreciation) => onChange({ appreciation })}
          />
        )}
        <SkipGlyph
          disabled={disabled}
          isOn={state.skipped}
          onSkip={() => onChange({ skipped: !state.skipped })}
        />
      </div>
    </div>
  )
}
