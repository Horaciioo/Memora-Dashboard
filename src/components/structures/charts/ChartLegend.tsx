import { CHART } from '@/declarations/ui/variants'

export interface ChartLegendProps {
  items: { label: string; colour: string }[]
}

/**
 * Key of a chart
 * @param {{ label: string, colour: string }[]} items - Series
 * @return {JSX.Element}
 */

export const ChartLegend = ({ items }: ChartLegendProps) => (
  <ul className={CHART.legend}>
    {items.map((item) => (
      <li key={item.label} className={CHART.legendItem}>
        <span
          className={CHART.swatch}
          style={{ backgroundColor: item.colour }}
          aria-hidden="true"
        />
        {item.label}
      </li>
    ))}
  </ul>
)
