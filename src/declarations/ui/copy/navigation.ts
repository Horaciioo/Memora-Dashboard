/**
 * Shell and navigation copy
 * @type {Record<string, string>}
 */

export const NAV_COPY = {
  breadcrumbs: 'Fil d’Ariane',
  crumbRecord: 'Fiche',
  crumbFold: 'Pages précédentes',
  sidebar: 'Navigation principale',
  collapseRail: 'Réduire le menu',
  viewSwitch: 'Niveau de vue',
  railViewSwitch: 'Menu du calendrier ou menu des pages',
  railViewCalendarShort: 'Calendrier',
  railViewClassicShort: 'Menu',
  railSectionSwitch: 'Pages privées ou pages normales',
  railSectionPrivate: 'Privées',
  railSectionNormal: 'Normales',
  expandRail: 'Agrandir le menu',
  status: 'Statut',
  historyBack: 'Page précédente',
  historyForward: 'Page suivante',
  home: 'Accueil',
  account: 'Mon compte',
  openMenu: 'Ouvrir le menu',
  menuTitle: 'Navigation',
  menuLine: 'Toutes tes pages, au même endroit.',
  notifications: 'Notifications',
  searchPlaceholder: 'Effectue une recherche...',
  searchShortcut: '⌘ K',
  searchTitle: 'Recherche',
  searchEmpty: 'Rien ne correspond à cette recherche.',
  preferences: 'Paramètres',
  theme: 'Thème',
  themeLight: 'Passer en thème clair',
  themeDark: 'Passer en thème sombre',
  textSize: 'Taille du texte',
  colorVision: 'Mode daltonien',
  wip: 'En cours de développement',
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
  pages: 'Pages privées',
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
