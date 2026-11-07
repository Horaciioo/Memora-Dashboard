import { effectsLevel, navalBus, takeVoice } from '@/composites/play/naval/audio/bus'
import {
  bell,
  cannon,
  clang,
  click,
  explosion,
  fanfare,
  horn,
  lament,
  sinking,
  sonar,
  splash,
  whistle,
} from '@/composites/play/naval/audio/synth'
import { NavalResults } from '@/utils/constants/play'
import type { NavalResultName } from '@/utils/constants/play'

// Start delay that keeps the first samples whole
const LEAD = 0.03

/**
 * Where a shot lands for the ears
 * @typedef {Object} ShotCue
 * @property {NavalResultName} result - Miss, hit or sunk
 * @property {number} flightMs - Milliseconds until impact
 * @property {boolean} isAgainstMe - Aimed at the viewer
 * @property {boolean} isFromMe - Fired by the viewer
 * @property {number} pan - Column of the impact, minus one to one
 */

export interface ShotCue {
  result: NavalResultName
  flightMs: number
  isAgainstMe: boolean
  isFromMe: boolean
  pan: number
}

/**
 * Whole sound of a shell: launch, whistle, impact, all on the audio clock
 * @param {ShotCue} cue - Shot
 * @return {void}
 */

export const cueShot = ({ result, flightMs, isAgainstMe, isFromMe, pan }: ShotCue): void => {
  const bus = navalBus()
  const level = effectsLevel()
  if (!bus || level <= 0) return
  const seconds = flightMs / 1000
  const start = bus.context.currentTime + LEAD
  const impact = start + seconds

  // The target hears it big, the rest from further away
  const share = isAgainstMe ? 1 : isFromMe ? 0.75 : 0.6
  const side = isAgainstMe ? (Math.random() < 0.5 ? -1 : 1) : -Math.sign(pan || 1)
  if (takeVoice(seconds + 3, true)) {
    cannon(bus, start, { level: level * 0.55 * (isFromMe ? 1 : 0.6), pan: -side * 0.5 })
    whistle(bus, start + 0.06, { seconds: seconds - 0.06, level: level * 0.8 * share, side })
  }

  // Impact in step with the animation
  const at = impact
  if (result === NavalResults.Miss) {
    splash(bus, at, { level: level * share, pan: pan * 0.6 })

    return
  }
  const isSunk = result === NavalResults.Sunk
  explosion(bus, at, { level: level * share, pan: pan * 0.4, power: isSunk ? 1 : 0.62 })
  clang(bus, at + 0.02, { level: level * share * 0.8, pan: pan * 0.4 })
  if (!isSunk) return
  explosion(bus, at + 0.24, { level: level * share * 0.85, pan: pan * 0.4, power: 0.8 })
  sinking(bus, at + 0.3, { level: level * share, pan: pan * 0.3 })
}

/**
 * Gate then play one voice
 * @param {number} seconds - Length of the voice
 * @param {(bus: NonNullable<ReturnType<typeof navalBus>>, level: number, at: number) => void} play - Voice
 * @param {boolean} [isEssential] - Never dropped
 * @return {void}
 */

const cue = (
  seconds: number,
  play: (bus: NonNullable<ReturnType<typeof navalBus>>, level: number, at: number) => void,
  isEssential = false
): void => {
  const level = effectsLevel()
  const bus = level > 0 ? navalBus() : null
  if (bus && takeVoice(seconds, isEssential)) play(bus, level, bus.context.currentTime + LEAD)
}

// Ship eliminated
export const cueEliminated = (): void => cue(4, (bus, level, at) => bell(bus, at, { level }), true)

// Battle won
export const cueVictory = (): void =>
  cue(3.5, (bus, level, at) => fanfare(bus, at, { level }), true)

// Battle lost
export const cueDefeat = (): void => cue(4, (bus, level, at) => lament(bus, at, { level }), true)

// Your turn
export const cueSonar = (): void =>
  cue(2, (bus, level, at) => sonar(bus, at, { level: level * 0.8 }))

// Square picked
export const cueTick = (): void =>
  cue(0.2, (bus, level, at) => click(bus, at, { level, hertz: 920 }))

// Ship dropped on the sea
export const cuePlace = (): void =>
  cue(0.3, (bus, level, at) => click(bus, at, { level: level * 1.3, hertz: 170 }))

// Fleet locked
export const cueReady = (): void =>
  cue(1.2, (bus, level, at) => horn(bus, at, { level: level * 0.9 }))
