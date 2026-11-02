import type { PresenceStatus } from '@/types/presence'

/**
 * Copy of live presence
 * @type {Record<string, string>}
 */

export const PRESENCE_COPY = {
  label: 'Personnes sur la page',
  invalid: 'Présence illisible.',
  invalidChange: 'Modification illisible.',
  uncertain: 'Présence à confirmer, reconnexion…',
  down: 'Collaboration en direct indisponible, tes modifications restent enregistrées',
  position: 'sur « {block} »',
  positionEmpty: 'sur un bloc vide',
  jump: 'Rejoindre {name}',
  listSeparator: ', ',
  separator: ' · ',
} as const

/**
 * Wording per status
 * @type {Record<PresenceStatus, string>}
 */

export const PRESENCE_STATUS_COPY: Record<PresenceStatus, string> = {
  active: 'Sur la page',
  idle: 'En pause',
  left: 'Vient de partir',
}

/**
 * Caret colours, one per member, never green
 * @type {string[]}
 */

export const PRESENCE_TINTS = [
  'var(--color-brand-600)',
  'var(--color-sky-600)',
  'var(--color-mauve-600)',
  'var(--color-apple-orange)',
  'var(--color-twitch)',
  'var(--color-gold-400)',
]
