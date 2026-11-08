/**
 * Group a message can call
 * @typedef {'everyone' | 'team' | 'coordinator' | 'responsables' | 'designated'} TeamMentionKind
 */

export type TeamMentionKind = 'everyone' | 'team' | 'coordinator' | 'responsables' | 'designated'

/**
 * Mention targets, the label is what the author types after @
 * @type {Record<TeamMentionKind, { label: string }>}
 */

export const TEAM_MENTIONS: Record<TeamMentionKind, { label: string }> = {
  everyone: { label: 'Tous' },
  team: { label: 'Twitch' },
  responsables: { label: 'Responsable' },
  coordinator: { label: 'Coordinateur' },
  designated: { label: 'Référent' },
}

// Mention kinds in menu order
export const TEAM_MENTION_KINDS = Object.keys(TEAM_MENTIONS) as TeamMentionKind[]

/**
 * Event names of the team topic
 * @type {{ message: string }}
 */

export const TEAM_CHAT_EVENTS = {
  message: 'message',
} as const

/**
 * Texts of the internal chat
 * @type {Record<string, string>}
 */

export const TEAM_CHAT_COPY = {
  title: 'Chat interne',
  placeholder: 'Écris à l’équipe',
  send: 'Envoyer',
  mention: 'Mentionner',
  empty: 'Aucun message pour ce live.',
  emptyBody: 'Les messages restent entre les membres de l’équipe.',
  older: 'Voir plus ancien',
  unread: 'Nouveaux messages',
  mentioned: '{author} t’a mentionné',
  you: 'Toi',
  unknown: 'Membre',
  failed: 'Message non envoyé',
} as const
