import type { CSSProperties } from 'react'

import { GROUND_FINISH } from '@/declarations/play/groundFinish'
import { PLAY_HUB } from '@/declarations/ui/variants'

/**
 * Print finish over a hub banner: lit corner, vignette and grain, so the vector reads as a made piece
 * @param {Object} props - Finish
 * @param {string} props.ground - Ground class of the game
 * @return {JSX.Element | null}
 */

export const PlayGroundFinish = ({ ground }: { ground: string }) => {
  const finish = GROUND_FINISH[ground]
  if (!finish) return null
  const { grain, vignette, light } = finish

  return (
    <div
      className={PLAY_HUB.groundFinish}
      aria-hidden="true"
      style={
        {
          '--finish-grain': grain,
          '--finish-vignette': vignette,
          '--finish-x': `${light.x}%`,
          '--finish-y': `${light.y}%`,
          '--finish-light': light.color,
          '--finish-share': light.share,
        } as CSSProperties
      }
    >
      <span className={PLAY_HUB.groundLight} />
      <span className={PLAY_HUB.groundVignette} />
      <span className={PLAY_HUB.groundGrain} />
    </div>
  )
}
