/**
 * Showcase timing
 * @type {{ stepMs: number, assistantEnd: number, pagesEnd: number, last: number }}
 */

export const SHOWCASE_SETTINGS = {
  stepMs: 650,
  // Last step of each scene
  assistantEnd: 5,
  pagesEnd: 10,
  last: 13,
} as const

/**
 * Showcase copy
 * @type {Record<string, string | string[]>}
 */

export const SHOWCASE_COPY = {
  title: 'La version en quelques images',
  replay: 'Revoir',
  captions: [
    'Tu parles à Memora, elle remplit à ta place.',
    'Une page à toi, qui se remplit en un instant.',
    'Tu invites qui tu veux, et c’est partagé.',
  ],
  userLine: 'Je serai absent ce week-end',
  memoraLine: 'Du 7 au 8 novembre, c’est bien ça ?',
  yes: 'Oui',
  no: 'Non',
  absenceTitle: 'Absence du 7 au 8 novembre',
  absenceDone: 'Déclarée',
  shared: 'Partagé',
  private: 'Privé',
  newPage: 'Nouvelle page',
  pageTitle: 'Notes de la semaine',
  invite: 'Inviter',
  invited: 'Partagée avec 3 membres',
  initials: ['L', 'M', 'A'],
} as const
