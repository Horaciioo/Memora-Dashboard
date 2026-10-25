/**
 * Journal target of Play entries
 * @type {string}
 */

export const PLAY_TARGET = 'play'

/**
 * Name of the global line in the journal
 * @type {string}
 */

export const PLAY_GLOBAL_LABEL = 'le global'

/**
 * Journal lines of Play
 * @type {Record<string, string>}
 */

export const PLAY_JOURNAL = {
  joined: 'A rejoint une partie de {game}',
  hosted: 'A ouvert une partie de {game}',
  left: 'A quitté une partie de {game}',
  kicked: 'Retiré d’une partie de {game} par l’hôte',
  finished: 'Partie de {game} terminée, {outcome}, +{xp} XP',
  abandoned: 'Partie de {game} abandonnée en cours',
  tournament: 'Tournoi de {game} terminé, {outcome}, +{xp} XP',
  xpAdded: '{amount} XP ajoutés sur {game}',
  xpRemoved: '{amount} XP retirés sur {game}',
  levelSet: 'Niveau {level} fixé sur {game}',
  reset: 'Progression remise à zéro sur {game}',
  wiped: 'Toute la progression Play remise à zéro',
  statsSet: 'Stats {game} corrigées : {wins} V, {draws} É, {losses} D',
  banned: 'Accès à Play retiré : {reason}',
  unbanned: 'Accès à Play rendu',
  removed: 'Sorti de sa partie de {game} par l’Administration',
} as const

/**
 * Outcome words of the journal
 * @type {Record<string, string>}
 */

export const PLAY_OUTCOME_LABELS = {
  WIN: 'victoire',
  DRAW: 'égalité',
  LOSS: 'défaite',
} as const
