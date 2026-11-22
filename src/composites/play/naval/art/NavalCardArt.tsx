import { NavalHull, NavalRose, NavalSea } from '@/composites/play/naval/art/navalChart'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { NAVAL_BANNER } from '@/declarations/play/naval/banner'

/**
 * Game card of Bataille navale, the chart frozen mid sweep
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const NavalCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const chart = NAVAL_BANNER.frames[frame]
  const { x, y } = chart.rose
  const id = `naval-${frame}`

  return (
    <>
      <defs>
        <linearGradient id={`${id}-trace`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--naval-sonar)' }} stopOpacity="0.4" />
          <stop offset="1" style={{ stopColor: 'var(--naval-sonar)' }} stopOpacity="0" />
        </linearGradient>
      </defs>
      <NavalSea {...GAME_ART_FRAMES[frame]} scale={0.6} />
      <NavalRose {...chart} />
      <path
        d={`M${x} ${y}L${x + chart.reach} ${y}A${chart.reach} ${chart.reach} 0 0 0 ${x + chart.reach * Math.cos(-0.7)} ${y + chart.reach * Math.sin(-0.7)}Z`}
        fill={`url(#${id}-trace)`}
        transform={`rotate(-40 ${x} ${y})`}
      />
      {chart.ships.map((ship) => (
        <NavalHull key={`${ship.x}-${ship.y}`} ship={ship} scale={0.7} />
      ))}
    </>
  )
}
