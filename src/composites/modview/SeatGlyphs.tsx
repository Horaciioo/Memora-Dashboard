import { ROLE_EMBLEMS, roleTone } from '@/declarations/members/profiles'
import type { SeatEmblem } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface SeatGlyphsProps {
  emblem: SeatEmblem
  className?: string
  glyphClassName?: string
}

/**
 * Role glyph of a member, tinted by the main function
 * @param {SeatGlyphsProps} props - Glyph props
 * @return {JSX.Element}
 */

export const SeatGlyphs = ({ emblem, className, glyphClassName }: SeatGlyphsProps) => {
  const RoleGlyph = ROLE_EMBLEMS[emblem.role].glyph

  return (
    <span className={cn('inline-flex shrink-0 items-center', className)}>
      <RoleGlyph className={cn('shrink-0', glyphClassName)} tone={roleTone(emblem)} />
    </span>
  )
}
