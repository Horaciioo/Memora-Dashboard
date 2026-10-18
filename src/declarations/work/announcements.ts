import type { CommunicationStatus } from '@prisma/client'

import type { FieldOption } from '@/types/forms'
import type { AnnouncementSource } from '@/types/work'

/**
 * Query parameter that opens a file straight on its announcement
 * @type {string}
 */

export const ANNOUNCEMENT_PARAM = 'annonce'

/**
 * Copy of the announcements page
 * @type {Record<string, string>}
 */

export const ANNOUNCEMENT_COPY = {
  title: 'Communications',
  heroDescription: 'Tout ce qui s’annonce',
  lead: 'Une annonce, un statut, une plateforme.',
  add: 'Créer une annonce',
  preview: 'Aperçu',
  free: 'Sans projet',
  emptyTitle: 'Aucune annonce pour le moment.',
  filterTitle: 'Aucune annonce ne correspond',
  filterDescription: 'Élargis ou retire les filtres en cours.',
  deleteTitle: 'Souhaite-tu supprimer cette annonce ?',
  deleteDescription: 'Le texte est perdu définitivement.',
  missingStates: 'Aucun statut disponible.',
  departure: 'Départ',
  interviews: 'Annonce des entretiens',
  markAnnounced: 'Marquer comme annoncée',
  announced: 'Annonce enregistrée',
} as const

/**
 * Singular label and gender of an announcement
 * @type {{ label: string, gender: 'feminine' }}
 */

export const ANNOUNCEMENT_ENTITY = { label: 'Annonce', gender: 'feminine' } as const

/**
 * Filter and page option copy
 * @type {Record<string, string>}
 */

export const ANNOUNCEMENT_FILTER_COPY = {
  owner: 'Auteur',
  allOwners: 'Toutes les annonces',
  mine: 'Mes annonces',
  status: 'Statut',
  allStatuses: 'Tous les statuts',
  platform: 'Plateforme',
  allPlatforms: 'Toutes les plateformes',
  project: 'Projet',
  allProjects: 'Tous les projets',
  withProject: 'Avec projet',
  withoutProject: 'Sans projet',
  linkage: 'Rattachement',
  everything: 'Tout',
  showPublished: 'Afficher les publiées',
  showCancelled: 'Afficher les annulées',
} as const

/**
 * Group heading and glyph of each source
 * @type {Record<AnnouncementSource, { label: string, singular: string, icon: string }>}
 */

export const ANNOUNCEMENT_SOURCES: Record<
  AnnouncementSource,
  { label: string; singular: string; icon: string }
> = {
  project: { label: 'Projets', singular: 'Projet', icon: 'projects' },
  free: { label: 'Libres', singular: 'Annonce', icon: 'communications' },
  departure: { label: 'Départs', singular: 'Départ', icon: 'members' },
  recruitment: { label: 'Recrutements', singular: 'Recrutement', icon: 'recruitment' },
}

/**
 * Label and colour of each announcement status, in board order
 * @type {Record<CommunicationStatus, { label: string, accent: string }>}
 */

export const COMMUNICATION_STATUSES: Record<
  CommunicationStatus,
  { label: string; accent: string }
> = {
  PLANNED: { label: 'Prévue', accent: 'neutral' },
  WRITING: { label: 'En cours d’écriture', accent: 'caution' },
  WRITTEN: { label: 'Écrite', accent: 'info' },
  PUBLISHED: { label: 'Publiée', accent: 'success' },
  CANCELLED: { label: 'Annulée', accent: 'danger' },
}

/**
 * Statuses a finished announcement rests in
 * @type {readonly CommunicationStatus[]}
 */

export const COMMUNICATION_STATUS_ORDER = Object.keys(
  COMMUNICATION_STATUSES
) as CommunicationStatus[]

/**
 * Status choices of the announcement form and filter
 * @type {FieldOption[]}
 */

export const COMMUNICATION_STATUS_OPTIONS: FieldOption[] = COMMUNICATION_STATUS_ORDER.map(
  (status) => ({
    value: status,
    label: COMMUNICATION_STATUSES[status].label,
    accent: COMMUNICATION_STATUSES[status].accent,
    isDefault: status === 'PLANNED',
  })
)
