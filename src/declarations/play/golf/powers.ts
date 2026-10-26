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
  // Every player, the one who plays it too
  All: 'all',
  // One player picked
  Player: 'player',
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
    effect:
      'Pose une tornade qui dérive sur le parcours, aspire les balles des autres puis les recrache, jamais la tienne.',
    isBonus: false,
    target: GolfPowerTargets.Place,
    icon: 'golfTornado',
    reach: GOLF_SETTINGS.powers.tornado.radius,
  },
  [GolfPowers.Sticky]: {
    label: 'Murs collants',
    effect:
      'Jusqu’à la fin du trou, toute balle s’arrête net au premier mur touché, la tienne aussi.',
    isBonus: false,
    target: GolfPowerTargets.All,
    icon: 'golfSticky',
  },
  [GolfPowers.Ice]: {
    label: 'Glace',
    effect: fillPlayMessage(
      'Le parcours entier gèle pendant {seconds} s : les balles glissent presque sans frottement, la tienne aussi.',
      { seconds: GOLF_SETTINGS.powers.ice.seconds }
    ),
    isBonus: false,
    target: GolfPowerTargets.All,
    icon: 'golfIce',
  },
  [GolfPowers.Giant]: {
    label: 'Balle géante',
    effect: fillPlayMessage(
      'Au prochain tir des autres, leur balle est {scale} fois plus grosse et entre mal dans le trou.',
      { scale: GOLF_SETTINGS.powers.giant.scale.toLocaleString('fr-FR') }
    ),
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfGiant',
  },
  [GolfPowers.Mini]: {
    label: 'Balle mini',
    effect:
      'Au prochain tir des autres, leur balle rapetisse, part moins loin et vole au moindre choc.',
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
  [GolfPowers.Gust]: {
    label: 'Ventilos',
    effect: fillPlayMessage(
      'Des ventilateurs soufflent vers le point touché pendant {seconds} s et poussent les balles des autres, jamais la tienne.',
      { seconds: GOLF_SETTINGS.powers.gust.seconds }
    ),
    isBonus: false,
    target: GolfPowerTargets.Place,
    icon: 'golfGust',
  },
  [GolfPowers.Fart]: {
    label: 'Pet cosmique',
    effect: 'Un nuage vert pousse chaque autre balle un peu plus loin, au hasard.',
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfFart',
  },
  [GolfPowers.Turbo]: {
    label: 'Turbo farceur',
    effect: fillPlayMessage('Le prochain tir des autres part {power} fois plus fort.', {
      power: GOLF_SETTINGS.powers.turbo.power,
    }),
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfTurbo',
  },
  [GolfPowers.Flash]: {
    label: 'Flash',
    effect: fillPlayMessage(
      'Le prochain tir des autres part {power} fois plus vite, une nuée arc-en-ciel le suit.',
      { power: GOLF_SETTINGS.powers.flash.power }
    ),
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfFlash',
  },
  [GolfPowers.Steady]: {
    label: 'Main sûre',
    effect: 'Ta flèche ne tremble plus pendant ton prochain tir.',
    isBonus: true,
    target: GolfPowerTargets.Self,
    icon: 'golfSteady',
  },
  [GolfPowers.Twist]: {
    label: 'Flèche tordue',
    effect: 'La flèche des autres tourne toute seule pendant leur prochaine visée.',
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfTwist',
  },
  [GolfPowers.Mirror]: {
    label: 'Miroir',
    effect: 'La flèche des autres pointe à l’opposé de leur vrai tir.',
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfMirror',
  },
  [GolfPowers.Blind]: {
    label: 'À l’aveugle',
    effect: 'Les autres visent sans flèche ni jauge à leur prochain tir.',
    isBonus: false,
    target: GolfPowerTargets.Others,
    icon: 'golfBlind',
  },
  [GolfPowers.Lob]: {
    label: 'Lob',
    effect: 'Ton prochain tir part en cloche et saute par-dessus les murs bas.',
    isBonus: true,
    target: GolfPowerTargets.Self,
    icon: 'golfLob',
  },
  [GolfPowers.Swap]: {
    label: 'Échange',
    effect: 'Tu prends la place du joueur choisi, il prend la tienne.',
    isBonus: true,
    target: GolfPowerTargets.Player,
    icon: 'golfSwap',
  },
})
