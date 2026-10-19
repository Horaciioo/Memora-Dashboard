import { StatCard } from '@/composites/lives/bilan/StatCard'
import type { StatTone } from '@/composites/lives/bilan/StatCard'
import type { IconName } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface FigureCardsProps {
  title: string
  items: {
    label: string
    value: string
    icon: IconName
    tone: StatTone
    onClick?: () => void
  }[]
  // Grid the cards sit in
  row: string
}

/**
 * Titled row of stat cards
 * @param {string} title - Group title
 * @param {{ label: string, value: string, icon: IconName, tone: StatTone, onClick?: () => void }[]} items - Figures
 * @param {string} row - Grid classes
 * @return {JSX.Element}
 */

export const FigureCards = ({ title, items, row }: FigureCardsProps) => (
  <section className={LIVE_REPORT.figureGroup}>
    <h3 className={LIVE_REPORT.figureGroupTitle}>{title}</h3>
    <div className={row}>
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  </section>
)
