import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { INTERVIEW } from '@/declarations/ui/variants'
import type { AnswerState } from '@/types/recruitment'
import { AnswerAppreciations } from '@/utils/constants/recruitment'
import { cn } from '@/utils/classnames'

export interface AppreciationButtonsProps {
  value: AnswerState['appreciation']
  disabled?: boolean
  onChange: (next: AnswerState['appreciation']) => void
}

// Reactions in display order
const REACTIONS: {
  value: NonNullable<AnswerState['appreciation']>
  icon: IconName
  label: string
  tone: string
}[] = [
  {
    value: AnswerAppreciations.Like,
    icon: 'like',
    label: QUESTIONNAIRE_COPY.like,
    tone: INTERVIEW.liked,
  },
  {
    value: AnswerAppreciations.Neutral,
    icon: 'neutral',
    label: QUESTIONNAIRE_COPY.neutral,
    tone: INTERVIEW.neutral,
  },
  {
    value: AnswerAppreciations.Dislike,
    icon: 'dislike',
    label: QUESTIONNAIRE_COPY.dislike,
    tone: INTERVIEW.disliked,
  },
]

/**
 * Green, grey and red glyphs on an answer, a second press takes it back
 * @param {AnswerState['appreciation']} value - Reaction in force
 * @param {boolean} [disabled] - Blocks the glyphs
 * @param {(next: AnswerState['appreciation']) => void} onChange - Called with the new reaction
 * @return {JSX.Element}
 */

export const AppreciationButtons = ({ value, disabled, onChange }: AppreciationButtonsProps) => (
  <>
    {REACTIONS.map((reaction) => {
      const Glyph = ICONS[reaction.icon]
      const isOn = value === reaction.value

      return (
        <button
          key={reaction.value}
          type="button"
          aria-label={reaction.label}
          title={reaction.label}
          aria-pressed={isOn}
          disabled={disabled}
          className={cn(
            INTERVIEW.glyph,
            reaction.tone,
            isOn && INTERVIEW.glyphOn,
            value && !isOn && INTERVIEW.faded
          )}
          onClick={() => onChange(isOn ? null : reaction.value)}
        >
          <Glyph className={INTERVIEW.glyphSize} aria-hidden="true" />
        </button>
      )
    })}
  </>
)

export interface SkipGlyphProps {
  disabled?: boolean
  // Already left aside, a press brings it back
  isOn?: boolean
  onSkip: () => void
}

/**
 * Cross leaving a question aside
 * @param {boolean} [disabled] - Blocks the glyph
 * @param {boolean} [isOn] - Left aside already
 * @param {() => void} onSkip - Called on press
 * @return {JSX.Element}
 */

export const SkipGlyph = ({ disabled, isOn, onSkip }: SkipGlyphProps) => {
  const Glyph = ICONS.close

  return (
    <button
      type="button"
      aria-label={isOn ? QUESTIONNAIRE_COPY.unskip : QUESTIONNAIRE_COPY.skip}
      title={isOn ? QUESTIONNAIRE_COPY.unskip : QUESTIONNAIRE_COPY.skip}
      aria-pressed={isOn}
      disabled={disabled}
      className={cn(INTERVIEW.glyph, INTERVIEW.glyphSkip, isOn && INTERVIEW.glyphOn)}
      onClick={onSkip}
    >
      <Glyph className={INTERVIEW.glyphSize} aria-hidden="true" />
    </button>
  )
}
