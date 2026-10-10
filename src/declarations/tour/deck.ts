import type { IconName } from '@/declarations/ui/icons'

/**
 * One card of the presentation
 * @typedef {Object} DeckPage
 * @property {string} title - Card title
 * @property {string[]} [body] - Paragraphs
 * @property {{ glyph: IconName, text: string }[]} [rows] - Glyph on the left
 * @property {'notify' | 'loading'} [scene] - Animation under the text
 */

export interface DeckPage {
  title: string
  body?: string[]
  rows?: { glyph: IconName; text: string }[]
  scene?: 'notify' | 'loading'
}

/**
 * Presentation shown once the admission is done
 * @type {DeckPage[]}
 */

export const WELCOME_DECK: DeckPage[] = [
  {
    title: 'Bienvenue sur Memora !',
    body: [
      'Cette web-application est destinée aux équipes de modération, aux équipes internes des influenceurs, ainsi qu’aux créateurs. Memora est entièrement gratuite et donne un accès intégral à toutes les fonctionnalités, sans surcoût ni publicité.',
      'Avec elle, tu seras plus efficace, avec moins d’efforts et moins de tâches pénibles.',
    ],
  },
  {
    title: 'Concrètement, à quoi elle te servira',
    body: ['Memora est remplie de systèmes automatisés qui te serviront à :'],
    rows: [
      { glyph: 'shield', text: 'Modérer plus efficacement.' },
      { glyph: 'chat', text: 'Améliorer la communication.' },
      { glyph: 'flash', text: 'Réduire tes clics.' },
    ],
  },
  {
    title: 'Un exemple : tes absences',
    body: [
      'Les responsables peuvent mieux coordonner et prévoir tes absences. Ta vie privée est mieux respectée : il n’est pas possible de te mentionner ni de te notifier pendant une absence.',
    ],
    scene: 'notify',
  },
  {
    title: 'Passons aux pages qui te concernent',
    body: [
      'Je te les montre une par une. Chaque page s’allume quand c’est son tour : clique dessus dans le menu pour en faire le tour.',
    ],
    scene: 'loading',
  },
]

/**
 * Task whose assignee is in absence, as the example draws it
 * @type {{ project: string, task: string, assignLabel: string, notify: string, absentTag: string, refusal: string, members: { name: string, isAbsent: boolean }[] }}
 */

export const NOTIFY_DEMO = {
  project: 'Live de ce soir',
  task: 'Préparer le live',
  assignLabel: 'Assigner à',
  notify: 'Notifier',
  absentTag: 'En absence jusqu’à vendredi',
  refusal: 'Modo X est en absence : il ne peut pas être notifié.',
  members: [
    { name: 'Alex', isAbsent: false },
    { name: 'Modo X', isAbsent: true },
  ],
} as const
