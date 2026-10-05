/**
 * Shell and navigation copy
 * @type {Record<string, string>}
 */

export const NAV_COPY = {
  breadcrumbs: 'Fil d’Ariane',
  crumbRecord: 'Fiche',
  sidebar: 'Navigation principale',
  account: 'Mon compte',
  searchPlaceholder: 'Effectue une recherche...',
  searchShortcut: '⌘ K',
  searchTitle: 'Recherche',
  searchEmpty: 'Rien ne correspond à cette recherche.',
  searchPrompt: 'Tape pour chercher un modérateur, un projet, une tâche ou une réunion.',
  searchNavigate: '↑ ↓ pour naviguer, ↵ pour ouvrir',
  preferences: 'Paramètres',
  theme: 'Thème',
  themeLight: 'Passer en thème clair',
  themeDark: 'Passer en thème sombre',
  textSize: 'Taille du texte',
  colorVision: 'Mode daltonien',
  wip: 'En cours de développement',
  openMore: 'Voir plus de pages',
  moreTitle: 'Plus de pages',
} as const

/**
 * Search result group labels
 * @type {Record<string, string>}
 */

export const SEARCH_GROUPS = {
  members: 'Modérateurs',
  projects: 'Projets',
  tasks: 'Tâches',
  meetings: 'Réunions',
  teams: 'Équipes',
} as const

export type SearchGroup = keyof typeof SEARCH_GROUPS

/**
 * Pagination copy
 * @type {Record<string, string | ((...values: number[]) => string)>}
 */

export const PAGINATION_COPY = {
  label: 'Pages',
  previous: 'Précédent',
  next: 'Suivant',
  summary: (page: number, totalPages: number) => `Page ${page} sur ${totalPages}`,
} as const
