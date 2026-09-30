/**
 * Copy of the team surfaces
 * @type {Record<string, string>}
 */

export const TEAM_COPY = {
  title: 'Équipes',
  lead: 'Glisse un modérateur d’une équipe à l’autre pour l’affecter.',
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
  name: 'Le nom de l’équipe, tel qu’il apparaît dans les listes.',
  lead: 'Le responsable qui encadre l’équipe et valide ses absences.',
  youtuber: 'Le créateur sur lequel l’équipe intervient.',
  summary: 'Le rôle de l’équipe, en une phrase.',
} as const
