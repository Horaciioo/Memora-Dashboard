import { PAGE_ACCESS_COPY } from '@/declarations/pages/copy'

/**
 * Showcase timing
 * @type {{ stepMs: number, introEnd: number, assistantEnd: number, pagesEnd: number, last: number }}
 */

export const SHOWCASE_SETTINGS = {
  stepMs: 800,
  // Last step of each scene
  introEnd: 1,
  assistantEnd: 7,
  pagesEnd: 11,
  last: 15,
} as const

/**
 * First step of each beat
 * @type {Record<string, number>}
 */

export const SHOWCASE_STEPS = {
  offer: 2,
  question: 3,
  reply: 4,
  done: 5,
  row: 6,
  toPrivate: 8,
  create: 9,
  fill: 10,
  share: 12,
  people: 13,
  boom: 14,
  finale: 15,
} as const

/**
 * Showcase sample data
 * @type {Record<string, unknown>}
 */

export const SHOWCASE_COPY = {
  replay: 'Revoir',
  period: 'Du 7 au 8 novembre',
  duration: '2 jours',
  pageName: 'Notes de la semaine',
  heading: 'Priorités',
  bullets: [
    'Valider les absences en attente',
    'Préparer le live de vendredi',
    'Relire le bilan de l’équipe',
  ],
  people: [
    { name: 'Léa', level: PAGE_ACCESS_COPY.edit },
    { name: 'Marc', level: PAGE_ACCESS_COPY.comment },
    { name: 'Anaïs', level: PAGE_ACCESS_COPY.view },
  ],
  // Welcome box
  later: 'Plus tard',
  read: 'Lire la note',
} as const

// Skeleton rows around the real ones
export const SHOWCASE_SKELETONS = { side: 3, sideAfter: 2, rows: 2, tree: 2 } as const
