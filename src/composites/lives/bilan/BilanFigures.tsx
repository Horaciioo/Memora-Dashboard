import { StatCard } from '@/composites/lives/bilan/StatCard'
import type { StatTone } from '@/composites/lives/bilan/StatCard'
import type { BilanFigure, BilanFigureId } from '@/core/lib/lives/bilanFigures'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface BilanFiguresProps {
  figures: BilanFigure[]
}

// Three figures read first, each with its glyph and colour
const HERO: { id: BilanFigureId; icon: IconName; tone: StatTone }[] = [
  { id: 'duration', icon: 'clock', tone: 'brand' },
  { id: 'actions', icon: 'shield', tone: 'info' },
  { id: 'perHour', icon: 'liveDot', tone: 'danger' },
]

// Then who watched, then the team and its rhythm
const AUDIENCE: { id: BilanFigureId; icon: IconName; tone: StatTone }[] = [
  { id: 'peak', icon: 'viewer', tone: 'mauve' },
  { id: 'average', icon: 'viewer', tone: 'info' },
  { id: 'per1000', icon: 'chat', tone: 'success' },
]
const TEAM: { id: BilanFigureId; icon: IconName; tone: StatTone }[] = [
  { id: 'teamTime', icon: 'clock', tone: 'info' },
  { id: 'gap', icon: 'clock', tone: 'caution' },
  { id: 'targets', icon: 'members', tone: 'brand' },
  { id: 'failure', icon: 'warning', tone: 'danger' },
]

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

  const group = (
    title: string,
    specs: { id: BilanFigureId; icon: IconName; tone: StatTone }[],
    row: string
  ) => (
    <section className={LIVE_REPORT.figureGroup}>
      <h3 className={LIVE_REPORT.figureGroupTitle}>{title}</h3>
      <div className={row}>
        {specs.flatMap(({ id, icon, tone }) => {
          const figure = byId.get(id)

          return figure
            ? [
                <StatCard
                  key={id}
                  label={figure.label}
                  value={say(figure.value)}
                  icon={icon}
                  tone={tone}
                />,
              ]
            : []
        })}
      </div>
    </section>
  )

  return (
    <div className={LIVE_REPORT.figures}>
      <div className={LIVE_REPORT.figureHero}>
        {HERO.flatMap(({ id, icon, tone }) => {
          const figure = byId.get(id)

          return figure
            ? [
                <StatCard
                  key={id}
                  label={figure.label}
                  value={say(figure.value)}
                  icon={icon}
                  tone={tone}
                  isHero
                />,
              ]
            : []
        })}
      </div>
      {group(BILAN_COPY.groupAudience, AUDIENCE, LIVE_REPORT.figureRowThree)}
      {group(BILAN_COPY.groupTeam, TEAM, LIVE_REPORT.figureRow)}
    </div>
  )
}
