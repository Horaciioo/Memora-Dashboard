/**
 * Copy of the groups
 * @type {Record<string, string>}
 */

export const PLAY_GROUP_COPY = {
  title: 'Groupe',
  defaultName: 'Groupe de {name}',
  rename: 'Nom du groupe',
  remove: 'Retirer',
  leave: 'Quitter le groupe',
  dissolve: 'Dissoudre le groupe',
  inviteSearch: 'Chercher un membre',
  inviteSend: 'Inviter ({count})',
  inviteEmpty: 'Personne à inviter.',
  invited: 'Invitations envoyées.',
  pending: 'Invité',
  invitations: 'Invitations à un groupe',
  invitationSentence: '{name} t’invite dans « {group} »',
  accept: 'Rejoindre',
  decline: 'Refuser',
  games: 'Jeux',
  members: 'Dans le groupe',
  oneMember: '1 membre',
  memberCount: '{count} membres',
  onlineCount: '{count} en ligne',
  groupDetails: '{members} · {online}',
  statusOnline: 'En ligne',
  statusOffline: 'Hors ligne',
  invite: 'Inviter',
  playNow: 'Jouer',
  joinTable: 'Rejoindre',
  players: '{min} à {max} joueurs',
  launched: 'Partie ouverte pour le groupe.',
  invitedToPlay: 'T’a invité à jouer à',
  you: 'Toi',
  add: 'Nouveau groupe',
  settings: 'Paramètres',
  open: 'Ouvrir',
  tabChat: 'Chat de groupe',
  back: 'Mes groupes',
  tabMembers: 'Membres',
  pickGame: 'Choisir un jeu',
  invitedEmpty: 'Personne n’est invité pour l’instant.',
  chatEmpty: 'Aucun message pour l’instant.',
  chatPlaceholder: 'Écris un message',
  tabs: 'Rubriques du groupe',
  searchOpen: 'Chercher un membre à inviter',
} as const

/**
 * Failure messages of the groups
 * @type {Record<string, string>}
 */

export const PLAY_GROUP_ERRORS = {
  missing: 'Ce groupe n’existe plus.',
  tooMany: 'Tu es déjà dans trop de groupes, quites-en un d’abord.',
  notMember: 'Tu ne fais pas partie de ce groupe.',
  message: 'Écris ton message.',
  messageLong: 'Le message est trop long.',
  hostOnly: 'Seul l’hôte du groupe peut faire ça.',
  name: 'Écris le nom du groupe.',
  nameLong: 'Le nom est trop long.',
  full: 'Le groupe est complet.',
  invitationGone: 'Cette invitation n’existe plus.',
  notProposed: 'Ce jeu n’est pas proposé.',
  hostStays: 'L’hôte ne peut pas être retiré, il peut quitter ou dissoudre.',
} as const
