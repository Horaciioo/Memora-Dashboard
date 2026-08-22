/**
 * Single source of every API path
 * @type {Record<string, string | ((...parts: string[]) => string)>}
 */

export const API_ROUTES = {
  reference: (section: string) => `/api/configuration/${section}`,
  referenceItem: (section: string, id: string) => `/api/configuration/${section}/${id}`,
  referenceOrder: (section: string) => `/api/configuration/${section}/ordre`,
  members: '/api/moderateurs',
  member: (id: string) => `/api/moderateurs/${id}`,
  memberNotes: (id: string) => `/api/moderateurs/${id}/notes`,
  memberPims: (id: string) => `/api/moderateurs/${id}/pims`,
  memberSocials: (id: string) => `/api/moderateurs/${id}/reseaux`,
  memberAccess: (id: string) => `/api/moderateurs/${id}/acces`,
  note: (id: string) => `/api/notes/${id}`,
  pim: (id: string) => `/api/pims/${id}`,
  projects: '/api/projets',
  project: (id: string) => `/api/projets/${id}`,
  projectCommunications: (id: string) => `/api/projets/${id}/communications`,
  communication: (id: string) => `/api/communications/${id}`,
  tasks: '/api/taches',
  task: (id: string) => `/api/taches/${id}`,
  meetings: '/api/reunions',
  meeting: (id: string) => `/api/reunions/${id}`,
  meetingAttendees: (id: string) => `/api/reunions/${id}/participants`,
  absences: '/api/absences',
  absence: (id: string) => `/api/absences/${id}`,
  livecon: '/api/livecon',
  academy: '/api/academy',
  teams: '/api/equipes',
  team: (id: string) => `/api/equipes/${id}`,
  access: '/api/acces',
  board: '/api/tableau',
  search: '/api/recherche',
} as const

/**
 * Single source of every client cache key
 * @type {Record<string, (...parts: string[]) => string>}
 */

export const CACHE_KEYS = {
  reference: (section: string) => `reference:${section}`,
  members: () => 'members',
  member: (id: string) => `member:${id}`,
  projects: () => 'projects',
  project: (id: string) => `project:${id}`,
  tasks: () => 'tasks',
  meetings: () => 'meetings',
  absences: () => 'absences',
  livecon: () => 'livecon',
  teams: () => 'teams',
  access: () => 'access',
  search: (term: string) => `search:${term}`,
} as const
