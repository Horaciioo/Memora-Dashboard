import type { AnnouncementRow, AnnouncementSource } from '@/types/work'

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
  emptyTitle: 'Aucune communication annoncée',
  emptyDescription:
    'Les annonces Discord rédigées dans Memora arrivent ici dès qu’elles sont annoncées.',
  departure: 'Départ',
  interviews: 'Annonce des entretiens',
  markAnnounced: 'Marquer comme annoncée',
  announced: 'Annonce enregistrée',
} as const

/**
 * Group heading and glyph of each source
 * @type {Record<AnnouncementSource, { label: string, icon: string }>}
 */

export const ANNOUNCEMENT_SOURCES: Record<
  AnnouncementSource,
  { label: string; singular: string; icon: string }
> = {
  project: { label: 'Projets', singular: 'Projet', icon: 'projects' },
  departure: { label: 'Départs', singular: 'Départ', icon: 'members' },
  recruitment: { label: 'Recrutements', singular: 'Recrutement', icon: 'recruitment' },
}

/**
 * Board columns, one per state
 * @type {Record<AnnouncementRow['state'], { label: string, accent: string }>}
 */

export const ANNOUNCEMENT_STATES: Record<
  AnnouncementRow['state'],
  { label: string; accent: string }
> = {
  draft: { label: 'À annoncer', accent: 'caution' },
  announced: { label: 'Annoncée', accent: 'success' },
}
