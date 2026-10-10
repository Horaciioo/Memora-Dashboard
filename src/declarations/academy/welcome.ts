import type { IconName } from '@/declarations/ui/icons'

/**
 * One-time guides a member sees once
 * @type {Record<string, string>}
 */

export const GUIDE_KEYS = {
  trainingsWelcome: 'formations-welcome',
  specialisations: 'specialisations-ouvertes',
  tourIntro: 'visite-presentation',
  tourSkipped: 'visite-passee',
  tourDone: 'visite-terminee',
} as const

export type GuideKey =
  (typeof GUIDE_KEYS)[keyof typeof GUIDE_KEYS] | `live-started:${string}` | `tour-page:${string}`

/**
 * Identifier of the first visit in the course catalogue
 * @type {string}
 */

export const TOUR_COURSE_ID = 'tour-memora'

/**
 * One-time bubble key of a live that started
 * @param {string} liveId - Live
 * @return {GuideKey} - Guide key
 */

export const liveStartedKey = (liveId: string): GuideKey => `live-started:${liveId}`

/**
 * One-time key of a page the first visit explained
 * @param {string} route - Page route
 * @return {GuideKey} - Guide key
 */

export const tourPageKey = (route: string): GuideKey => `tour-page:${route}`

/**
 * One page of the trainings welcome
 * @typedef {Object} WelcomePage
 * @property {string} title - Page title
 * @property {{ glyph: IconName, text: string }[]} [rows] - Glyph on the left
 * @property {string[]} [body] - Paragraphs
 */

export interface WelcomePage {
  title: string
  rows?: { glyph: IconName; text: string }[]
  body?: string[]
}

/**
 * Welcome of the trainings page
 * @type {readonly WelcomePage[]}
 */

export const TRAININGS_WELCOME: readonly WelcomePage[] = [
  {
    title: 'Bienvenue sur la Page des Formations.',
    rows: [
      {
        glyph: 'academy',
        text: 'Dans cette page, tu vas pouvoir apprendre toutes les pratiques de ta fonction. Tout est entièrement automatisé, tu n’auras qu’à t’exercer autant que tu voudras.',
      },
      {
        glyph: 'objective',
        text: 'Tu pourras suivre la progression de tes formations directement via une timeline qui se trouve en haut de ton écran.',
      },
      {
        glyph: 'stream',
        text: 'Chaque formation est munie d’illustrations, d’exercices, ou de cas d’étude qui te permettent d’avoir un visuel. Chacun d’entre eux peut être réalisé autant de fois que tu le souhaites.',
      },
    ],
  },
  {
    title: 'Avance à ton rythme',
    body: [
      'Ton parcours, c’est ton parcours. Prends le temps qu’il te faut. Va à ton rythme. Rien n’est pressant, ce qui importe c’est que tu sois à l’aise sur ta fonction et que celle-ci n’en devienne pas un fardeau.',
      'Si tu as la moindre question, consulte ton Formateur, il saura y répondre.',
    ],
  },
  {
    title: 'Ce qui est prévu pour toi',
    body: [
      'En tout, {count} formations dites obligatoires sont prévues pour toi. Il s’agit des connaissances nécessaires pour modérer sur {trade}. Tu pourras également te perfectionner à l’avenir si tu souhaites te spécialiser, ou étendre ton savoir-faire.',
    ],
  },
]

/**
 * Buttons of the welcome
 * @type {Record<string, string>}
 */

export const TRAININGS_WELCOME_COPY = {
  next: 'Page suivante',
  previous: 'Page précédente',
  finish: 'J’ai compris et souhaite démarrer mon parcours',
  label: 'Bienvenue sur les Formations',
} as const
