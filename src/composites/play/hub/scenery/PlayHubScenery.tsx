import { SCENERY_SETS } from '@/composites/play/hub/scenery/sets'
import { PLAY_HUB } from '@/declarations/ui/variants'

export interface PlayHubSceneryProps {
  // Set key, also the tone suffix
  set: 'stopgo'
}

/**
 * Painted ground of a game hub: the set at the corners over the room gradient
 * @param {PlayHubSceneryProps} props - Set
 * @return {JSX.Element}
 */

export const PlayHubScenery = ({ set }: PlayHubSceneryProps) => {
  const { near, top } = SCENERY_SETS[set]

  const ground = (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className={PLAY_HUB.scenery}
      aria-hidden="true"
    >
      <defs>
        <filter id={`play-scenery-near-${set}`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="black" floodOpacity="0.45" />
        </filter>
      </defs>
      <g filter={`url(#play-scenery-near-${set})`}>{near}</g>
    </svg>
  )
  if (!top) return ground

  return (
    <>
      {ground}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMin slice"
        className={PLAY_HUB.scenery}
        aria-hidden="true"
      >
        <g filter={`url(#play-scenery-near-${set})`}>{top}</g>
      </svg>
    </>
  )
}
