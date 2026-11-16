import { CONCORDAT_GLYPHS, CONCORDAT_WEAPON_GLYPHS } from '@/declarations/play/concordat/glyphs'
import type { ConcordatBuildingKind } from '@/utils/constants/concordat'

export interface ConcordatGlyphProps {
  kind: ConcordatBuildingKind | 'missile' | 'heavy'
  size?: number
}

/**
 * Pictogram of a building or a missile, in the colour of the text
 * @param {ConcordatGlyphProps} props - Kind and size
 * @return {JSX.Element}
 */

export const ConcordatGlyph = ({ kind, size = 22 }: ConcordatGlyphProps) => {
  const weapon = kind === 'missile' || kind === 'heavy' ? CONCORDAT_WEAPON_GLYPHS[kind] : null
  const building = weapon ? null : CONCORDAT_GLYPHS[kind as ConcordatBuildingKind]
  const path = weapon?.path ?? building?.path ?? ''

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform={weapon?.turn ? `rotate(${weapon.turn} 12 12)` : undefined}>
        {building?.isStroke ? (
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path d={path} fill="currentColor" fillRule="evenodd" />
        )}
      </g>
    </svg>
  )
}
