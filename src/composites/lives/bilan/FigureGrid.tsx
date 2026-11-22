import { Section } from '@/components/structures/page/Section'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface FigureItem {
  label: string
  value: string
  // Makes the cell a button
  onClick?: () => void
}

export interface FigureGridProps {
  title?: string
  items: FigureItem[]
  // Grid columns the cells sit in
  columns: string
  // The few big figures read first
  isHero?: boolean
}

/**
 * Figures in one framed panel, split by hairlines
 * @param {string} [title] - Panel title
 * @param {FigureItem[]} items - Figures
 * @param {string} columns - Grid column classes
 * @param {boolean} [isHero] - Bigger numbers
 * @return {JSX.Element}
 */

export const FigureGrid = ({ title, items, columns, isHero = false }: FigureGridProps) => (
  <Section title={title} bare>
    <div className={LIVE_REPORT.figurePanel}>
      <div className={cn(LIVE_REPORT.figureGrid, columns)}>
        {items.map(({ label, value, onClick }) => {
          const content = (
            <>
              <span className={LIVE_REPORT.figureLabel}>{label}</span>
              <span className={cn(LIVE_REPORT.figureValue, isHero && LIVE_REPORT.figureValueHero)}>
                {value}
              </span>
            </>
          )

          return onClick ? (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={cn(LIVE_REPORT.figureCell, LIVE_REPORT.figureCellPickable)}
            >
              {content}
            </button>
          ) : (
            <div key={label} className={LIVE_REPORT.figureCell}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  </Section>
)
