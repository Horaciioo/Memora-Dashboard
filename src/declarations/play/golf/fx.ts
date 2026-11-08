import { GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Animation of one power: its three moves, their length, and the pieces drawing them
 * @typedef {Object} GolfPowerFx
 * @property {string} cast - Coming on
 * @property {string} aura - While it acts
 * @property {string} end - Going off
 * @property {number} castMs - Coming on length
 * @property {number} endMs - Going off length
 * @property {number} reducedMs - Short fade when motion is reduced
 * @property {string | null} scene - 3D piece drawing it
 * @property {string | null} hud - Screen layer drawing it
 */

export interface GolfPowerFx {
  cast: string
  aura: string
  end: string
  castMs: number
  endMs: number
  reducedMs: number
  scene: string | null
  hud: string | null
}

// Common lengths, ms
const QUICK = { castMs: 450, endMs: 350, reducedMs: 150 }
const SLOW = { castMs: 900, endMs: 700, reducedMs: 200 }

/**
 * One animation entry per power
 * @type {Record<GolfPowerName, GolfPowerFx>}
 */

export const GOLF_POWER_FX: Record<GolfPowerName, GolfPowerFx> = {
  [GolfPowers.Tornado]: {
    cast: 'swirlGrow',
    aura: 'funnel',
    end: 'swirlFade',
    ...SLOW,
    scene: 'GolfTornado',
    hud: null,
  },
  [GolfPowers.Sticky]: {
    cast: 'glueRun',
    aura: 'glueShine',
    end: 'glueDry',
    ...SLOW,
    scene: 'GolfCastBurst',
    hud: null,
  },
  [GolfPowers.Ice]: {
    cast: 'frostSpread',
    aura: 'rink',
    end: 'melt',
    ...SLOW,
    scene: 'GolfIce',
    hud: 'GolfFrost',
  },
  [GolfPowers.Giant]: {
    cast: 'growSteps',
    aura: 'breathe',
    end: 'shrinkPop',
    ...QUICK,
    scene: 'GolfBalls',
    hud: null,
  },
  [GolfPowers.Mini]: {
    cast: 'shrinkSpin',
    aura: 'sparks',
    end: 'growBounce',
    ...QUICK,
    scene: 'GolfBalls',
    hud: null,
  },
  [GolfPowers.AntiCollision]: {
    cast: 'bubbleClose',
    aura: 'bubbleWave',
    end: 'bubblePop',
    ...QUICK,
    scene: 'GolfBallFx',
    hud: null,
  },
  [GolfPowers.Bumper]: {
    cast: 'riseFromGround',
    aura: 'hearts',
    end: 'sinkInGround',
    ...QUICK,
    scene: 'GolfBumper',
    hud: null,
  },
  [GolfPowers.Ghost]: {
    cast: 'fadeOut',
    aura: 'vapour',
    end: 'fadeIn',
    ...QUICK,
    scene: 'GolfBalls',
    hud: null,
  },
  [GolfPowers.Gust]: {
    cast: 'unfold',
    aura: 'windSquares',
    end: 'fold',
    ...SLOW,
    scene: 'GolfGusts',
    hud: null,
  },
  [GolfPowers.Fart]: {
    cast: 'cloudSwell',
    aura: 'push',
    end: 'cloudFade',
    ...QUICK,
    scene: 'GolfCastBurst',
    hud: null,
  },
  [GolfPowers.Flash]: {
    cast: 'bolt',
    aura: 'rainbowSwarm',
    end: 'sparksFall',
    ...QUICK,
    scene: 'GolfFlashSwarm',
    hud: null,
  },
  [GolfPowers.Steady]: {
    cast: 'clampShut',
    aura: 'stillArrow',
    end: 'clampOpen',
    ...QUICK,
    scene: 'GolfCastBurst',
    hud: null,
  },
  [GolfPowers.Twist]: {
    cast: 'arrowTwist',
    aura: 'arrowSpin',
    end: 'arrowStraight',
    ...QUICK,
    scene: 'GolfAim',
    hud: null,
  },
  [GolfPowers.Mirror]: {
    cast: 'sweepGleam',
    aura: 'mirrorEdge',
    end: 'shatter',
    ...QUICK,
    scene: 'GolfAim',
    hud: null,
  },
  [GolfPowers.Blind]: {
    cast: 'pencilErase',
    aura: 'noArrow',
    end: 'redraw',
    castMs: 900,
    endMs: 350,
    reducedMs: 150,
    scene: 'GolfAim',
    hud: null,
  },
  [GolfPowers.Lob]: {
    cast: 'crouch',
    aura: 'flightShadow',
    end: 'softLanding',
    ...QUICK,
    scene: 'GolfBalls',
    hud: null,
  },
  [GolfPowers.BumperMan]: {
    cast: 'growToBumper',
    aura: 'pulseRing',
    end: 'shrinkToBall',
    ...QUICK,
    scene: 'GolfBalls',
    hud: null,
  },
  [GolfPowers.BoingBoing]: {
    cast: 'growToSpring',
    aura: 'springSquash',
    end: 'springRelease',
    ...QUICK,
    scene: 'GolfBalls',
    hud: null,
  },
  [GolfPowers.Teleport]: {
    cast: 'breakToSquares',
    aura: 'squaresFly',
    end: 'rebuild',
    ...QUICK,
    scene: 'GolfCastBurst',
    hud: null,
  },
}

/**
 * Lengths of a power animation, short when motion is reduced
 * @param {GolfPowerName} power - Power
 * @param {boolean} isReduced - Reduced motion asked
 * @return {{ castMs: number, endMs: number }} - Lengths
 */

export const fxTimingOf = (
  power: GolfPowerName,
  isReduced: boolean
): { castMs: number; endMs: number } => {
  const fx = GOLF_POWER_FX[power]

  return isReduced
    ? { castMs: fx.reducedMs, endMs: fx.reducedMs }
    : { castMs: fx.castMs, endMs: fx.endMs }
}
