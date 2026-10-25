import { createRegistry } from '@/core/lib/registry'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'
import type { IconName } from '@/declarations/ui/icons'
import { GolfPowers } from '@/utils/constants/play'
import type { GolfPowerName } from '@/utils/constants/play'

/**
 * Who a power lands on
 * @type {Record<string, string>}
 */

export const GolfPowerTargets = {
  // The player who plays it
  Self: 'self',
  // Every other player still on the hole
  Others: 'others',
  // A point picked on the course
  Place: 'place',
} as const

export type GolfPowerTarget = (typeof GolfPowerTargets)[keyof typeof GolfPowerTargets]

/**
 * Identity of one power
 * @typedef {Object} GolfPowerMeta
 * @property {string} label - Display name
 * @property {string} effect - What it does
 * @property {boolean} isBonus - Green bonus, red malus
 * @property {GolfPowerTarget} target - Who it lands on
 * @property {IconName} icon - Glyph key
 * @property {number} [reach] - Radius on the course, laid powers
 */

export interface GolfPowerMeta {
  label: string
  effect: string
  isBonus: boolean
  target: GolfPowerTarget
  icon: IconName
  reach?: number
}

/**
 * Powers of the golf course
 * @type {Registry<GolfPowerName, GolfPowerMeta>}
 */

export const GOLF_POWERS = createRegistry<GolfPowerName, GolfPowerMeta>({
  [GolfPowers.Tornado]: {
    label: 'Tornade',
    effect: 'Pose une tornade qui fait tourner les balles des autres, jamais la tienne.',
    isBonus: false,
    target: GolfPowerTargets.Place,
    icon: 'golfTornado',
    reach: GOLF_SETTINGS.powers.tornado.radius,
  },
  [GolfPowers.Sticky]: {
    label: 'Murs collants',
    effect: 'Les balles des autres s’arrêtent net au premier mur touché.',
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfSticky',
  },
  [GolfPowers.Giant]: {
    label: 'Balle géante',
    effect: fillPlayMessage(
      'Les balles des autres deviennent {scale} fois plus grosses et entrent mal dans le trou.',
      { scale: GOLF_SETTINGS.powers.giant.scale }
    ),
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfGiant',
  },
  [GolfPowers.Mini]: {
    label: 'Balle mini',
    effect: 'Les balles des autres rapetissent, partent moins loin et volent au moindre choc.',
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfMini',
  },
  [GolfPowers.AntiCollision]: {
    label: 'Anti-collision',
    effect: 'Plus personne ne peut te percuter.',
    isBonus: true,
    target: GolfPowerTargets.Self,
    icon: 'golfShield',
  },
  [GolfPowers.Bumper]: {
    label: 'Bumper',
    effect: fillPlayMessage(
      'Pose un bumper où tu veux, il renvoie les balles {lives} fois avant de disparaître.',
      { lives: GOLF_SETTINGS.powers.bumper.lives }
    ),
    isBonus: true,
    target: GolfPowerTargets.Place,
    icon: 'golfBumper',
    reach: GOLF_SETTINGS.powers.bumper.radius,
  },
  [GolfPowers.Ghost]: {
    label: 'Balle fantôme',
    effect: 'Ton prochain tir traverse tout : murs, obstacles & vide compris.',
    isBonus: true,
    target: GolfPowerTargets.Self,
    icon: 'golfGhost',
  },
})
