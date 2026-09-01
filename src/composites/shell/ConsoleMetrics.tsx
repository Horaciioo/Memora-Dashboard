import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { formatNumber } from '@/utils/format/numbers'

/**
 * One counted figure
 * @typedef {Object} ConsoleMetric
 * @property {string} label - What is counted
 * @property {number} value - Count
 * @property {string} [hint] - Supporting line
 */

export interface ConsoleMetric {
  label: string
  value: number
  hint?: string
}

export interface ConsoleMetricsProps {
  metrics: ConsoleMetric[]
}

/**
 * Counted figures
 * @param {ConsoleMetric[]} metrics - Figures in display order
 * @return {JSX.Element}
 */

export const ConsoleMetrics = ({ metrics }: ConsoleMetricsProps) => (
  <div className={CONSOLE_BLOCK.grid}>
    {metrics.map((metric) => (
      <div key={metric.label} className={CONSOLE_BLOCK.tile}>
        <span className={CONSOLE_BLOCK.tileLabel}>{metric.label}</span>
        <span className={CONSOLE_BLOCK.tileValue}>{formatNumber(metric.value)}</span>
        {metric.hint && <span className={CONSOLE_BLOCK.tileHint}>{metric.hint}</span>}
      </div>
    ))}
  </div>
)
