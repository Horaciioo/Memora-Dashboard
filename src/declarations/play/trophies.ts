import { PLAY_GAMES } from '@/declarations/play/games'
import type { IconName } from '@/declarations/ui/icons'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

// Totals summed over every game
type TrophyTotal =
  | 'played'
  | 'wins'
  | 'draws'
  | 'losses'
  | 'abandons'
  | 'bestStreak'
  | 'tournamentsPlayed'
  | 'tournamentsWon'
  | 'playSeconds'
  | 'gamesTried'
  | 'gamesWon'
  | 'gamesRegular'

// Counters of one game, then the ones it boasts about
export type TrophyGameStat = 'played' | 'wins'

/**
 * Counter a trophy watches: a global total, a game total or a counter of one game
 * @typedef {string} TrophyStat
 */

export type TrophyStat =
  TrophyTotal | `${TrophyGameStat}:${PlayGameName}` | `extra:${string}:${PlayGameName}`

// Rarities, rarest last
export const PLAY_RARITIES = ['common', 'rare', 'legendary'] as const

export type PlayTrophyRarity = (typeof PLAY_RARITIES)[number]

/**
 * Levels a trophy pays, by rarity
 * @type {Record<PlayTrophyRarity, number>}
 */

export const PLAY_RARITY_LEVELS: Record<PlayTrophyRarity, number> = {
  common: 1,
  rare: 3,
  legendary: 5,
}

// Games played this much count as a regular one
export const TROPHY_REGULAR_PLAYED = 10

// Games a player can try, the ceiling of the collection trophies
const PLAYABLE = PLAY_GAMES.keys.filter((game) => PLAY_GAMES.get(game).playable)

/**
 * Shelf of the collection: a theme, or one game
 * @typedef {string} PlayTrophyCategory
 */

export const PLAY_TROPHY_THEMES = [
  'journey',
  'victories',
  'character',
  'explorer',
  'tournaments',
] as const

export type PlayTrophyCategory = (typeof PLAY_TROPHY_THEMES)[number] | PlayGameName

// Names of the themed shelves
const THEME_LABELS: Record<(typeof PLAY_TROPHY_THEMES)[number], string> = {
  journey: 'Parcours',
  victories: 'Victoires et séries',
  character: 'Caractère',
  explorer: 'Explorateur',
  tournaments: 'Tournois',
}

/**
 * Shelves in display order: the themes, then one per game
 * @type {Array<{ key: PlayTrophyCategory; label: string; game: PlayGameName | null }>}
 */

export const PLAY_TROPHY_SHELVES: Array<{
  key: PlayTrophyCategory
  label: string
  game: PlayGameName | null
}> = [
  ...PLAY_TROPHY_THEMES.map((key) => ({ key, label: THEME_LABELS[key], game: null })),
  ...PLAYABLE.map((game) => ({
    key: game,
    label: PLAY_GAMES.get(game).label,
    game,
  })),
]

/**
 * Trophy earned on a counter
 * @typedef {Object} PlayTrophy
 * @property {string} key - Stable id kept in the database
 * @property {string} label - Name
 * @property {string} goal - What it asks
 * @property {TrophyStat} stat - Counter
 * @property {number} target - Value to reach
 * @property {PlayTrophyRarity} rarity - Tier, sets the levels paid
 * @property {IconName} icon - Glyph
 * @property {PlayTrophyCategory} category - Shelf
 * @property {string} [hint] - Riddle shown while a secret one is locked
 */

export interface PlayTrophy {
  key: string
  label: string
  goal: string
  stat: TrophyStat
  target: number
  rarity: PlayTrophyRarity
  icon: IconName
  category: PlayTrophyCategory
  hint?: string
}

// Key, name, goal, counter, target, rarity, glyph
type Row = [string, string, string, TrophyStat, number, PlayTrophyRarity, IconName]

// Counter proper to a game
const extra = (key: string, game: PlayGameName): TrophyStat => `extra:${key}:${game}`

const shelf = (category: PlayTrophyCategory, rows: Row[]): PlayTrophy[] =>
  rows.map(([key, label, goal, stat, target, rarity, icon]) => ({
    key,
    label,
    goal,
    stat,
    target,
    rarity,
    icon,
    category,
  }))

// Riddle trophies, their name stays hidden until won
const secret = (category: PlayTrophyCategory, rows: Array<[...Row, string]>): PlayTrophy[] =>
  rows.map(([key, label, goal, stat, target, rarity, icon, hint]) => ({
    key,
    label,
    goal,
    stat,
    target,
    rarity,
    icon,
    category,
    hint,
  }))

const { Baccalaureat, Golf, Bomb, Ludo, Naval, Jumble, Echo, Glitch, Croquis, Suspens } = PlayGames
const { StopGo, Concordat } = PlayGames

// Two trophies per game, wins on its own counter
const gameMasteries = (): PlayTrophy[] =>
  PLAYABLE.flatMap((game) => {
    const { label } = PLAY_GAMES.get(game)

    return shelf(game, [
      [
        `master-${game}`,
        `Maître de ${label}`,
        `Gagner 10 parties de ${label}`,
        `wins:${game}`,
        10,
        'rare',
        'playTrophy',
      ],
      [
        `legend-${game}`,
        `Légende de ${label}`,
        `Gagner 50 parties de ${label}`,
        `wins:${game}`,
        50,
        'legendary',
        'playCrown',
      ],
    ])
  })

/**
 * Trophies of Memora Play, each pays the levels of its rarity
 * @type {PlayTrophy[]}
 */

export const PLAY_TROPHIES: PlayTrophy[] = [
  ...shelf('journey', [
    ['firstSteps', 'Premier pas', 'Jouer une partie', 'played', 1, 'common', 'play'],
    ['warmUp', 'Échauffement', 'Jouer 10 parties', 'played', 10, 'common', 'play'],
    ['regular', 'Habitué', 'Jouer 25 parties', 'played', 25, 'common', 'play'],
    ['lobbyPillar', 'Pilier du salon', 'Jouer 100 parties', 'played', 100, 'rare', 'play'],
    ['veteran', 'Vétéran', 'Jouer 250 parties', 'played', 250, 'rare', 'play'],
    ['addict', 'Increvable', 'Jouer 500 parties', 'played', 500, 'legendary', 'play'],
    [
      'lifeLong',
      'Légende du salon',
      'Jouer 1 000 parties',
      'played',
      1000,
      'legendary',
      'playCrown',
    ],
    [
      'oneHour',
      'Sans compter les minutes',
      'Jouer 1 heure',
      'playSeconds',
      3600,
      'common',
      'playClock',
    ],
    ['fiveHours', 'Accro', 'Jouer 5 heures', 'playSeconds', 18000, 'common', 'playClock'],
    ['marathon', 'Marathonien', 'Jouer 10 heures', 'playSeconds', 36000, 'rare', 'playClock'],
    ['fiftyHours', 'Nuit blanche', 'Jouer 50 heures', 'playSeconds', 180000, 'rare', 'playClock'],
    [
      'hundredHours',
      'Résident du salon',
      'Jouer 100 heures',
      'playSeconds',
      360000,
      'legendary',
      'playClock',
    ],
  ]),
  ...shelf('victories', [
    ['firstWin', 'Première victoire', 'Gagner une partie', 'wins', 1, 'common', 'playTrophy'],
    ['tenWins', 'Sur la lancée', 'Gagner 10 parties', 'wins', 10, 'common', 'playTrophy'],
    ['twentyFiveWins', 'Redoutable', 'Gagner 25 parties', 'wins', 25, 'rare', 'playTrophy'],
    ['conqueror', 'Conquérant', 'Gagner 50 parties', 'wins', 50, 'rare', 'sword'],
    ['hundredWins', 'Machine à gagner', 'Gagner 100 parties', 'wins', 100, 'legendary', 'sword'],
    ['twoFiftyWins', 'Dominateur', 'Gagner 250 parties', 'wins', 250, 'legendary', 'playCrown'],
    ['onFire', 'En feu', 'Enchaîner 3 victoires', 'bestStreak', 3, 'common', 'playFlame'],
    ['fiveStreak', 'Sur un nuage', 'Enchaîner 5 victoires', 'bestStreak', 5, 'rare', 'playFlame'],
    ['untouchable', 'Intouchable', 'Enchaîner 7 victoires', 'bestStreak', 7, 'rare', 'playFlame'],
    ['tenStreak', 'Inarrêtable', 'Enchaîner 10 victoires', 'bestStreak', 10, 'legendary', 'flash'],
  ]),
  ...shelf('character', [
    ['firstDraw', 'Chacun son tour', 'Faire une égalité', 'draws', 1, 'common', 'playPlayers'],
    ['tenDraws', 'Maître du match nul', 'Faire 10 égalités', 'draws', 10, 'common', 'playPlayers'],
    ['twentyFiveDraws', 'Diplomate', 'Faire 25 égalités', 'draws', 25, 'rare', 'playPlayers'],
    ['firstLoss', 'Bon perdant', 'Perdre une partie', 'losses', 1, 'common', 'playHeart'],
    ['tenLosses', 'Persévérant', 'Perdre 10 parties', 'losses', 10, 'common', 'playHeart'],
    ['fiftyLosses', 'Jamais découragé', 'Perdre 50 parties', 'losses', 50, 'rare', 'playHeart'],
    [
      'twoHundredLosses',
      'Maudit des dés',
      'Perdre 200 parties',
      'losses',
      200,
      'legendary',
      'actSkull',
    ],
  ]),
  ...secret('character', [
    [
      'rageQuit',
      'Sortie par la fenêtre',
      'Quitter une partie en cours',
      'abandons',
      1,
      'common',
      'playLeave',
      'Un départ un peu brusque…',
    ],
    [
      'draft',
      'Courant d’air',
      'Quitter 10 parties en cours',
      'abandons',
      10,
      'rare',
      'playLeave',
      'Tu as toujours un train à prendre.',
    ],
  ]),
  ...shelf('explorer', [
    ['curious', 'Curieux', 'Jouer à 3 jeux différents', 'gamesTried', 3, 'common', 'search'],
    ['jackOfAll', 'Touche-à-tout', 'Jouer à 6 jeux différents', 'gamesTried', 6, 'rare', 'spark'],
    [
      'grandTour',
      'Tour du propriétaire',
      `Jouer aux ${PLAYABLE.length} jeux`,
      'gamesTried',
      PLAYABLE.length,
      'legendary',
      'playCrown',
    ],
    ['versatile', 'Polyvalent', 'Gagner dans 3 jeux différents', 'gamesWon', 3, 'rare', 'skill'],
    [
      'swissKnife',
      'Couteau suisse',
      'Gagner dans 6 jeux différents',
      'gamesWon',
      6,
      'rare',
      'skill',
    ],
    [
      'grandSlam',
      'Grand chelem',
      `Gagner dans les ${PLAYABLE.length} jeux`,
      'gamesWon',
      PLAYABLE.length,
      'legendary',
      'playTrophy',
    ],
    [
      'favourites',
      'Mes trois favoris',
      `Jouer ${TROPHY_REGULAR_PLAYED} parties dans 3 jeux`,
      'gamesRegular',
      3,
      'common',
      'playHeart',
    ],
    [
      'noJealousy',
      'Sans jalousie',
      `Jouer ${TROPHY_REGULAR_PLAYED} parties dans 6 jeux`,
      'gamesRegular',
      6,
      'rare',
      'playHeart',
    ],
  ]),
  ...shelf('tournaments', [
    [
      'firstTournament',
      'Compétiteur',
      'Disputer un tournoi',
      'tournamentsPlayed',
      1,
      'common',
      'playBracket',
    ],
    [
      'fiveTournaments',
      'Habitué des tournois',
      'Disputer 5 tournois',
      'tournamentsPlayed',
      5,
      'rare',
      'playBracket',
    ],
    [
      'twentyTournaments',
      'Pilier des tournois',
      'Disputer 20 tournois',
      'tournamentsPlayed',
      20,
      'legendary',
      'playBracket',
    ],
    ['champion', 'Champion', 'Gagner un tournoi', 'tournamentsWon', 1, 'rare', 'playCrown'],
    [
      'threeTitles',
      'Triple champion',
      'Gagner 3 tournois',
      'tournamentsWon',
      3,
      'legendary',
      'playCrown',
    ],
    [
      'tenTitles',
      'Roi des tournois',
      'Gagner 10 tournois',
      'tournamentsWon',
      10,
      'legendary',
      'playTrophy',
    ],
  ]),
  ...shelf(Golf, [
    [
      'greenkeeper',
      'Greenkeeper',
      'Réussir 100 trous',
      extra('holes', Golf),
      100,
      'common',
      'golfFlag',
    ],
    [
      'swingParty',
      'Swing party',
      'Frapper 500 balles',
      extra('strokes', Golf),
      500,
      'common',
      'golfStroke',
    ],
    [
      'aceFirst',
      'Trou en un !',
      'Réussir un trou en un',
      extra('aces', Golf),
      1,
      'rare',
      'golfFlag',
    ],
    [
      'aceTen',
      'Tigre du green',
      'Réussir 10 trous en un',
      extra('aces', Golf),
      10,
      'legendary',
      'golfStroke',
    ],
  ]),
  ...shelf(Bomb, [
    ['dico', 'Dico ambulant', 'Poser 100 mots', extra('words', Bomb), 100, 'common', 'playWriting'],
    ['robert', 'Le Robert', 'Poser 1 000 mots', extra('words', Bomb), 1000, 'rare', 'playWriting'],
    [
      'academy',
      'Immortel de l’Académie',
      'Poser 5 000 mots',
      extra('words', Bomb),
      5000,
      'legendary',
      'playWriting',
    ],
  ]),
  ...shelf(Echo, [
    ['lynx', 'Œil de lynx', 'Trouver 100 symboles', extra('found', Echo), 100, 'common', 'search'],
    [
      'firstOnIt',
      'Premier sur le coup',
      'Finir 25 fois premier',
      extra('firsts', Echo),
      25,
      'rare',
      'flash',
    ],
    ['radar', 'Radar', 'Trouver 1 000 symboles', extra('found', Echo), 1000, 'legendary', 'search'],
  ]),
  ...shelf(Croquis, [
    [
      'pencil',
      'Coup de crayon',
      'Faire 25 dessins',
      extra('drawn', Croquis),
      25,
      'common',
      'playWriting',
    ],
    [
      'understood',
      'Artiste compris',
      'Être compris 50 fois',
      extra('understood', Croquis),
      50,
      'rare',
      'playChat',
    ],
    ['seer', 'Devin', 'Trouver 150 mots', extra('found', Croquis), 150, 'rare', 'callout'],
    [
      'picasso',
      'Picasso',
      'Faire 250 dessins',
      extra('drawn', Croquis),
      250,
      'legendary',
      'playWriting',
    ],
  ]),
  ...shelf(Concordat, [
    [
      'governor',
      'Gouverneur',
      'Tenir 50 provinces',
      extra('provinces', Concordat),
      50,
      'common',
      'playPawn',
    ],
    [
      'emperor',
      'Empereur',
      'Tenir 500 provinces',
      extra('provinces', Concordat),
      500,
      'legendary',
      'playCrown',
    ],
  ]),
  ...shelf(StopGo, [
    ['roadHog', 'Chauffard', 'Parcourir 5 000 km', extra('km', StopGo), 5000, 'common', 'path'],
    ['saboteur', 'Saboteur', 'Poser 50 attaques', extra('attacks', StopGo), 50, 'common', 'sword'],
    [
      'mechanic',
      'Dépanneur du dimanche',
      'Faire 50 réparations',
      extra('remedies', StopGo),
      50,
      'common',
      'callout',
    ],
    [
      'aroundWorld',
      'Tour du monde',
      'Parcourir 50 000 km',
      extra('km', StopGo),
      50000,
      'rare',
      'path',
    ],
  ]),
  ...shelf(Suspens, [
    [
      'alphabet',
      'Alphabet complet',
      'Trouver 200 lettres',
      extra('found', Suspens),
      200,
      'common',
      'playLetters',
    ],
    [
      'hangman',
      'Bourreau d’un jour',
      'Pendre 10 bonshommes',
      extra('hanged', Suspens),
      10,
      'common',
      'actSkull',
    ],
    [
      'crossword',
      'Cruciverbiste',
      'Compléter 50 mots',
      extra('solved', Suspens),
      50,
      'rare',
      'playLetters',
    ],
  ]),
  ...shelf(Glitch, [
    [
      'detective',
      'Détective',
      'Boucler 10 images',
      extra('completed', Glitch),
      10,
      'common',
      'search',
    ],
    [
      'bugHunter',
      'Chasseur de bugs',
      'Trouver 250 différences',
      extra('found', Glitch),
      250,
      'rare',
      'objective',
    ],
    [
      'noBlindSpot',
      'Sans angle mort',
      'Boucler 100 images',
      extra('completed', Glitch),
      100,
      'legendary',
      'search',
    ],
  ]),
  ...shelf(Jumble, [
    [
      'anagram',
      'Anagrammiste',
      'Trouver 200 mots',
      extra('solved', Jumble),
      200,
      'common',
      'playLetters',
    ],
    [
      'livingDictionary',
      'Dictionnaire vivant',
      'Trouver 1 000 mots',
      extra('solved', Jumble),
      1000,
      'rare',
      'playLetters',
    ],
  ]),
  ...shelf(Ludo, [
    [
      'pawnHunter',
      'Chasseur de pions',
      'Prendre 25 pions',
      extra('captures', Ludo),
      25,
      'common',
      'playPawn',
    ],
    ['lucky', 'Veinard', 'Sortir 100 six', extra('sixes', Ludo), 100, 'common', 'vip'],
    ['noMercy', 'Sans pitié', 'Prendre 150 pions', extra('captures', Ludo), 150, 'rare', 'sword'],
    [
      'homeSweet',
      'Retour à la maison',
      'Rentrer 100 pions',
      extra('pawnsHome', Ludo),
      100,
      'rare',
      'playPawn',
    ],
  ]),
  ...shelf(Naval, [
    [
      'admiral',
      'Amiral',
      'Couler 25 navires',
      extra('shipsSunk', Naval),
      25,
      'common',
      'objective',
    ],
    [
      'sniper',
      'Tireur d’élite',
      'Toucher 500 fois',
      extra('hits', Naval),
      500,
      'rare',
      'objective',
    ],
    [
      'seaTerror',
      'Terreur des mers',
      'Couler 150 navires',
      extra('shipsSunk', Naval),
      150,
      'legendary',
      'actSkull',
    ],
  ]),
  ...shelf(Baccalaureat, [
    [
      'pen',
      'Plume de poète',
      'Écrire 500 mots valides',
      extra('words', Baccalaureat),
      500,
      'common',
      'playWriting',
    ],
    ['stopIt', 'Stop !', 'Arrêter 25 manches', extra('stops', Baccalaureat), 25, 'common', 'flash'],
    [
      'original',
      'Esprit original',
      'Écrire 50 mots uniques',
      extra('uniqueWords', Baccalaureat),
      50,
      'rare',
      'spark',
    ],
  ]),
  ...gameMasteries(),
]
