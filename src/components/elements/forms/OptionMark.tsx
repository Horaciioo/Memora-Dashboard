import { Avatar } from '@/components/elements/display/Avatar'
import { PRIORITY_GLYPH } from '@/declarations/ui/copy'
import { TONES, toTone } from '@/declarations/ui/theme'
import { OPTION_MARK_STYLES } from '@/declarations/ui/variants'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'

export interface OptionMarkProps {
  mark: OptionMarkKind
  option: FieldOption
}

/**
 * Glyph drawn before an option label, so a choice reads by shape as well as by name
 * @param {OptionMarkKind} mark - Glyph shape to draw
 * @param {FieldOption} option - Option carrying the accent and the portrait
 * @return {JSX.Element}
 */

export const OptionMark = ({ mark, option }: OptionMarkProps) => {
  // A portrait carries its own colour, the other two borrow the option accent
  if (mark === 'avatar') {
    return <Avatar name={option.label} src={option.image} size="xs" />
  }

  const tone = TONES[toTone(option.accent, mark === 'priority' ? 'warning' : 'neutral')]

  if (mark === 'priority') {
    return (
      <span className={cn(OPTION_MARK_STYLES.priority, tone.text)} aria-hidden="true">
        {PRIORITY_GLYPH}
      </span>
    )
  }

  return <span className={cn(OPTION_MARK_STYLES.dot, tone.dot)} aria-hidden="true" />
}
