import type { ReactNode } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import { PLAY_CONCEPT_SCENES as SCENES, PlayConceptClips } from '@/declarations/play/concept'
import type { PlayConceptClip } from '@/declarations/play/concept'

// Seconds between two typed rows
const ROW_DELAY = 0.9

// Seconds between two typed letters
const KEY_DELAY = 0.28

/**
 * Bac: a letter spinning then landing
 * @return {JSX.Element}
 */

const BacLetter = () => (
  <div className="cc-center">
    <span className="cc-tile cc-letter-spin">{SCENES.bacLetter}</span>
  </div>
)

/**
 * Bac: categories filled one after the other
 * @return {JSX.Element}
 */

const BacWrite = () => (
  <div className="cc-rows">
    {SCENES.bacRows.map(([label, word], index) => (
      <div key={label} className="cc-row">
        <span className="cc-row-label">{label}</span>
        <span className="cc-row-field">
          <span className="cc-typed" style={{ animationDelay: `${index * ROW_DELAY}s` }}>
            {word}
          </span>
        </span>
      </div>
    ))}
  </div>
)

/**
 * Bac: stop stamped, points counted
 * @return {JSX.Element}
 */

const BacStop = () => (
  <div className="cc-center">
    <span className="cc-stamp">{SCENES.bacStop}</span>
    <span className="cc-points">{SCENES.bacPoints}</span>
  </div>
)

/**
 * Bomb: syllable popping on the bomb
 * @return {JSX.Element}
 */

const BombSyllable = () => (
  <div className="cc-center">
    <span className="cc-bomb cc-bomb-shake">
      <span className="cc-fuse" />
    </span>
    <span className="cc-syllable">{SCENES.bombSyllable}</span>
  </div>
)

/**
 * Bomb: a word typed, the syllable lit
 * @return {JSX.Element}
 */

const BombType = () => (
  <div className="cc-center">
    <span className="cc-word">
      {[...SCENES.bombWord].map((letter, index) => (
        <span
          key={index}
          className={
            (SCENES.bombLit as readonly number[]).includes(index) ? 'cc-key cc-key-lit' : 'cc-key'
          }
          style={{ animationDelay: `${index * KEY_DELAY}s` }}
        >
          {letter}
        </span>
      ))}
    </span>
  </div>
)

/**
 * Bomb: passed around three players, then the blast
 * @return {JSX.Element}
 */

const BombPass = () => (
  <div className="cc-ring">
    {SCENES.bombSeats.map((name, index) => (
      <span key={name} className={`cc-seat cc-seat-${index}`}>
        {name}
      </span>
    ))}
    <span className="cc-bomb cc-bomb-small cc-bomb-pass">
      <span className="cc-fuse" />
    </span>
  </div>
)

/**
 * Golf: ball pulled back, the arrow growing
 * @return {JSX.Element}
 */

const GolfAim = () => (
  <div className="cc-green">
    <span className="cc-hole" />
    <span className="cc-ball cc-ball-aim" />
    <span className="cc-arrow" />
  </div>
)

/**
 * Golf: shot rolling into the cup
 * @return {JSX.Element}
 */

const GolfShot = () => (
  <div className="cc-green">
    <span className="cc-hole" />
    <span className="cc-ball cc-ball-shot" />
    <span className="cc-flag" />
  </div>
)

/**
 * Golf: orb picked, power in hand
 * @return {JSX.Element}
 */

const GolfPower = () => {
  const PowerIcon = ICONS.golfTornado

  return (
    <div className="cc-green">
      <span className="cc-orb" />
      <span className="cc-ball cc-ball-orb" />
      <span className="cc-power">
        <PowerIcon className="size-6" aria-hidden="true" />
      </span>
    </div>
  )
}

/**
 * Ludo: die tumbling to a six
 * @return {JSX.Element}
 */

const LudoRoll = () => (
  <div className="cc-center">
    <span className="cc-die cc-die-roll">
      {Array.from({ length: 6 }, (_, index) => (
        <span key={index} className="cc-pip" />
      ))}
    </span>
  </div>
)

/**
 * Ludo: pawn hopping along squares, knocking another home
 * @return {JSX.Element}
 */

const LudoMove = () => (
  <div className="cc-track">
    {Array.from({ length: SCENES.ludoSquares }, (_, index) => (
      <span key={index} className="cc-square" />
    ))}
    <span className="cc-pawn cc-pawn-hop" />
    <span className="cc-pawn cc-pawn-foe" />
  </div>
)

/**
 * Ludo: pawn reaching the centre, crowned
 * @return {JSX.Element}
 */

const LudoHome = () => {
  const CrownIcon = ICONS.playCrown

  return (
    <div className="cc-center">
      <span className="cc-home" />
      <span className="cc-pawn cc-pawn-home" />
      <span className="cc-crown">
        <CrownIcon className="size-8" aria-hidden="true" />
      </span>
    </div>
  )
}

/**
 * Scene drawn by each clip
 * @type {Record<PlayConceptClip, () => ReactNode>}
 */

export const CONCEPT_CLIPS: Record<PlayConceptClip, () => ReactNode> = {
  [PlayConceptClips.BacLetter]: BacLetter,
  [PlayConceptClips.BacWrite]: BacWrite,
  [PlayConceptClips.BacStop]: BacStop,
  [PlayConceptClips.BombSyllable]: BombSyllable,
  [PlayConceptClips.BombType]: BombType,
  [PlayConceptClips.BombPass]: BombPass,
  [PlayConceptClips.GolfAim]: GolfAim,
  [PlayConceptClips.GolfShot]: GolfShot,
  [PlayConceptClips.GolfPower]: GolfPower,
  [PlayConceptClips.LudoRoll]: LudoRoll,
  [PlayConceptClips.LudoMove]: LudoMove,
  [PlayConceptClips.LudoHome]: LudoHome,
}
