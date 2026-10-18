import type { AudienceShare } from '@/core/services/system/AudienceService'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { DAILY_BARS_STYLES } from '@/declarations/ui/variants'

export interface ShareListProps {
  shares: AudienceShare[]
  unit?: string
}

/**
 * Labels with their weight
 * @param {AudienceShare[]} shares - Counted labels
 * @param {string} [unit] - Word after each count
 * @return {JSX.Element}
 */

export const ShareList = ({ shares, unit }: ShareListProps) => {
  const total = Math.max(1, ...shares.map((entry) => entry.count))

  return (
    <div className={CONSOLE_BLOCK.rows}>
      {shares.map((entry) => (
        <div key={entry.label} className={DAILY_BARS_STYLES.share}>
          <span className="min-w-0 truncate">{entry.label}</span>
          <span className="flex items-center gap-3">
            <span className={DAILY_BARS_STYLES.track}>
              <span
                className={DAILY_BARS_STYLES.fill}
                style={{ width: `${(entry.count / total) * 100}%`, display: 'block' }}
              />
            </span>
            <span className={CONSOLE_BLOCK.rowMeta}>
              {unit ? `${entry.count} ${unit}` : entry.count}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}
