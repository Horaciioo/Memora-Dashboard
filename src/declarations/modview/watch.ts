/**
 * Copy of the Surveillance tab
 * @type {Record<string, string>}
 */

export const MODVIEW_WATCH_COPY = {
  queue: 'File d’attente de l’AutoMod',
  watch: 'Surveillance',
  tabs: 'Vue de la fenêtre',
  emptyTitle: 'Personne sous surveillance',
  emptyBody:
    'Clique sur le pseudo d’un viewer, puis sur « Surveiller », ou fais un clic droit sur l’un de ses messages. Ses messages s’isolent ici.',
  start: 'Surveiller',
  stop: 'Ne plus surveiller',
  stopNamed: 'Ne plus surveiller {name}',
  silent: 'N’a encore rien écrit.',
  dossier: 'Ouvrir le dossier',
  unseen: '{count} nouveaux',
} as const

/**
 * Copy of the viewer dossier
 * @type {Record<string, string>}
 */

export const MODVIEW_DOSSIER_COPY = {
  title: 'Dossier',
  ladderEmpty: 'Aucune infraction du panel enregistrée.',
  ladderTitle: 'Où il en est dans le panel',
  step: 'Palier {n} sur {total}',
  next: 'Prochain : {measure}',
  last: 'Dernier palier atteint',
  prepare: 'Préparer le palier {n}',
  historyTitle: 'Historique sur cette chaîne',
  historyEmpty: 'Aucune sanction passée sur cette chaîne.',
  loading: 'Chargement du dossier',
  watching: 'Sous surveillance',
  window: 'Sur les {days} derniers jours',
} as const

/**
 * Copy of the team window
 * @type {Record<string, string>}
 */

export const MODVIEW_TEAM_COPY = {
  title: 'Équipe',
  emptyTitle: 'Personne d’autre n’est convoqué',
  emptyBody: 'Les modérateurs convoqués sur ce live apparaissent ici.',
  enterFocus: 'Entrer en mode Focus',
  leaveFocus: 'Quitter le mode Focus',
  inspect: 'Inspect Mod',
  following: 'Suivi en Focus',
  present: 'A répondu « Présent »',
  silent: 'N’a pas répondu / Absent',
  online: 'Connecté',
  planned: 'Prévu à {time}',
  reinforce: 'Ajouter du renfort',
  reinforceTitle: 'Renfort pour ce live',
  reinforceLabel: 'Personnes appelées en renfort',
  reinforced: 'Renfort appelé',
  offline: 'Pas connecté, le Focus attend sa connexion.',
  noRights: 'Tu ne peux pas suivre ce modérateur.',
  focusBy: '{watcher} suit {target}',
} as const
