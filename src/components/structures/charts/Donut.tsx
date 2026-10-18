import { CHART } from '@/declarations/ui/variants'

export interface DonutPart {
  label: string
  value: number
  colour: string
}

export interface DonutProps {
  parts: DonutPart[]
  title: string
  // Words under the centre figure
  centreLabel: string
}

// Ring geometry
const RADIUS = 15.9155
const FULL = 100
// Gap kept between two parts
const GAP = 0.8

/**
 * Share of each part around a ring
 * @param {DonutPart[]} parts - Parts
 * @param {string} title - Spoken name
 * @param {string} centreLabel - Label under the total
 * @return {JSX.Element}
 */

export const Donut = ({ parts, title, centreLabel }: DonutProps) => {
  const total = parts.reduce((sum, part) => sum + part.value, 0)
  let offset = 0

  return (
    <div className={CHART.donut}>
      <div className="relative shrink-0">
        <svg className={CHART.donutSvg} viewBox="0 0 36 36" role="img" aria-label={title}>
          <circle
            cx="18"
            cy="18"
            r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="4"
          />
          {total > 0 &&
            parts
              .filter((part) => part.value > 0)
              .map((part) => {
                const share = (part.value / total) * FULL
                const dash = Math.max(share - (parts.length > 1 ? GAP : 0), 0.1)
                const circle = (
                  <circle
                    key={part.label}
                    cx="18"
                    cy="18"
                    r={RADIUS}
                    fill="none"
                    stroke={part.colour}
                    strokeWidth="4"
                    strokeDasharray={`${dash} ${FULL - dash}`}
                    strokeDashoffset={-offset}
                  />
                )
                offset += share

                return circle
              })}
        </svg>
        <div className={CHART.donutCentre}>
          <span className={CHART.donutValue}>{total}</span>
          <span className={CHART.donutLabel}>{centreLabel}</span>
        </div>
      </div>
      <ul className={CHART.donutList}>
        {parts.map((part) => (
          <li key={part.label} className={CHART.donutRow}>
            <span
              className={CHART.swatch}
              style={{ backgroundColor: part.colour }}
              aria-hidden="true"
            />
            <span className={CHART.donutName}>{part.label}</span>
            <span className={CHART.donutNumber}>{part.value}</span>
            <span className={CHART.donutShare}>
              {total > 0 ? `${Math.round((part.value / total) * 100)} %` : '–'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
