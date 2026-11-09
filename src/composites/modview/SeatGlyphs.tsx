import { ROLE_EMBLEMS, functionGlyph, roleTone } from '@/declarations/members/profiles'
import type { SeatEmblem } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface SeatGlyphsProps {
  emblem: SeatEmblem
  className?: string
  glyphClassName?: string
}

/**
 * Real glyphs of a member: the role tinted by the main function, then each function held
 * @param {SeatGlyphsProps} props - Glyph props
 * @return {JSX.Element}
 */

export const SeatGlyphs = ({ emblem, className, glyphClassName }: SeatGlyphsProps) => {
  const RoleGlyph = ROLE_EMBLEMS[emblem.role].glyph

  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1', className)}>
      <RoleGlyph className={cn('shrink-0', glyphClassName)} tone={roleTone(emblem)} />
      {emblem.functions.map((entry) => {
        const FunctionGlyph = functionGlyph(entry)

        return FunctionGlyph ? (
          <FunctionGlyph
            key={entry.icon}
            className={cn('shrink-0', glyphClassName)}
            aria-hidden="true"
          />
        ) : null
      })}
    </span>
  )
}
