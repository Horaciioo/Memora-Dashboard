import type { CSSProperties } from 'react'

import { PlayGames } from '@/utils/constants/play'

/**
 * Suspens loading scene, chalk plates swinging from a beam
 * @return {JSX.Element}
 */

export const SuspensLoadScene = () => (
  <div className="relative flex h-40 items-start gap-2 pt-3" aria-hidden="true">
    <span className="absolute -inset-x-3 top-0 h-3 rounded-full bg-[var(--suspens-wood)] shadow-[0_0.25rem_0_var(--play-suspens-deep)]" />
    {PlayGames.Suspens.split('').map((letter, index) => (
      <span
        key={index}
        className="play-suspens-hang flex flex-col items-center"
        style={{ '--tile': index } as CSSProperties}
      >
        <i className="h-9 w-0.5 bg-[var(--suspens-rope)]" />
        <span className="grid size-11 place-items-center rounded-lg bg-[var(--suspens-slate)] text-2xl font-black text-[var(--suspens-chalk)] shadow-[0_0_0_0.15rem_var(--suspens-wood)] sm:size-12">
          {letter}
        </span>
      </span>
    ))}
  </div>
)
