import { ConcordatCoin } from '@/composites/play/concordat/hud/ConcordatCoin'
import { compactFigure } from '@/core/lib/play/concordat/view/ranking'
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
    {compactFigure(amount)}
    <ConcordatCoin title={CONCORDAT_HUD_COPY.gold} />
  </span>
)
