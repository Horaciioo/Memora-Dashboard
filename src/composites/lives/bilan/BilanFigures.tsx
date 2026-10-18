import type { BilanFigure } from '@/core/lib/lives/bilanFigures'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface BilanFiguresProps {
  figures: BilanFigure[]
}

/**
 * Key figures
 * @param {BilanFigure[]} figures - Figures
 * @return {JSX.Element}
 */

export const BilanFigures = ({ figures }: BilanFiguresProps) => (
  <div className={LIVE_REPORT.figures}>
    {figures.map((figure) => (
      <div key={figure.label} className={LIVE_REPORT.figure}>
        <span className={LIVE_REPORT.figureLabel}>{figure.label}</span>
        <span className={LIVE_REPORT.figureValue}>{figure.value}</span>
      </div>
    ))}
  </div>
)
