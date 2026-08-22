/**
 * Copy of the team surfaces
 * @type {Record<string, string>}
 */

export const TEAM_COPY = {
  title: 'Équipes',
  lead: 'Glisse un modérateur d’une équipe à l’autre pour l’affecter.',
  add: 'Créer une équipe',
  emptyTitle: 'Aucune équipe',
  emptyDescription: 'Crée une première équipe et rattache-lui des modérateurs.',
  deleteTitle: 'Supprimer cette équipe ?',
  deleteDescription: 'Ses membres redeviennent non affectés.',
  unassigned: 'Sans équipe',
  unassignedHint: 'Glisse un modérateur ici pour le détacher.',
  emptyColumn: 'Personne ici',
  members: 'membres',
  memberOne: 'membre',
  leadLabel: 'Responsable',
  noLead: 'Aucun responsable',
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
} as const
