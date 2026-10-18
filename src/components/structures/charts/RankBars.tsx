import { CHART } from '@/declarations/ui/variants'

export interface RankRow {
  label: string
  value: number
  colour?: string
  // Small line under the label
  detail?: string
}

export interface RankBarsProps {
  rows: RankRow[]
  empty: string
}

/**
 * Horizontal bars, longest first
 * @param {RankRow[]} rows - Rows
 * @param {string} empty - Said without rows
 * @return {JSX.Element}
 */

export const RankBars = ({ rows, empty }: RankBarsProps) => {
  if (rows.length === 0) return <p className={CHART.empty}>{empty}</p>
  const peak = Math.max(1, ...rows.map((row) => row.value))

  return (
    <ul className={CHART.ranks}>
      {rows.map((row) => (
        <li key={row.label} className={CHART.rank}>
          <span className={CHART.rankName} title={row.label}>
            {row.label}
            {row.detail && <span className={CHART.rankDetail}>{row.detail}</span>}
          </span>
          <span className={CHART.rankTrack}>
            <span
              className={CHART.rankFill}
              style={{
                width: `${(row.value / peak) * 100}%`,
                backgroundColor: row.colour ?? 'var(--color-brand-600)',
              }}
            />
          </span>
          <span className={CHART.rankValue}>{row.value}</span>
        </li>
      ))}
    </ul>
  )
}
