import { CONCORDAT_COIN } from '@/declarations/play/concordat/glyphs'

export interface ConcordatCoinProps {
  size?: number
  title?: string
  className?: string
}

/**
 * Gold coin glyph
 * @param {ConcordatCoinProps} props - Size and label
 * @return {JSX.Element}
 */

export const ConcordatCoin = ({ size = 14, title, className }: ConcordatCoinProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    className={className ?? 'shrink-0'}
  >
    {title && <title>{title}</title>}
    <circle cx={12} cy={12} r={10.5} fill={CONCORDAT_COIN.rim} />
    <circle cx={12} cy={12} r={8.6} fill={CONCORDAT_COIN.fill} />
    <path
      d="M6.2 9.2 A7 7 0 0 1 14 5.2"
      fill="none"
      stroke={CONCORDAT_COIN.shine}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <path d={CONCORDAT_COIN.mark} fill={CONCORDAT_COIN.rim} />
  </svg>
)
