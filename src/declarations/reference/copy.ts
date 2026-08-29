/**
 * Labels of the reference forms
 * @type {Record<string, string>}
 */

export const REFERENCE_FIELD_COPY = {
  name: 'Nom',
  handle: 'Chaîne',
  accent: 'Couleur',
  avatarUrl: 'Image',
  archived: 'Archivé',
  archivedBadge: 'Archivé',
  glyph: 'Chevrons',
  rank: 'Rang',
  imagePath: 'Visuel',
  summary: 'Description',
  kind: 'Type',
  scope: 'Tableau',
  isDefault: 'État par défaut',
  isTerminal: 'État de fin',
  defaultBadge: 'Par défaut',
  terminalBadge: 'Fin',
  weight: 'Poids',
  period: 'Période',
  jobFunction: 'Fonction',
  mandatory: 'Obligatoire',
  mandatoryBadge: 'Obligatoire',
  level: 'Niveau',
  levelBadge: 'Livecon',
  visibility: 'Visibilité',
  situation: 'Situation',
  guidelines: 'Consignes',
  dispositif: 'Dispositif',
  category: 'Catégorie',
  title: 'Intitulé',
  stage: 'Étape',
  anchor: 'Ancrage',
  offset: 'Décalage',
  owner: 'Porteur',
  calendarKind: 'Forme sur le calendrier',
  templateBody: 'Description pré-remplie',
  templateBodyHint: 'Recopiée dans l’évènement dès que le modèle est choisi.',
  defaultMinutes: 'Durée par défaut (min)',
  allDay: 'Toute la journée',
} as const

/**
 * Copy of a creator file
 * @type {Record<string, string>}
 */

export const YOUTUBER_COPY = {
  teamsTitle: 'Équipes',
  teamsLead: 'Les équipes qui interviennent pour ce créateur.',
  moderators: 'modérateurs',
  projects: 'projets',
  teams: 'équipes',
  noHandle: 'Aucune chaîne renseignée',
} as const

/**
 * Copy of the admin console
 * @type {Record<string, string>}
 */

export const REFERENCE_COPY = {
  title: 'Configuration',
  lead: 'Tout ce que Memora affiche se crée ici. Rien n’est écrit en dur dans le code.',
  usage: 'utilisations',
  usageOne: 'utilisation',
  inUse: 'Impossible de supprimer : cet élément est encore utilisé.',
  deleteTitle: 'Supprimer cet élément ?',
  deleteDescription: 'Il disparaîtra des formulaires et des filtres. Cette action est définitive.',
  reordered: 'Nouvel ordre enregistré.',
} as const
