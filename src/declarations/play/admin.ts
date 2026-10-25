import { toOptions } from '@/core/lib/forms/options'
import { PLAY_GAMES } from '@/declarations/play/games'
import { PLAY_SETTINGS } from '@/declarations/play/settings'
import type { FieldDefinition } from '@/types/forms'

/**
 * Play copy of a moderator file
 * @type {Record<string, string>}
 */

export const PLAY_MEMBER_COPY = {
  view: 'Vue de l’onglet',
  viewAdmin: 'Administration',
  viewPlay: 'Play',
  sectionProgress: 'Progression',
  sectionGame: 'Partie en cours',
  sectionActions: 'Actions',
  sectionAccess: 'Accès',
  global: 'Global',
  globalNote: 'Toutes les parties, plus l’XP passée au global',
  level: 'Niveau {level}',
  xp: '{xp} XP',
  toNext: '{into} / {needed} vers le niveau {next}',
  maxed: 'Niveau maximum',
  bonus: 'dont {xp} XP passés au global',
  wins: 'V',
  draws: 'É',
  losses: 'D',
  winRate: '{rate} % de victoires',
  streak: 'série de {streak}',
  soon: 'Bientôt',
  editHint: 'Clique pour agir sur cette ligne',
  noGame: 'Aucune partie en cours.',
  playing: 'Joue à {game}',
  waiting: 'Attend une partie de {game}',
  logsView: 'Play',
  logsEmptyTitle: 'Aucune partie',
  logsEmptyDescription: 'Ses parties et sa progression Play apparaîtront ici.',
  xpAction: 'Passer de l’XP',
  xpNote: 'Sur un jeu, le global suit. Sur le global, les jeux ne bougent pas.',
  levelAction: 'Fixer un niveau',
  levelNote: 'Place le modérateur au début d’un niveau, sur un jeu ou le global.',
  statsAction: 'Corriger les stats',
  statsNote: 'Victoires, égalités, défaites et série d’un jeu.',
  resetAction: 'Remettre à zéro',
  resetNote: 'Efface un jeu, ou l’XP passée au global.',
  wipeAction: 'Tout remettre à zéro',
  wipeNote: 'Efface tous les jeux et le global.',
  wipeConfirmTitle: 'Tout effacer ?',
  wipeConfirmDescription: 'Sa progression Play repart de zéro sur tous les jeux.',
  banAction: 'Interdire Play',
  banNote: 'Il ne peut plus créer ni rejoindre de partie.',
  unbanAction: 'Rendre l’accès',
  bannedSince: 'Interdit de Play depuis le {date}',
  removeAction: 'Sortir de la partie',
  removeNote: 'Le retire de la partie en cours, sans récompense.',
  removeConfirmTitle: 'Le sortir de sa partie ?',
  removeConfirmDescription: 'Il quitte la partie maintenant et ne gagne rien pour celle-ci.',
  xpDone: 'XP modifiée',
  levelDone: 'Niveau fixé',
  statsDone: 'Stats corrigées',
  resetDone: 'Progression remise à zéro',
  banDone: 'Accès à Play retiré',
  unbanDone: 'Accès à Play rendu',
  removeDone: 'Modérateur sorti de sa partie',
  gameField: 'Jeu',
  targetField: 'Ligne',
  amountField: 'XP à passer',
  amountHint: 'Un nombre négatif en retire.',
  levelField: 'Niveau',
  winsField: 'Victoires',
  drawsField: 'Égalités',
  lossesField: 'Défaites',
  streakField: 'Série en cours',
  reasonField: 'Motif',
} as const

/**
 * Non-game targets of the admin gestures
 * @type {Record<string, string>}
 */

export const PLAY_ADMIN_TARGETS = { global: 'global', all: 'all' } as const

// Game alone
const GAME_FIELD: FieldDefinition = {
  name: 'game',
  kind: 'select',
  label: PLAY_MEMBER_COPY.gameField,
  required: true,
  options: toOptions(PLAY_GAMES),
}

// Global line first, then each game
const TARGET_FIELD: FieldDefinition = {
  ...GAME_FIELD,
  label: PLAY_MEMBER_COPY.targetField,
  options: [
    { value: PLAY_ADMIN_TARGETS.global, label: PLAY_MEMBER_COPY.global },
    ...toOptions(PLAY_GAMES),
  ],
}

// One record counter
const counter = (name: string, label: string): FieldDefinition => ({
  name,
  kind: 'number',
  label,
  required: true,
  min: 0,
  max: PLAY_SETTINGS.admin.maxCounter,
})

/**
 * Drawers of the Play admin
 * @type {Record<PlayAdminDrawer, FieldDefinition[]>}
 */

export type PlayAdminDrawer = 'xp' | 'level' | 'stats' | 'reset' | 'ban'

export const PLAY_ADMIN_FIELDS: Record<PlayAdminDrawer, FieldDefinition[]> = {
  xp: [
    TARGET_FIELD,
    {
      name: 'amount',
      kind: 'number',
      label: PLAY_MEMBER_COPY.amountField,
      hint: PLAY_MEMBER_COPY.amountHint,
      required: true,
      min: -PLAY_SETTINGS.admin.maxXpChange,
      max: PLAY_SETTINGS.admin.maxXpChange,
    },
  ],
  level: [
    TARGET_FIELD,
    {
      name: 'level',
      kind: 'number',
      label: PLAY_MEMBER_COPY.levelField,
      required: true,
      min: 1,
      max: PLAY_SETTINGS.levels.max,
    },
  ],
  stats: [
    GAME_FIELD,
    counter('wins', PLAY_MEMBER_COPY.winsField),
    counter('draws', PLAY_MEMBER_COPY.drawsField),
    counter('losses', PLAY_MEMBER_COPY.lossesField),
    counter('streak', PLAY_MEMBER_COPY.streakField),
  ],
  reset: [TARGET_FIELD],
  ban: [
    {
      name: 'reason',
      kind: 'textarea',
      label: PLAY_MEMBER_COPY.reasonField,
      required: true,
    },
  ],
}
