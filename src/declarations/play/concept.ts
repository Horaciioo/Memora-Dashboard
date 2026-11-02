import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * Animated scenes of the Concept window
 * @type {Record<string, string>}
 */

export const PlayConceptClips = {
  BacLetter: 'bacLetter',
  BacWrite: 'bacWrite',
  BacStop: 'bacStop',
  BombSyllable: 'bombSyllable',
  BombType: 'bombType',
  BombPass: 'bombPass',
  GolfAim: 'golfAim',
  GolfShot: 'golfShot',
  GolfPower: 'golfPower',
  LudoRoll: 'ludoRoll',
  LudoMove: 'ludoMove',
  LudoHome: 'ludoHome',
} as const

export type PlayConceptClip = (typeof PlayConceptClips)[keyof typeof PlayConceptClips]

/**
 * One step of a game's concept
 * @typedef {Object} PlayConceptStep
 */

export interface PlayConceptStep {
  title: string
  text: string
  clip: PlayConceptClip
}

/**
 * How each game plays, three short clips
 * @type {Record<PlayGameName, PlayConceptStep[]>}
 */

export const PLAY_CONCEPT: Record<PlayGameName, PlayConceptStep[]> = {
  [PlayGames.Baccalaureat]: [
    {
      title: 'Une lettre tombe',
      text: 'Chaque manche tire une lettre au hasard, la même pour tout le monde.',
      clip: PlayConceptClips.BacLetter,
    },
    {
      title: 'Remplis les catégories',
      text: 'Un prénom, un pays, un animal… Un mot par case, qui commence par la lettre.',
      clip: PlayConceptClips.BacWrite,
    },
    {
      title: 'Stop et votes',
      text: 'Le premier qui a fini crie stop. Tout le monde vote les réponses douteuses, les mots uniques rapportent plus.',
      clip: PlayConceptClips.BacStop,
    },
  ],
  [PlayGames.Bomb]: [
    {
      title: 'Une syllabe',
      text: 'La bombe arrive sur toi avec une syllabe.',
      clip: PlayConceptClips.BombSyllable,
    },
    {
      title: 'Trouve un mot',
      text: 'Tape un mot qui contient la syllabe, avant que la mèche ne brûle.',
      clip: PlayConceptClips.BombType,
    },
    {
      title: 'Passe la bombe',
      text: 'Mot validé, la bombe passe au suivant. Si elle t’explose dans les mains, tu perds une vie.',
      clip: PlayConceptClips.BombPass,
    },
  ],
  [PlayGames.Golf]: [
    {
      title: 'Vise',
      text: 'Tire la balle vers l’arrière pour viser, plus tu tires, plus le coup est fort.',
      clip: PlayConceptClips.GolfAim,
    },
    {
      title: 'Rentre dans le trou',
      text: 'Tout le monde joue en même temps. Le moins de coups sur le parcours gagne.',
      clip: PlayConceptClips.GolfShot,
    },
    {
      title: 'Ramasse des pouvoirs',
      text: 'Roule sur une orbe pour piocher un pouvoir : un bonus pour toi ou un malus pour les autres.',
      clip: PlayConceptClips.GolfPower,
    },
  ],
  [PlayGames.Ludo]: [
    {
      title: 'Lance le dé',
      text: 'Un 6 sort un pion de ta base, et te fait rejouer.',
      clip: PlayConceptClips.LudoRoll,
    },
    {
      title: 'Avance et mange',
      text: 'Avance d’autant de cases que le dé. Tombe sur un pion adverse pour le renvoyer chez lui.',
      clip: PlayConceptClips.LudoMove,
    },
    {
      title: 'Rentre à la maison',
      text: 'Le premier qui ramène tous ses pions au centre gagne.',
      clip: PlayConceptClips.LudoHome,
    },
  ],
}

/**
 * Words of the Concept window
 * @type {Record<string, string>}
 */

export const PLAY_CONCEPT_COPY = {
  menu: 'Concept',
  title: 'Le concept de {game}',
  steps: 'Étapes',
  powers: 'Les pouvoirs',
  bonus: 'Bonus',
  malus: 'Malus',
  play: 'Lecture',
} as const

/**
 * Words drawn inside the clips
 * @type {Object}
 */

export const PLAY_CONCEPT_SCENES = {
  bacLetter: 'M',
  bacRows: [
    ['Prénom', 'Mathis'],
    ['Pays', 'Maroc'],
    ['Animal', 'Marmotte'],
  ],
  bacStop: 'Stop !',
  bacPoints: '+10',
  bombSyllable: 'ON',
  bombWord: 'MAISON',
  // Letters of the syllable inside the word
  bombLit: [4, 5],
  bombSeats: ['A', 'B', 'C'],
  ludoSquares: 6,
} as const
