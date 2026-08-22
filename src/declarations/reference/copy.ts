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
  glyphHint: 'Les chevrons affichés à côté du nom, par exemple ❱❱❱.',
  rank: 'Rang',
  rankHint: 'Junior est au rang 0, les squads montent ensuite.',
  imagePath: 'Visuel',
  summary: 'Description',
  kind: 'Type',
  scope: 'Tableau',
  isDefault: 'État par défaut',
  isTerminal: 'État de fin',
  defaultBadge: 'Par défaut',
  terminalBadge: 'Fin',
  weight: 'Poids',
  weightHint: 'Plus le poids est élevé, plus la priorité remonte.',
  urlPrefix: 'Début du lien',
  urlPrefixHint: 'Le pseudo est collé derrière, par exemple https://x.com/.',
  period: 'Période',
  jobFunction: 'Fonction',
  jobFunctionHint: 'Laisse vide si la formation concerne tout le monde.',
  mandatory: 'Obligatoire',
  mandatoryBadge: 'Obligatoire',
  level: 'Niveau',
  levelHint: 'Plus le niveau est bas, plus la situation est tendue.',
  levelBadge: 'Livecon',
  situation: 'Situation',
  guidelines: 'Consignes',
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
  dragHint: 'Glisse une ligne pour changer l’ordre.',
} as const
