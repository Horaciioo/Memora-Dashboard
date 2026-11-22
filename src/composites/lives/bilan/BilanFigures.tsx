import { FigureGrid } from '@/composites/lives/bilan/FigureGrid'
import type { BilanFigure, BilanFigureId } from '@/core/lib/lives/bilanFigures'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface BilanFiguresProps {
  figures: BilanFigure[]
}

// Three figures read first, then who watched, then the team and its rhythm
const HERO: BilanFigureId[] = ['duration', 'actions', 'perHour']
const AUDIENCE: BilanFigureId[] = ['peak', 'average', 'per1000']
const TEAM: BilanFigureId[] = ['teamTime', 'gap', 'targets', 'failure']

// Thousands read with a space
const say = (value: string): string =>
  /^\d{4,}$/.test(value) ? Number(value).toLocaleString('fr-FR') : value

/**
 * Key figures: the big three, the audience, then the team
 * @param {BilanFigure[]} figures - Figures
 * @return {JSX.Element}
 */

export const BilanFigures = ({ figures }: BilanFiguresProps) => {
  const byId = new Map(figures.map((figure) => [figure.id, figure]))

  const items = (ids: BilanFigureId[]) =>
    ids.flatMap((id) => {
      const figure = byId.get(id)

      return figure ? [{ label: figure.label, value: say(figure.value) }] : []
    })

  return (
    <div className={LIVE_REPORT.figures}>
      <FigureGrid items={items(HERO)} columns={LIVE_REPORT.figureHero} isHero />
      <FigureGrid
        title={BILAN_COPY.groupAudience}
        items={items(AUDIENCE)}
        columns={LIVE_REPORT.figureRowThree}
      />
      <FigureGrid
        title={BILAN_COPY.groupTeam}
        items={items(TEAM)}
        columns={LIVE_REPORT.figureRow}
      />
    </div>
  )
}
