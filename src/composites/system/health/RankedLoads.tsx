import { Dotted } from '@/components/elements/display/Dotted'
import { HEALTH_COPY } from '@/declarations/system/monitoring/health'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { formatBytes, formatNumber, formatPercent } from '@/utils/format/numbers'
import type { RankedLoad } from '@/core/services/system/HealthService'

export interface RankedLoadsProps {
  loads: RankedLoad[]
}

/**
 * Heaviest first, each with its share of the list
 * @param {RankedLoad[]} loads - Weights in descending order
 * @return {JSX.Element}
 */

export const RankedLoads = ({ loads }: RankedLoadsProps) => {
  const total = loads.reduce((sum, load) => sum + load.bytes, 0)

  if (loads.length === 0) return <p className={CONSOLE_BLOCK.rowMeta}>{HEALTH_COPY.none}</p>

  return (
    <div className={CONSOLE_BLOCK.rows}>
      {loads.map((load) => (
        <div key={load.label} className={CONSOLE_BLOCK.row}>
          <span className={CONSOLE_BLOCK.rowLabel}>{load.label}</span>
          <span className={CONSOLE_BLOCK.rowMeta}>
            <Dotted
              items={[
                formatBytes(load.bytes),
                total > 0 && formatPercent(load.bytes / total),
                load.rows !== undefined && `${formatNumber(load.rows)} ${HEALTH_COPY.rows}`,
              ]}
            />
          </span>
        </div>
      ))}
    </div>
  )
}
