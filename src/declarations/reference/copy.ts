/**
 * Labels of the reference forms
 * @type {Record<string, string>}
 */

export const REFERENCE_FIELD_COPY = {
  stepGlyph: 'Glyph',
  stepGlyphInfo: 'Le symbole affiché sur la timeline, pour lire l’étape d’un coup d’œil.',
  stepDestination: 'Où agir',
  stepDestinationInfo:
    'La page que la tâche ouvre, avec un parcours guidé qui montre chaque geste à faire.',
  stepGuide: 'Marche à suivre',
  stepGuideInfo:
    'Ce que la personne chargée de l’étape doit faire, en détail. Elle le lit en ouvrant sa tâche sur l’Accueil.',
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
  leadsTitle: 'Administration',
  leadsLead:
    'Les responsables et admins de ce créateur, et l’équipe sur laquelle chacun est resserré.',
  leadsEmptyTitle: 'Aucune administration',
  addLead: 'Ajouter un encadrant',
  leadsEmptyDescription:
    'Ajoute un responsable ou un admin pour lui ouvrir le périmètre de ce créateur.',
  leadTeam: 'Équipe',
  leadTeamAll: 'Toutes les équipes',
  leadsLocked: 'Seul un administrateur peut modifier l’administration.',
  leadsSaved: 'Administration enregistrée.',
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
  eraseMenu: 'Supprimer avec toutes ses données',
  eraseTitle: 'Supprimer {name} et toutes ses données ?',
  eraseBody:
    'Tout ce qui appartient à ce YouTubeur est effacé, y compris ce qui est en cours : ses lives et leurs journaux de modération, son panel de sanctions, ses commentaires sur les viewers, ses événements du calendrier, ses équipes, ses chaînes et identifiants, ses droits propres et ses recrutements. Les projets, tâches et réunions qu’il est seul à avoir sont supprimés ; ceux partagés avec un autre YouTubeur restent. Les membres ne sont jamais supprimés. Cette action est définitive.',
  eraseType: 'Écris « {name} » pour confirmer',
  eraseConfirm: 'Tout supprimer',
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
