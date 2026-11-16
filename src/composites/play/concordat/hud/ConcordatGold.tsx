import { CONCORDAT_STAT_GLYPHS } from '@/declarations/play/concordat/glyphs'
import { CONCORDAT_HUD_COPY } from '@/declarations/play/concordat/hudCopy'

export interface ConcordatGoldProps {
  amount: number
  // Shown before the figure, such as a plus
  prefix?: string
  className?: string
}

/**
 * Gold amount, the figure then the coin glyph
 * @param {ConcordatGoldProps} props - Amount
 * @return {JSX.Element}
 */

export const ConcordatGold = ({ amount, prefix = '', className }: ConcordatGoldProps) => (
  <span className={className ?? 'inline-flex items-center gap-1 tabular-nums'}>
    {prefix}
    {amount}
    <svg width={14} height={14} viewBox="0 0 24 24" role="img" aria-label={CONCORDAT_HUD_COPY.gold}>
      <title>{CONCORDAT_HUD_COPY.gold}</title>
      <path d={CONCORDAT_STAT_GLYPHS.gold} fill="currentColor" fillRule="evenodd" />
    </svg>
  </span>
)
