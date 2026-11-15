import type { CSSProperties } from 'react'

import { PlayGames } from '@/utils/constants/play'

// Each sticky note leans its own way
const TILTS = [-8, 5, -3, 9, -6, 4, -10]

/**
 * Croquis loading scene, sticky notes hopping in turn
 * @return {JSX.Element}
 */

export const CroquisLoadScene = () => (
  <div className="flex h-36 items-end gap-2" aria-hidden="true">
    {PlayGames.Croquis.split('').map((letter, index) => (
      <span
        key={index}
        className="play-scene-tile grid size-11 place-items-center rounded-md bg-[#ffd25a] text-2xl font-black text-[#3a2503] shadow-lg sm:size-12"
        style={{ '--tile': index, '--tilt': `${TILTS[index % TILTS.length]}deg` } as CSSProperties}
      >
        {letter}
      </span>
    ))}
  </div>
)
