import type { CSSProperties } from 'react'

import { fillPlayMessage, PLAY_CELEBRATION, PLAY_CELEBRATION_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CELEBRATION_UI } from '@/declarations/ui/variants'

const SPARKS = Array.from({ length: PLAY_CELEBRATION.sparks }, (_, index) => index)
const RINGS = [0, 1]
const FULL_TURN = 360

/**
 * Quest done: a gold seal stamps in, rings and sparks leave it
 * @param {Object} props - Quest
 * @param {number} props.xp - XP paid
 * @return {JSX.Element}
 */

export const PlayCelebrationQuest = ({ xp }: { xp: number }) => {
  const Check = ICONS.check

  return (
    <div className={PLAY_CELEBRATION_UI.scene}>
      <div className={PLAY_CELEBRATION_UI.stage}>
        {RINGS.map((ring) => (
          <i
            key={ring}
            className={PLAY_CELEBRATION_UI.ring}
            style={{ '--i': ring } as CSSProperties}
          />
        ))}
        <div className={PLAY_CELEBRATION_UI.sparkBox}>
          {SPARKS.map((spark) => (
            <i
              key={spark}
              className={PLAY_CELEBRATION_UI.spark}
              style={{ '--a': `${(spark * FULL_TURN) / SPARKS.length}deg` } as CSSProperties}
            />
          ))}
        </div>
        <span className={PLAY_CELEBRATION_UI.seal}>
          <Check className={PLAY_CELEBRATION_UI.sealGlyph} aria-hidden="true" />
        </span>
      </div>
      <span className={PLAY_CELEBRATION_UI.kicker}>{PLAY_CELEBRATION_COPY.quest}</span>
      <span className={PLAY_CELEBRATION_UI.name}>
        {fillPlayMessage(PLAY_CELEBRATION_COPY.questXp, { xp })}
      </span>
    </div>
  )
}
