import type { CSSProperties } from 'react'

import { PlayGames } from '@/utils/constants/play'

// Scrambled order of the word, each tile leans its own way
const TILTS = [-9, 6, -4, 10, -7, 5]

/**
 * Jumble loading scene, scrambled tiles hopping in turn
 * @return {JSX.Element}
 */

export const JumbleLoadScene = () => (
  <div className="flex h-36 items-end gap-2" aria-hidden="true">
    {PlayGames.Jumble.split('').map((letter, index) => (
      <span
        key={index}
        className="play-scene-tile grid size-11 place-items-center rounded-xl bg-white text-2xl font-black text-black/70 shadow-lg sm:size-12"
        style={{ '--tile': index, '--tilt': `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
      >
        {letter}
      </span>
    ))}
  </div>
)
