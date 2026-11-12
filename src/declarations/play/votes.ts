import { BACCALAUREAT_CATEGORIES } from '@/declarations/play/baccalaureat/categories'
import { BACCALAUREAT_PACKS } from '@/declarations/play/baccalaureat/packs'
import { BOMB_SETUP_COPY } from '@/declarations/play/bomb/copy'
import { BOMB_SETTINGS } from '@/declarations/play/bomb/settings'
import type { BombLevel } from '@/declarations/play/bomb/settings'
import { ECHO_SETTINGS } from '@/declarations/play/echo/settings'
import { GLITCH_SETTINGS } from '@/declarations/play/glitch/settings'
import { SUSPENS_SETTINGS } from '@/declarations/play/suspens/settings'
import { JUMBLE_LEVEL_COPY } from '@/declarations/play/jumble/copy'
import { JUMBLE_SETTINGS } from '@/declarations/play/jumble/settings'
import type { JumbleLevel } from '@/declarations/play/jumble/settings'
import { LUDO_RULE_COPY, LUDO_SETUP_COPY } from '@/declarations/play/ludo/copy'
import { LudoEndings, LUDO_SETTINGS } from '@/declarations/play/ludo/settings'
import type { LudoExitRule } from '@/declarations/play/ludo/settings'
import { NAVAL_MODE_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_MAPS, NAVAL_RANDOM_MAP, navalMapSize } from '@/declarations/play/naval/maps'
import { countStep, voteCountsOf } from '@/declarations/play/voteCounts'
import { CROQUIS_SETTINGS } from '@/declarations/play/croquis/settings'
import type { IconName } from '@/declarations/ui/icons'
import { NavalModes, PlayGames } from '@/utils/constants/play'
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

// Cards of an on or off step
const onOff = (on: Omit<PlayVoteChoice, 'key'>, off: Omit<PlayVoteChoice, 'key'>) => [
  { key: 'on', ...on },
  { key: 'off', ...off },
]

/**
 * One step of a launch vote
 * @typedef {Object} PlayVoteStepSpec
 */

export interface PlayVoteStepSpec {
  key: string
  title: string
  lead: string
  choices: PlayVoteChoice[]
  // Card kept when nobody votes, the first by default
  initial?: string
  // Table sizes asking this step, every size by default
  isAsked?: (seated: number) => boolean
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

// Glyph of each Bomb level, easiest first
const BOMB_LEVEL_ICONS: IconName[] = [
  'playStar',
  'playTick',
  'playRounds',
  'playFlame',
  'playCrown',
]

// Glyph of each Jumble level
const JUMBLE_LEVEL_ICONS: Record<JumbleLevel, IconName> = {
  easy: 'playStar',
  medium: 'playRounds',
  hard: 'playFlame',
  extreme: 'playCrown',
}

// Words shared by the steps counting rounds
const ROUNDS_COPY = {
  title: 'Manches',
  lead: 'Combien de manches ?',
  label: (count: number) => `${count} manches`,
  hint: (count: number) => `${count} manches pour désigner le gagnant.`,
}

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
      title: BOMB_SETUP_COPY.dictionary,
      lead: 'Quelle taille de dictionnaire pour les syllabes ?',
      initial: BOMB_SETTINGS.difficulty,
      choices: (Object.keys(BOMB_SETTINGS.wordsPerPrompt) as BombLevel[]).map((level, index) => ({
        key: level,
        label: BOMB_SETUP_COPY[level],
        hint: `Des syllabes présentes dans +${BOMB_SETTINGS.wordsPerPrompt[level].toLocaleString('fr-FR')} mots.`,
        icon: BOMB_LEVEL_ICONS[index],
      })),
    },
    countStep('lives', voteCountsOf('bomb', 'lives', [1, 2, 3]), BOMB_SETTINGS.startLives.initial, {
      title: 'Vies',
      lead: 'Combien de vies au départ ?',
      label: (count) => (count > 1 ? `${count} vies` : '1 vie'),
      hint: (count) =>
        count > 1 ? `Chacun démarre avec ${count} vies.` : 'Une explosion et c’est fini.',
    }),
    countStep(
      'minTurn',
      voteCountsOf('bomb', 'minTurnSeconds', [2, 5, 10]),
      BOMB_SETTINGS.minTurnSeconds.initial,
      {
        title: BOMB_SETUP_COPY.minTurn,
        lead: 'Combien de temps garde-t-on avant que la bombe explose ?',
        label: (count) => `${count} s`,
        hint: (count) => `Au moins ${count} secondes pour trouver un mot.`,
      }
    ),
  ],
  [PlayGames.Naval]: [
    {
      key: 'mode',
      title: 'Mode',
      lead: 'Tournoi ou chacun pour soi ?',
      // Two captains always duel
      isAsked: (seated) => seated > 2,
      choices: [NavalModes.Bracket, NavalModes.Melee].map((mode) => ({
        key: mode,
        label: NAVAL_MODE_COPY[mode].title,
        hint: NAVAL_MODE_COPY[mode].note,
      })),
    },
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
          hint: 'Une carte tirée au sort au lancement.',
          icon: 'help',
        },
      ],
    },
    {
      key: 'hitReplay',
      title: 'Touché, on rejoue',
      lead: 'Un tir qui touche en donne-t-il un autre ?',
      choices: onOff(
        { label: 'On rejoue', hint: 'Un tir qui touche un navire donne un tir de plus.' },
        { label: 'On passe la main', hint: 'Un tir par tour, touché ou non.' }
      ),
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
    {
      key: 'exit',
      title: LUDO_SETUP_COPY.exit,
      lead: LUDO_SETUP_COPY.exitHint,
      initial: LUDO_SETTINGS.exit,
      choices: (Object.keys(LUDO_SETTINGS.exits) as LudoExitRule[]).map((rule) => ({
        key: rule,
        label: LUDO_SETUP_COPY[rule],
        hint: LUDO_SETUP_COPY.exitHint,
      })),
    },
    {
      key: 'mode',
      title: 'Mode',
      lead: 'Quel mode de jeu ?',
      choices: [
        {
          key: 'normal',
          label: 'Normal',
          hint: 'Aucune case action, les règles habituelles.',
          icon: 'playRules',
        },
        {
          key: 'chaos',
          label: LUDO_RULE_COPY.chaos.label,
          hint: LUDO_RULE_COPY.chaos.hint,
          icon: 'playFlame',
        },
      ],
    },
  ],
  [PlayGames.Echo]: [
    countStep(
      'rounds',
      voteCountsOf('echo', 'rounds', [3, 5, 8, 12]),
      ECHO_SETTINGS.rounds.initial,
      ROUNDS_COPY
    ),
  ],
  [PlayGames.Glitch]: [
    countStep(
      'rounds',
      voteCountsOf('glitch', 'rounds', [3, 5, 8]),
      GLITCH_SETTINGS.rounds.initial,
      ROUNDS_COPY
    ),
    countStep(
      'differences',
      voteCountsOf('glitch', 'differences', [1, 3, 5, 8]),
      GLITCH_SETTINGS.differences.initial,
      {
        title: 'Différences',
        lead: 'Combien de différences à trouver par image ?',
        label: (count) => (count > 1 ? `${count} différences` : '1 différence'),
        hint: (count) => (count > 1 ? `${count} différences cachées.` : 'Une seule, bien cachée.'),
      }
    ),
  ],
  [PlayGames.Suspens]: [
    countStep('laps', voteCountsOf('suspens', 'laps', [1, 2, 3]), SUSPENS_SETTINGS.laps.initial, {
      title: 'Tours de table',
      lead: 'Combien de fois chacun choisit un mot ?',
      label: (count) => (count > 1 ? `${count} tours` : '1 tour'),
      hint: (count) => `Chacun est meneur ${count > 1 ? `${count} fois` : 'une fois'}.`,
    }),
    countStep(
      'errors',
      voteCountsOf('suspens', 'errors', [6, 8, 10]),
      SUSPENS_SETTINGS.errors.initial,
      {
        title: 'Erreurs permises',
        lead: 'Combien d’erreurs avant la potence ?',
        label: (count) => `${count} erreurs`,
        hint: (count) =>
          count === SUSPENS_SETTINGS.errors.min
            ? 'Le jeu classique, la potence est déjà dressée.'
            : `La potence se construit en ${count} traits.`,
      }
    ),
  ],
  [PlayGames.Croquis]: [
    countStep('laps', voteCountsOf('croquis', 'laps', [1, 2, 3]), CROQUIS_SETTINGS.laps.initial, {
      title: 'Tours de table',
      lead: 'Combien de fois chacun dessine ?',
      label: (count) => (count > 1 ? `${count} tours` : '1 tour'),
      hint: (count) => `Chacun dessine ${count > 1 ? `${count} fois` : 'une fois'}.`,
    }),
  ],
  [PlayGames.Jumble]: [
    {
      key: 'difficulty',
      title: 'Difficulté',
      lead: 'Des mots courts ou des mots à rallonge ?',
      initial: JUMBLE_SETTINGS.difficulty,
      choices: (Object.keys(JUMBLE_SETTINGS.difficulties) as JumbleLevel[]).map((level) => ({
        key: level,
        label: JUMBLE_LEVEL_COPY[level],
        hint: `Des mots de ${JUMBLE_SETTINGS.difficulties[level].min} à ${JUMBLE_SETTINGS.difficulties[level].max} lettres.`,
        icon: JUMBLE_LEVEL_ICONS[level],
      })),
    },
    countStep(
      'rounds',
      voteCountsOf('jumble', 'rounds', [5, 10, 15, 20]),
      JUMBLE_SETTINGS.rounds.initial,
      ROUNDS_COPY
    ),
    {
      key: 'hint',
      title: 'Indices',
      lead: 'Avec un coup de pouce à mi-chemin ?',
      choices: onOff(
        {
          label: 'Avec indices',
          hint: 'La première lettre se dévoile à mi-chemin.',
          icon: 'playStar',
        },
        { label: 'Sans indices', hint: 'Aucun coup de pouce.', icon: 'playCancel' }
      ),
    },
  ],
}

/**
 * Raw settings of a finished vote, read by the game's settings reader
 * @type {Partial<Record<PlayGameName, (chosen: Record<string, string>) => Record<string, unknown>>>}
 */

export const PLAY_VOTE_SETTINGS: Partial<
  Record<PlayGameName, (chosen: Record<string, string>, seated: number) => Record<string, unknown>>
> = {
  [PlayGames.Baccalaureat]: (chosen) => ({
    flash: chosen.pack === 'flash',
    ...(chosen.pack !== 'flash' && { pack: chosen.pack }),
    rounds: Number(chosen.rounds),
  }),
  [PlayGames.Bomb]: (chosen) => ({
    difficulty: chosen.difficulty,
    startLives: Number(chosen.lives),
    minTurnSeconds: Number(chosen.minTurn),
  }),
  [PlayGames.Naval]: (chosen, seated) => ({
    mode: seated > 2 ? chosen.mode : NavalModes.Duel,
    map: chosen.map,
    rules: { hitReplay: chosen.hitReplay === 'on' },
  }),
  [PlayGames.Ludo]: (chosen) => ({
    ending: chosen.ending,
    pawns: Number(chosen.pawns),
    exit: chosen.exit,
    rules: { chaos: chosen.mode === 'chaos' },
  }),
  [PlayGames.Echo]: (chosen) => ({ rounds: Number(chosen.rounds) }),
  [PlayGames.Glitch]: (chosen) => ({
    rounds: Number(chosen.rounds),
    differences: Number(chosen.differences),
  }),
  [PlayGames.Croquis]: (chosen) => ({ laps: Number(chosen.laps) }),
  [PlayGames.Suspens]: (chosen) => ({
    laps: Number(chosen.laps),
    errors: Number(chosen.errors),
  }),
  [PlayGames.Jumble]: (chosen) => ({
    difficulty: chosen.difficulty,
    rounds: Number(chosen.rounds),
    hasHint: chosen.hint === 'on',
  }),
}
