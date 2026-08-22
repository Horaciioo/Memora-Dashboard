/**
 * Shell and navigation copy
 * @type {Record<string, string>}
 */

export const NAV_COPY = {
  breadcrumbs: 'Fil d’Ariane',
  sidebar: 'Navigation principale',
  openSidebar: 'Ouvrir le menu',
  closeSidebar: 'Fermer le menu',
  account: 'Mon compte',
  searchPlaceholder: 'Rechercher…',
  searchShortcut: '⌘K',
  searchTitle: 'Recherche',
  searchEmpty: 'Rien ne correspond à cette recherche.',
  searchPrompt: 'Tape pour chercher un modérateur, un projet, une tâche ou une réunion.',
  searchNavigate: '↑ ↓ pour naviguer, ↵ pour ouvrir',
  theme: 'Thème',
  textSize: 'Taille du texte',
  colorVision: 'Vision des couleurs',
  wip: 'En développement',
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
