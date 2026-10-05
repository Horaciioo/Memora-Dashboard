/**
 * Copy of the team surfaces
 * @type {Record<string, string>}
 */

export const TEAM_COPY = {
  title: 'Équipes',
  lead: 'Drag and Drop un modérateur d’une équipe à l’autre pour changer son affectation.',
  add: 'Créer une équipe',
  archive: 'Archiver',
  unarchive: 'Désarchiver',
  archived: 'Archivée',
  showArchived: 'Voir les archivées',
  deleteTitle: 'Supprimer cette équipe ?',
  deleteDescription: 'Ses membres redeviennent non affectés.',
  unassigned: 'Sans équipe',
  noYoutuber: 'Aucun YouTubeur',
  emptyColumn: 'Personne ici',
  members: 'membres',
  memberOne: 'membre',
} as const

/**
 * Labels of the team form
 * @type {Record<string, string>}
 */

export const TEAM_FIELD_COPY = {
  name: 'Nom de l’équipe',
  summary: 'Description',
  lead: 'Responsable',
  youtuber: 'YouTubeur',
  archived: 'Archiver cette équipe',
} as const

/**
 * Explanations behind each team field
 * @type {Record<string, string>}
 */

export const TEAM_FIELD_INFO = {
  name: 'Le nom de l’équipe.',
  lead: 'Le responsable d\'équipe.',
  youtuber: 'Le créateur sur lequel l’équipe intervient.',
  summary: 'Le rôle de l’équipe.',
} as const
