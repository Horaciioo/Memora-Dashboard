import type { CSSProperties } from 'react'

import { PLAY_CELEBRATION, PLAY_CELEBRATION_COPY } from '@/declarations/play'
import { PLAY_CELEBRATION_UI } from '@/declarations/ui/variants'

const WAVES = Array.from({ length: PLAY_CELEBRATION.waves }, (_, index) => index)

/**
 * Level reached: shockwaves leave the number as it lands
 * @param {Object} props - Level
 * @param {number} props.level - Level reached
 * @return {JSX.Element}
 */

export const PlayCelebrationLevel = ({ level }: { level: number }) => (
  <div className={PLAY_CELEBRATION_UI.scene}>
    <span className={PLAY_CELEBRATION_UI.kicker}>{PLAY_CELEBRATION_COPY.level}</span>
    <div className={PLAY_CELEBRATION_UI.stage}>
      {WAVES.map((wave) => (
        <i
          key={wave}
          className={PLAY_CELEBRATION_UI.wave}
          style={{ '--i': wave } as CSSProperties}
        />
      ))}
      <span className={PLAY_CELEBRATION_UI.number}>{level}</span>
    </div>
  </div>
)
