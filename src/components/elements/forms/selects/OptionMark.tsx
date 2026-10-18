import { Avatar } from '@/components/elements/display/Avatar'
import { CountryFlag } from '@/components/elements/display/marks/CountryFlag'
import { DivisionLogo } from '@/components/elements/display/marks/DivisionLogo'
import { NetworkLogo, hasNetworkLogo } from '@/components/elements/display/marks/NetworkLogo'
import { ROLE_EMBLEMS } from '@/declarations/members/profiles'
import { PRIORITY_GLYPH } from '@/declarations/ui/copy'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { ACCENT_STYLES, TONES, accentVars, toTone } from '@/declarations/ui/theme'
import { OPTION_MARK_STYLES } from '@/declarations/ui/variants'
import type { AvatarSize } from '@/declarations/ui/variants/surfaces'
import type { FieldOption, OptionMark as OptionMarkKind } from '@/types/forms'
import { cn } from '@/utils/classnames'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { isHexColour } from '@/utils/format/colour'

export interface OptionMarkProps {
  mark: OptionMarkKind
  option: FieldOption
  size?: AvatarSize
}

/**
 * Glyph drawn before an option label
 * @param {OptionMarkKind} mark - Glyph shape to draw
 * @param {FieldOption} option - Option carrying the accent and the portrait
 * @param {AvatarSize} [size] - Portrait size
 * @return {JSX.Element | null}
 */

export const OptionMark = ({ mark, option, size = 'xs' }: OptionMarkProps) => {
  // A portrait carries its own colour
  if (mark === 'avatar') {
    return <Avatar name={option.label} src={option.image} size={size} />
  }

  // Emblem of a hierarchy level
  if (mark === 'role') {
    const Emblem = ROLE_EMBLEMS[option.value as MemberRoleName]?.glyph

    return Emblem ? <Emblem className="h-6 w-6 shrink-0" /> : null
  }

  // Official logo of a division
  if (mark === 'division') {
    return <DivisionLogo label={option.label} src={option.image} className="h-5 w-5" />
  }

  // Official logo of a network
  if (mark === 'network') {
    return hasNetworkLogo(option.label) ? (
      <NetworkLogo network={option.label} className="h-5 w-5" />
    ) : (
      <Avatar name={option.label} src={option.image} size={size} />
    )
  }

  // Flag of a country
  if (mark === 'flag') {
    return option.flag ? <CountryFlag country={option.flag} /> : null
  }

  // Project glyph
  if (mark === 'emoji') {
    return option.emoji ? (
      <span className={OPTION_MARK_STYLES.emoji} aria-hidden="true">
        {option.emoji}
      </span>
    ) : null
  }

  // A dot gives way to the glyph an option names
  const glyphName =
    option.icon && isIconName(option.icon) ? option.icon : mark === 'dot' ? 'statusDot' : null
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

  // Only the priority mark is left
  if (mark !== 'priority') return null

  const picked = isHexColour(option.accent)
  const styles = picked ? ACCENT_STYLES : TONES[toTone(option.accent, 'warning')]

  return (
    <span
      className={cn(OPTION_MARK_STYLES.priority, styles.text)}
      style={picked ? accentVars(option.accent, 'warning') : undefined}
      aria-hidden="true"
    >
      {PRIORITY_GLYPH}
    </span>
  )
}
