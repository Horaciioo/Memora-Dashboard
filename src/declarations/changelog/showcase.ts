import { PAGE_ACCESS_COPY } from '@/declarations/pages/copy'

/**
 * Showcase timing and size
 * @type {{ stepMs: number, introEnd: number, typeMs: number, last: number, sceneEnds: number[], width: number, height: number, railRows: number }}
 */

export const SHOWCASE_SETTINGS = {
  // One step is one second
  stepMs: 1000,
  introEnd: 1,
  // Time to write a line
  typeMs: 800,
  last: 17,
  // Last step of the first two beats
  sceneEnds: [8, 13],
  // Size of the mock dashboard before it is scaled
  width: 1280,
  height: 760,
  // Entries of the rail
  railRows: 13,
} as const

/**
 * First step of each beat
 * @type {Record<string, number>}
 */

export const SHOWCASE_STEPS = {
  offer: 2,
  open: 3,
  type: 4,
  send: 5,
  done: 6,
  row: 7,
  goPrivate: 8,
  private: 9,
  goNew: 10,
  create: 11,
  fill: 12,
  goShare: 13,
  share: 14,
  search: 15,
  pick: 16,
  finale: 17,
} as const

/**
 * Where the pointer goes at a step, and whether it clicks
 * @type {Record<number, { target: string, isClick?: boolean }>}
 */

export const SHOWCASE_CURSOR: Record<number, { target: string; isClick?: boolean }> = {
  [SHOWCASE_STEPS.offer]: { target: 'fab' },
  [SHOWCASE_STEPS.open]: { target: 'fab', isClick: true },
  [SHOWCASE_STEPS.type]: { target: 'input' },
  [SHOWCASE_STEPS.send]: { target: 'send', isClick: true },
  [SHOWCASE_STEPS.row]: { target: 'row' },
  [SHOWCASE_STEPS.goPrivate]: { target: 'section-private' },
  [SHOWCASE_STEPS.private]: { target: 'section-private', isClick: true },
  [SHOWCASE_STEPS.goNew]: { target: 'new-page' },
  [SHOWCASE_STEPS.create]: { target: 'new-page', isClick: true },
  [SHOWCASE_STEPS.goShare]: { target: 'share-button' },
  [SHOWCASE_STEPS.share]: { target: 'share-button', isClick: true },
  [SHOWCASE_STEPS.search]: { target: 'suggestion' },
  [SHOWCASE_STEPS.pick]: { target: 'suggestion', isClick: true },
}

/**
 * Showcase sample data
 * @type {Record<string, unknown>}
 */

export const SHOWCASE_COPY = {
  replay: 'Revoir',
  pause: 'Pause',
  seek: 'Position de la vidéo',
  play: 'Lecture',
  period: 'Du 7 au 17 novembre',
  duration: '11 jours',
  days: '11',
  range: 'du 7 au 17 novembre',
  pageName: 'Notes de la semaine',
  heading: 'Priorités',
  bullets: [
    'Valider les absences en attente',
    'Préparer le live de vendredi',
    'Relire le bilan de l’équipe',
  ],
  owner: 'MODO Y',
  search: 'MODO',
  people: [
    { name: 'MODO X', initial: 'X', level: PAGE_ACCESS_COPY.edit },
    { name: 'MODO Z', initial: 'Z', level: PAGE_ACCESS_COPY.comment },
    { name: 'MODO A', initial: 'A', level: PAGE_ACCESS_COPY.view },
  ],
  // Welcome box
  later: 'Plus tard',
  read: 'Lire la note',
} as const

// Skeleton rows around the real ones
export const SHOWCASE_SKELETONS = { rows: 2 } as const
