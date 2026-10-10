/**
 * What Memora waits for after speaking
 * @typedef {'birthday' | 'celebrate' | 'languages' | 'theme' | 'fontScale' | 'colorVision' | 'ready'} ChatAsk
 */

export type ChatAsk =
  'birthday' | 'celebrate' | 'languages' | 'theme' | 'fontScale' | 'colorVision' | 'ready'

/**
 * Memora's lines, then the question she waits on
 * @typedef {Object} ChatTurn
 * @property {string[]} say - Messages sent one after the other, `{name}` is the member
 * @property {ChatAsk | null} ask - Question asked afterwards, none goes straight on
 * @property {'birthday'} [requires] - Answer the turn only makes sense after
 */

export interface ChatTurn {
  say: string[]
  ask: ChatAsk | null
  requires?: 'birthday'
}

/**
 * The admission, as Memora tells it
 * @type {ChatTurn[]}
 */

export const WELCOME_CHAT: ChatTurn[] = [
  {
    say: [
      'Salut {name}, moi c’est Memora.',
      'C’est ta première connexion. Avant de te montrer l’application, j’ai quelques questions : ça prend deux minutes.',
    ],
    ask: null,
  },
  { say: ['Pour commencer, quelle est ta date de naissance ?'], ask: 'birthday' },
  {
    say: ['Merci. Tu veux que l’équipe te la souhaite ?'],
    ask: 'celebrate',
    requires: 'birthday',
  },
  { say: ['Quelles langues parles-tu ?'], ask: 'languages' },
  { say: ['Passons à l’affichage. Quel thème préfères-tu ?'], ask: 'theme' },
  { say: ['Et la taille du texte ?'], ask: 'fontScale' },
  {
    say: ['Dernière question : as-tu une vision des couleurs particulière ? Je peux les adapter.'],
    ask: 'colorVision',
  },
  {
    say: [
      'C’est noté. Tu pourras tout changer plus tard dans les paramètres.',
      'Je te présente Memora ?',
    ],
    ask: 'ready',
  },
]
