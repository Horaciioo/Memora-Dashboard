import type { CSSProperties } from 'react'

import type { NavalPlaying } from '@/composites/play/naval/useNavalPlayback'
import { NAVAL_SETTINGS } from '@/declarations/play/naval/settings'

// Sparks thrown by a blast, angles in degrees
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315]

/**
 * Shell in flight, then the blast or the splash on the square
 * @param {Object} props - Shot on screen
 * @param {NavalPlaying} props.playing - Shot
 * @return {JSX.Element}
 */

export const NavalEffects = ({ playing }: { playing: NavalPlaying }) => {
  const { shot, stage } = playing
  const place = {
    '--x': shot.x,
    '--y': shot.y,
    '--flight': `${NAVAL_SETTINGS.flightMs}ms`,
    '--impact': `${NAVAL_SETTINGS.impactMs}ms`,
    '--lean': shot.x % 2 ? 1 : -1,
  } as CSSProperties

  if (stage === 'flight') {
    return (
      <div style={place} key={`flight-${shot.rev}`}>
        <span className="naval-lock" />
        <span className="naval-shell" />
      </div>
    )
  }
  const span = shot.code === 2 ? 2.4 : 1.4

  return (
    <div style={place} key={`impact-${shot.rev}`}>
      {shot.code === 0 ? (
        <span className="naval-splash">
          <span className="naval-geyser" />
        </span>
      ) : (
        <span className="naval-blast" style={{ '--span': span } as CSSProperties}>
          {SPARKS.map((angle) => (
            <i
              key={angle}
              className="naval-spark"
              style={{ '--angle': `${angle}deg` } as CSSProperties}
            />
          ))}
        </span>
      )}
    </div>
  )
}
