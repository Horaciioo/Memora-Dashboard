/**
 * Copy of the friends
 * @type {Record<string, string>}
 */

export const PLAY_FRIENDS_COPY = {
  title: 'Amis',
  all: 'Tous',
  addKey: 'Ajouter un ami',
  filterKey: 'Chercher dans mes amis',
  filter: 'Chercher parmi tes amis',
  search: 'Ajouter un ami',
  searchLabel: 'Chercher un joueur',
  searchEmpty: 'Aucun joueur ne porte ce nom.',
  requests: 'Demandes d’amis',
  requestsOthers: '{name} + {count} autres',
  requestsOther: '{name} + 1 autre',
  online: 'En ligne',
  offline: 'Hors ligne',
  noneLive: 'Aucune partie publique pour l’instant.',
  noneOnline: 'Aucun ami en ligne pour l’instant.',
  empty: 'Ajoute un premier ami pour jouer ensemble.',
  accept: 'Accepter',
  decline: 'Refuser',
  cancel: 'Annuler la demande',
  cancelShort: 'Annuler',
  add: 'Ajouter en ami',
  added: 'Demande envoyée',
  accepted: 'Vous êtes amis',
  remove: 'Retirer des amis',
  removed: 'Ami retiré',
  join: 'Rejoindre',
  watch: 'Regarder',
  inviteHere: 'Inviter',
  addShort: 'Ajouter',
  sent: 'Demande envoyée',
  isFriend: 'Ami',
  profile: 'Voir le profil',
  seen: 'Vu {since}',
  never: 'Pas encore venu',
  panel: 'Liste d’amis',
  resize: 'Largeur de la liste d’amis',
} as const

/**
 * Errors of the friends
 * @type {Record<string, string>}
 */

export const PLAY_FRIENDS_ERRORS = {
  self: 'Tu ne peux pas t’ajouter toi-même.',
  unknown: 'Ce joueur n’existe pas.',
  already: 'Vous êtes déjà amis ou une demande attend.',
  full: 'Ta liste d’amis est pleine.',
  gone: 'Cette demande n’existe plus.',
} as const
