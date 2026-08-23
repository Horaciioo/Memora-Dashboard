export interface FiltersGlyphProps {
  className?: string
}

/**
 * Three left-aligned rules of decreasing length, standing for the folded filter panel
 * @param {string} [className] - Extra classes merged onto the glyph
 * @return {JSX.Element}
 */

export const FiltersGlyph = ({ className }: FiltersGlyphProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="2" y1="4" x2="8" y2="4" />
    <line x1="2" y1="8" x2="14" y2="8" />
    <line x1="2" y1="12" x2="14" y2="12" />
  </svg>
)
