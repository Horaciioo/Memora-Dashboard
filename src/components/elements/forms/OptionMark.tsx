import { Avatar } from '@/components/elements/display/Avatar'
import { PRIORITY_GLYPH } from '@/declarations/ui/copy'
import { ACCENT_STYLES, TONES, accentVars, toTone } from '@/declarations/ui/theme'
import { OPTION_MARK_STYLES } from '@/declarations/ui/variants'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'
import { isHexColour } from '@/utils/format/colour'

export interface OptionMarkProps {
  mark: OptionMarkKind
  option: FieldOption
  size?: AvatarSize
}

/**
 * Glyph drawn before an option label, so a choice reads by shape as well as by name
 * @param {OptionMarkKind} mark - Glyph shape to draw
 * @param {FieldOption} option - Option carrying the accent and the portrait
 * @param {AvatarSize} [size] - Portrait size, defaults to xs
 * @return {JSX.Element}
 */

export const OptionMark = ({ mark, option, size = 'xs' }: OptionMarkProps) => {
  // A portrait carries its own colour, the other two borrow the option accent
  if (mark === 'avatar') {
    return <Avatar name={option.label} src={option.image} size={size} />
  }

  const fallback = mark === 'priority' ? 'warning' : 'neutral'
  const picked = isHexColour(option.accent)
  const styles = picked ? ACCENT_STYLES : TONES[toTone(option.accent, fallback)]
  const style = picked ? accentVars(option.accent, fallback) : undefined

  if (mark === 'priority') {
    return (
      <span
        className={cn(OPTION_MARK_STYLES.priority, styles.text)}
        style={style}
        aria-hidden="true"
      >
        {PRIORITY_GLYPH}
      </span>
    )
  }

  return (
    <span className={cn(OPTION_MARK_STYLES.dot, styles.dot)} style={style} aria-hidden="true" />
  )
}
