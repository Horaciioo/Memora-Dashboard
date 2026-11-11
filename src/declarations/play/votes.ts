import { BACCALAUREAT_CATEGORIES } from '@/declarations/play/baccalaureat/categories'
import { BACCALAUREAT_PACKS } from '@/declarations/play/baccalaureat/packs'
import type { IconName } from '@/declarations/ui/icons'
import { LudoEndings } from '@/declarations/play/ludo/settings'
import { NAVAL_MAPS, NAVAL_RANDOM_MAP, navalMapSize } from '@/declarations/play/naval/maps'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One card of a launch vote
 * @typedef {Object} PlayVoteChoice
 */

export interface PlayVoteChoice {
  key: string
  label: string
  hint: string
  // Glyph on the card, a big number when absent
  icon?: IconName
}

/**
 * One step of a launch vote
 * @typedef {Object} PlayVoteStepSpec
 */

export interface PlayVoteStepSpec {
  key: string
  title: string
  lead: string
  choices: PlayVoteChoice[]
}

// Bac formats offered, the flash one is its own format
const BAC_FORMATS = [
  ...(['classic', 'popCulture', 'twitch'] as const).map((key) => ({
    key: key as string,
    label: BACCALAUREAT_PACKS[key].label,
    hint: `${BACCALAUREAT_PACKS[key].categories.map((id) => BACCALAUREAT_CATEGORIES[id].label).join(', ')}.`,
    icon: 'playLetters' as IconName,
  })),
  {
    key: 'flash',
    label: 'Éclair',
    hint: 'Trois catégories, des manches de trente secondes.',
    icon: 'playClock' as IconName,
  },
]

/**
 * Launch votes of the games without their own, players choose the main rules
 * @type {Partial<Record<PlayGameName, PlayVoteStepSpec[]>>}
 */

export const PLAY_VOTE_STEPS: Partial<Record<PlayGameName, PlayVoteStepSpec[]>> = {
  [PlayGames.Baccalaureat]: [
    {
      key: 'pack',
      title: 'Format',
      lead: 'Choisis les catégories ou le mode éclair.',
      choices: BAC_FORMATS,
    },
    {
      key: 'rounds',
      title: 'Manches',
      lead: 'Combien de manches ?',
      choices: [3, 5, 8].map((count) => ({
        key: String(count),
        label: `${count} manches`,
        hint: `${count} lettres tirées au sort, une par manche.`,
      })),
    },
  ],
  [PlayGames.Bomb]: [
    {
      key: 'difficulty',
      title: 'Difficulté',
      lead: 'Des syllabes faciles ou corsées ?',
      choices: [
        {
          key: 'beginner',
          label: 'Débutant',
          hint: 'Des syllabes courantes, des mots qui viennent vite.',
          icon: 'playStar',
        },
        { key: 'medium', label: 'Moyen', hint: 'Il faut chercher un peu.', icon: 'playRounds' },
        {
          key: 'hard',
          label: 'Difficile',
          hint: 'Des syllabes rares, pour les dictionnaires vivants.',
          icon: 'playFlame',
        },
      ],
    },
    {
      key: 'lives',
      title: 'Vies',
      lead: 'Combien de vies au départ ?',
      choices: [1, 2, 3].map((count) => ({
        key: String(count),
        label: count > 1 ? `${count} vies` : '1 vie',
        hint: count > 1 ? `Chacun démarre avec ${count} vies.` : 'Une explosion et c’est fini.',
      })),
    },
  ],
  [PlayGames.Naval]: [
    {
      key: 'map',
      title: 'Carte',
      lead: 'Sur quelle mer on se bat ?',
      choices: [
        ...NAVAL_MAPS.keys.map((key) => ({
          key,
          label: NAVAL_MAPS.label(key),
          hint: `${navalMapSize(key)}. ${NAVAL_MAPS.get(key).tagline}`,
        })),
        {
          key: NAVAL_RANDOM_MAP,
          label: 'Au hasard',
          hint: 'Une des quatre cartes, tirée au lancement.',
          icon: 'help',
        },
      ],
    },
  ],
  [PlayGames.Ludo]: [
    {
      key: 'ending',
      title: 'Fin de partie',
      lead: 'Jusqu’où on joue ?',
      choices: [
        {
          key: LudoEndings.First,
          label: 'Premier arrivé',
          hint: 'Le premier qui rentre tous ses pions gagne.',
          icon: 'playCrown',
        },
        {
          key: LudoEndings.Podium,
          label: 'Jusqu’au podium',
          hint: 'On joue jusqu’à la dernière place.',
          icon: 'playTrophy',
        },
      ],
    },
    {
      key: 'pawns',
      title: 'Pions',
      lead: 'Combien de pions chacun ?',
      choices: [2, 3, 4].map((count) => ({
        key: String(count),
        label: `${count} pions`,
        hint: count < 4 ? 'Moins de pions, une partie plus courte.' : 'La partie complète.',
      })),
    },
  ],
}

/**
 * Raw settings of a finished vote, read by the game's settings reader
 * @type {Partial<Record<PlayGameName, (chosen: Record<string, string>) => Record<string, unknown>>>}
 */

export const PLAY_VOTE_SETTINGS: Partial<
  Record<PlayGameName, (chosen: Record<string, string>) => Record<string, unknown>>
> = {
  [PlayGames.Baccalaureat]: (chosen) => ({
    flash: chosen.pack === 'flash',
    ...(chosen.pack !== 'flash' && { pack: chosen.pack }),
    rounds: Number(chosen.rounds),
  }),
  [PlayGames.Bomb]: (chosen) => ({
    difficulty: chosen.difficulty,
    startLives: Number(chosen.lives),
  }),
  [PlayGames.Naval]: (chosen) => ({ map: chosen.map }),
  [PlayGames.Ludo]: (chosen) => ({ ending: chosen.ending, pawns: Number(chosen.pawns) }),
}
