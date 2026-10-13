import { ICONS, isIconName } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { SESSION_HERO } from '@/declarations/ui/variants'

export interface FunctionMarkProps {
  // Glyph key of the function
  icon?: string | null
  accent?: string | null
}

/**
 * Glyph of a function on its tinted square
 * @param {string | null} [icon] - Glyph key
 * @param {string | null} [accent] - Colour token
 * @return {JSX.Element}
 */

export const FunctionMark = ({ icon, accent }: FunctionMarkProps) => {
  const Glyph = icon && isIconName(icon) ? ICONS[icon] : ICONS.sheet

  return (
    <span className={SESSION_HERO.mark} style={accentVars(accent)}>
      <Glyph className={SESSION_HERO.markGlyph} aria-hidden="true" />
    </span>
  )
}
