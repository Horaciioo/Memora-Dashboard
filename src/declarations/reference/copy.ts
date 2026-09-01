/**
 * Labels of the reference forms
 * @type {Record<string, string>}
 */

export const REFERENCE_FIELD_COPY = {
  name: 'Nom',
  handle: 'Chaîne',
  accent: 'Couleur',
  avatarUrl: 'Image',
  bannerUrl: 'Bannière',
  bannerUrlHint: 'Format horizontal, affichée sur le formulaire d’intégration.',
  archived: 'Archivé',
  archivedBadge: 'Archivé',
  imagePath: 'Visuel',
  summary: 'Description',
  kind: 'Type',
  scope: 'Tableau',
  phase: 'Catégorie',
  isDefault: 'État par défaut',
  defaultBadge: 'Par défaut',
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
  leadAssignable: 'Modification',
  leadAssignableHint:
    'Coché, un responsable peut placer un modérateur dans cette division. Décoché, seul un administrateur le peut.',
  adminOnlyBadge: 'Admins seuls',
  functions: 'Fonctions ouvertes',
  functionsHint: 'Les fonctions qu’un recrutement peut viser sur ce créateur.',
  urlPrefix: 'Préfixe de l’URL',
  urlPrefixHint: 'Ce qui précède le pseudo, par exemple https://twitch.tv/.',
  socialRequired: 'Obligatoire à l’intégration',
  leads: 'Responsables',
  leadsHint:
    'Ils voient tout ce qui touche ce créateur. Seul un admin peut les ajouter ou les retirer.',
  leadsTitle: 'Responsables ancrés',
  leadsLead: 'Qui pilote ce créateur, et sur quelle équipe chacun est resserré.',
  leadsEmptyTitle: 'Aucun responsable ancré',
  leadsEmptyDescription: 'Ancre un responsable pour lui ouvrir le périmètre de ce créateur.',
  leadTeam: 'Équipe',
  leadTeamAll: 'Toutes les équipes',
  leadsLocked: 'Seul un administrateur modifie cet ancrage.',
  leadsSaved: 'Ancrage enregistré.',
  frozenLocked: 'Fonction figée, non modifiable',
  encadrementRows: 'Encadrement',
  editableRows: 'Fonctions modifiables',
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
  lead: 'Tout ce que Memora affiche se crée ici.',
  administration: 'Administration',
  usage: 'utilisations',
  usageOne: 'utilisation',
  inUse: 'Impossible de supprimer : cet élément est encore utilisé.',
  deleteTitle: 'Supprimer cet élément ?',
  deleteDescription: 'Il disparaîtra des formulaires et des filtres. Cette action est définitive.',
  reordered: 'Nouvel ordre enregistré.',
} as const

/**
 * Copy of the workflow states editor
 * @type {Record<string, string>}
 */

export const WORKFLOW_STATE_COPY = {
  add: 'Ajouter un état',
  defaultMark: 'Par défaut',
  moveHint: 'Glisse un état d’une colonne à l’autre pour changer sa catégorie.',
  emptyColumn: 'Aucun état ici.',
} as const
