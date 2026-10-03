import { Avatar } from '@/components/elements/display/Avatar'
import { DivisionLogo } from '@/components/elements/display/DivisionLogo'
import { NetworkLogo, hasNetworkLogo } from '@/components/elements/display/NetworkLogo'
import { PRIORITY_GLYPH } from '@/declarations/ui/copy'
import { ICONS, isIconName } from '@/declarations/ui/icons'
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
 * @return {JSX.Element | null}
 */

export const OptionMark = ({ mark, option, size = 'xs' }: OptionMarkProps) => {
  // A portrait carries its own colour, the other two borrow the option accent
  if (mark === 'avatar') {
    return <Avatar name={option.label} src={option.image} size={size} />
  }

  // Official logo of a division, nothing for the entry level
  if (mark === 'division') {
    return <DivisionLogo label={option.label} src={option.image} className="h-5 w-5" />
  }

  // Official logo of a network, its portrait when it has none
  if (mark === 'network') {
    return hasNetworkLogo(option.label) ? (
      <NetworkLogo network={option.label} className="h-5 w-5" />
    ) : (
      <Avatar name={option.label} src={option.image} size={size} />
    )
  }

  // Project glyph, nothing when unset
  if (mark === 'emoji') {
    return option.emoji ? (
      <span className={OPTION_MARK_STYLES.emoji} aria-hidden="true">
        {option.emoji}
      </span>
    ) : null
  }

  // A dot gives way to the glyph an option names, so every choice with a shape shows it
  const glyphName = option.icon && isIconName(option.icon) ? option.icon : null
  if (glyphName && (mark === 'glyph' || mark === 'dot')) {
    const Glyph = ICONS[glyphName]
    const paint = isHexColour(option.accent)
      ? ACCENT_STYLES
      : TONES[toTone(option.accent, 'neutral')]

    return (
      <span
        className={cn('inline-flex', paint.text)}
        style={isHexColour(option.accent) ? accentVars(option.accent, 'neutral') : undefined}
      >
        <Glyph className={OPTION_MARK_STYLES.glyph} aria-hidden="true" />
      </span>
    )
  }

  if (mark === 'glyph') return null

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
