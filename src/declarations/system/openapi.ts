import { APP_NAME, APP_VERSION } from '@/declarations/app'

/**
 * Document identity
 * @type {{ title: string, version: string, description: string }}
 */

export const OPENAPI_INFO = {
  title: `${APP_NAME} API`,
  version: APP_VERSION,
  description: 'Contrat dérivé des fabriques de routes, jamais écrit à la main.',
} as const

/**
 * Standard response lines
 * @type {Record<string, string>}
 */

export const OPENAPI_RESPONSES = {
  success: 'Réussite, enveloppe { success, data }',
  redirect: 'Redirection',
  media: 'Fichier',
  stream: 'Flux d’évènements (text/event-stream)',
  unauthenticated: 'Session absente ou expirée',
  forbidden: 'Permission manquante',
  invalid: 'Champs refusés',
  limited: 'Trop de requêtes',
  failure: 'Erreur interne',
} as const

// Tag of undescribed routes
export const OPENAPI_DEFAULT_TAG = 'api'
