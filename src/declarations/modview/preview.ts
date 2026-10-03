import type { PreviewSeat } from '@/core/lib/modview/preview'

/**
 * Copy of the Mod View preview
 * @type {Record<string, string>}
 */

export const MODVIEW_PREVIEW_COPY = {
  title: 'Aperçu de la Mod View',
  seat: 'Voir comme',
  level: 'Livecon',
  restart: 'Rejouer la scène',
} as const

/**
 * Seats the preview offers
 * @type {{ value: PreviewSeat, label: string }[]}
 */

export const PREVIEW_SEATS: { value: PreviewSeat; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'RESPONSABLE', label: 'Responsable' },
  { value: 'COORDINATOR', label: 'Coordinateur' },
  { value: 'MODERATEUR', label: 'Modérateur' },
  { value: 'JUNIOR', label: 'Junior' },
]

/**
 * Livecon levels the preview offers
 * @type {{ value: string, label: string }[]}
 */

export const PREVIEW_LEVELS: { value: string; label: string }[] = [
  { value: '3', label: '3' },
  { value: '2', label: '2' },
  { value: '1', label: '1' },
]
