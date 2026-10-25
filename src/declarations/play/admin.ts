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
  global: 'Toutes les parties',
  level: 'Niveau {level}',
  xp: '{xp} XP',
  record: '{wins} V · {draws} É · {losses} D',
  noGame: 'Aucune partie en cours.',
  playing: 'Joue à {game}',
  waiting: 'Attend une partie de {game}',
  logsView: 'Play',
  logsEmptyTitle: 'Aucune partie',
  logsEmptyDescription: 'Ses parties et sa progression Play apparaîtront ici.',
  xpAction: 'Passer de l’XP',
  xpNote: 'Ajoute ou retire de l’XP sur un jeu.',
  levelAction: 'Fixer un niveau',
  levelNote: 'Place le modérateur au début d’un niveau.',
  resetAction: 'Remettre à zéro',
  resetNote: 'Efface la progression et les stats d’un jeu.',
  removeAction: 'Sortir de la partie',
  removeNote: 'Le retire de la partie en cours, sans récompense.',
  removeConfirmTitle: 'Le sortir de sa partie ?',
  removeConfirmDescription: 'Il quitte la partie maintenant et ne gagne rien pour celle-ci.',
  xpDone: 'XP modifiée',
  levelDone: 'Niveau fixé',
  resetDone: 'Progression remise à zéro',
  removeDone: 'Modérateur sorti de sa partie',
  gameField: 'Jeu',
  amountField: 'XP à passer',
  amountHint: 'Un nombre négatif en retire.',
  levelField: 'Niveau',
} as const

// Game choice shared by every drawer
const GAME_FIELD: FieldDefinition = {
  name: 'game',
  kind: 'select',
  label: PLAY_MEMBER_COPY.gameField,
  required: true,
  options: toOptions(PLAY_GAMES),
}

/**
 * Drawers of the Play admin
 * @type {Record<'xp' | 'level' | 'reset', FieldDefinition[]>}
 */

export const PLAY_ADMIN_FIELDS: Record<'xp' | 'level' | 'reset', FieldDefinition[]> = {
  xp: [
    GAME_FIELD,
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
    GAME_FIELD,
    {
      name: 'level',
      kind: 'number',
      label: PLAY_MEMBER_COPY.levelField,
      required: true,
      min: 1,
      max: PLAY_SETTINGS.levels.max,
    },
  ],
  reset: [GAME_FIELD],
}
