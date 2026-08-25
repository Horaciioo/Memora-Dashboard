/**
 * Copy of the access matrix
 * @type {Record<string, string>}
 */

export const ACCESS_COPY = {
  title: 'Accès',
  lead: 'Ce que chaque rôle et chaque fonction ouvrent. Le compte administrateur garde tout, quoi qu’il arrive.',
  tabRoles: 'Par rôle',
  tabFunctions: 'Par fonction',
  save: 'Enregistrer',
  preset: 'Remettre les permissions conseillées',
  presetTitle: 'Remettre les permissions conseillées ?',
  presetDescription: 'Les permissions de ce rôle sont remplacées par celles du modèle.',
  functionsEmptyTitle: 'Aucune fonction',
  functionsEmptyDescription:
    'Crée des fonctions dans la configuration pour leur donner des permissions.',
  configure: 'Ouvrir la configuration',
  granted: 'permissions',
  grantedOne: 'permission',
  rootNote: 'Le compte administrateur ignore cette matrice.',
  search: 'Chercher une permission',
  noMatch: 'Aucune permission ne correspond.',
  grantAll: 'Tout',
  grantNone: 'Rien',
  sensitive: 'Sensible',
  pending: 'modification',
  pendingMany: 'modifications',
  stateInherited: 'Hérité',
  stateAllowed: 'Autorisé',
  stateDenied: 'Refusé',
  inheritedYes: 'Hérité · autorisé',
  inheritedNo: 'Hérité · refusé',
} as const
