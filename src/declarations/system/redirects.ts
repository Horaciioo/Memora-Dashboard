/**
 * Old French address and its English successor
 * @typedef {Object} LegacyRedirect
 * @property {string} source - Old path
 * @property {string} destination - New path
 */

export interface LegacyRedirect {
  source: string
  destination: string
}

// Nested pages first, so the broad prefix never swallows them
const NESTED: LegacyRedirect[] = [
  // Pictures already stored under the old address
  { source: '/api/fichiers/:id', destination: '/api/files/:id' },
  { source: '/api/connexion/twitch/retour', destination: '/api/login/twitch/callback' },
  { source: '/api/connexion/youtube/retour', destination: '/api/login/youtube/callback' },
  { source: '/api/connexion/discord/retour', destination: '/api/login/discord/callback' },
  {
    source: '/recrutements/:id/:candidate/entretien',
    destination: '/recruitments/:id/:candidate/interview',
  },
  { source: '/lives/:id/bilan-createur', destination: '/lives/:id/creator-report' },
  { source: '/lives/:id/bilan', destination: '/lives/:id/report' },
  { source: '/lives/apercu', destination: '/lives/preview' },
  { source: '/pages/corbeille', destination: '/pages/trash' },
  { source: '/play/classement', destination: '/play/ranking' },
  { source: '/play/parties/:id', destination: '/play/sessions/:id' },
  { source: '/play/trophees', destination: '/play/trophies' },
  { source: '/configuration/acces', destination: '/settings/access' },
  { source: '/configuration/equipes', destination: '/settings/teams' },
  { source: '/configuration/youtubeurs/:path*', destination: '/settings/creators/:path*' },
  { source: '/configuration/formations/:path*', destination: '/settings/trainings/:path*' },
  { source: '/systeme/activite', destination: '/system/activity' },
  { source: '/systeme/employes', destination: '/system/employees' },
  { source: '/systeme/files', destination: '/system/queues' },
  { source: '/systeme/sante', destination: '/system/health' },
  { source: '/systeme/sondes', destination: '/system/probes' },
  { source: '/systeme/stockage', destination: '/system/storage' },
]

// Top-level pages, children keep their path
const ROOTS: Record<string, string> = {
  '/connexion': '/login',
  '/confidentialite': '/privacy',
  '/hors-ligne': '/offline',
  '/exercice': '/exercise',
  '/tableau-de-bord': '/dashboard',
  '/moderateurs': '/members',
  '/projets': '/projects',
  '/taches': '/tasks',
  '/reunions': '/meetings',
  '/calendrier': '/calendar',
  '/formations': '/trainings',
  '/recrutements': '/recruitments',
  '/maturite': '/maturity',
  '/nouveautes': '/changelog',
  '/statut': '/status',
  '/parametres': '/preferences',
  '/configuration': '/settings',
  '/systeme': '/system',
  '/consentement': '/consent',
}

/**
 * Addresses printed before the English rename
 * @type {LegacyRedirect[]}
 */

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  ...NESTED,
  ...Object.entries(ROOTS).flatMap(([source, destination]) => [
    { source, destination },
    { source: `${source}/:path*`, destination: `${destination}/:path*` },
  ]),
]
