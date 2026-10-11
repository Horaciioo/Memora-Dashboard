/**
 * What Memora waits for after speaking
 * @typedef {'birthday' | 'celebrate' | 'languages' | 'socials' | 'colorBlind' | 'colorVision' | 'fontScale' | 'theme' | 'ready'} ChatAsk
 */

export type ChatAsk =
  | 'birthday'
  | 'celebrate'
  | 'languages'
  | 'socials'
  | 'colorBlind'
  | 'colorVision'
  | 'fontScale'
  | 'theme'
  | 'ready'
  // The member's own question
  | 'question'

/**
 * Something Memora plays inside the thread between two messages
 * @typedef {'notify' | 'loading'} ChatScene
 */

export type ChatScene = 'notify' | 'loading'

/**
 * Part of the welcome a turn belongs to
 * @typedef {'presentation' | 'information' | 'preferences'} ChatStage
 */

export type ChatStage = 'presentation' | 'information' | 'preferences'

/**
 * Answer a turn waits for before it is played
 * @typedef {'birthday' | 'colorBlind' | 'notColorBlind' | 'colorFit' | 'colorNoFit' | 'noInstagram'} ChatGate
 */

export type ChatGate =
  'birthday' | 'colorBlind' | 'notColorBlind' | 'colorFit' | 'colorNoFit' | 'noInstagram'

/**
 * Memora's lines, then what she plays and the question she waits on
 * @typedef {Object} ChatTurn
 * @property {ChatStage} stage - Part of the welcome it belongs to
 * @property {string[]} say - Messages sent one after the other, `{name}` is the member and `{creator}` their creator, a line naming a missing creator is left out
 * @property {ChatScene} [scene] - Played in the thread once the messages are sent
 * @property {ChatAsk | null} ask - Question asked afterwards, none goes straight on
 * @property {string} [question] - What the member asks, typed and sent for him when the turn asks 'question'
 * @property {ChatGate} [requires] - Answer the turn only makes sense after
 */

export interface ChatTurn {
  stage: ChatStage
  say: string[]
  scene?: ChatScene
  ask: ChatAsk | null
  question?: string
  requires?: ChatGate
}

/**
 * The welcome as Memora tells it: who she is, what she is for, then the questions asked where they belong
 * @type {ChatTurn[]}
 */

export const WELCOME_CHAT: ChatTurn[] = [
  // Presentation
  {
    stage: 'presentation',
    say: ['Salut {name} ! Bienvenue sur Memora.', 'Prêt à découvrir l’application ?'],
    ask: 'question',
    question: 'Salut ! D’abord, explique moi en quoi consiste Memora ?',
  },
  {
    stage: 'presentation',
    say: [
      "Memora c'est une app destinée à l'organisation des équipes, offrir de meilleures expériences à nos Modérateurs, ainsi que les Responsables.",
    ],
    ask: 'question',
    question: 'Et concrètement, ça va me servir à quoi ?',
  },
  {
    stage: 'presentation',
    say: [
      'Son but : que tu modères plus efficacement, que l’équipe communique mieux et que tu perdes moins de temps en clics.',
    ],
    ask: 'question',
    question: 'Tu peux me montrer un exemple ?',
  },
  {
    stage: 'presentation',
    say: [
      'Bien sûr.',
      'Quand tu es en absence, personne ne peut te mentionner ni te notifier. Regarde ce qui se passe si on essaie.',
    ],
    scene: 'notify',
    ask: 'question',
    question: 'Donc personne ne peut me déranger pendant une absence ?',
  },
  {
    stage: 'presentation',
    say: [
      'Exactement. Les responsables prévoient mieux les absences, et ta vie privée est respectée.',
    ],
    ask: 'question',
    question: 'Parfait, et maintenant ?',
  },
  // Information
  {
    stage: 'information',
    say: ['Pour te connaître un peu, quelques questions pour toi. Deux minutes, pas plus.'],
    ask: 'question',
    question: 'Vas-y, je t’écoute !',
  },
  {
    stage: 'information',
    say: ['Commençons par ta date de naissance, quand es-tu né(e) ?'],
    ask: 'birthday',
  },
  {
    stage: 'information',
    say: [
      "Merci ! En ce qui concerne ton anniversaire, tu souhaites que l'équipe te le souhaite ? Ou tu veux plutôt garder ça pour toi ?",
    ],
    ask: 'celebrate',
    requires: 'birthday',
  },
  {
    stage: 'information',
    say: ["C'est noté. Maintenant, quelles langues parles-tu ?"],
    ask: 'languages',
  },
  {
    stage: 'information',
    say: ['Parfait. Passons à tes réseaux sociaux désormais !'],
    ask: 'question',
    question: 'Ça sert à quoi de les partager ?',
  },
  {
    stage: 'information',
    say: [
      'Certains réseaux sont dits « obligatoires ».',
      'D’une part, pour que tu modères.',
      'Ensuite, nous invitons tout le monde dans un canal « Instagram ».',
      'Les autres réseaux sociaux sont optionnels !',
      'Choisis le réseau, je m’occupe du début du lien, il te reste à écrire la fin.',
    ],
    ask: 'socials',
  },
  {
    stage: 'information',
    say: [
      'Pas de souci pour l’instant.',
      'Pense juste à renseigner ton compte Instagram dès que tu l’as : c’est le seul réseau obligatoire.',
    ],
    ask: null,
    requires: 'noInstagram',
  },
  // Preferences
  {
    stage: 'preferences',
    say: ['Passons à tes préférences. Je vais te demander quelques réglages pour ton écran.'],
    ask: 'question',
    question: 'D’accord, je te suis.',
  },
  {
    stage: 'preferences',
    say: ['Es-tu atteint(e) de daltonisme ?'],
    ask: 'colorBlind',
  },
  {
    stage: 'preferences',
    say: [],
    ask: 'question',
    question: 'Tu as des solutions pour moi ?',
    requires: 'colorBlind',
  },
  {
    stage: 'preferences',
    say: [
      'Totalement ! Memora est adaptée pour les personnes atteintes de daltonisme.',
      'Voici ce que je te propose pour le moment :',
    ],
    ask: 'colorVision',
    requires: 'colorBlind',
  },
  {
    stage: 'preferences',
    say: ['Parfait, c’est appliqué !'],
    ask: null,
    requires: 'colorFit',
  },
  {
    stage: 'preferences',
    say: [
      'Merci de ta franchise.',
      'L’équipe s’efforce que toutes les nouveautés, les corrections et autres mouvements dans l’application restent en adéquation avec le confort de tes yeux.',
    ],
    ask: null,
    requires: 'colorNoFit',
  },
  {
    stage: 'preferences',
    say: ['Très bien, passons à la suite dans ce cas.'],
    ask: null,
    requires: 'notColorBlind',
  },
  { stage: 'preferences', say: ['Quelle taille de texte préfères-tu ?'], ask: 'fontScale' },
  {
    stage: 'preferences',
    say: ['C’est appliqué !', 'Désormais, choisis le thème de ton application.'],
    ask: 'theme',
  },
  {
    stage: 'preferences',
    say: [
      'C’est mis !',
      'Garde en tête que tu pourras modifier ceci, depuis ta section paramètres à tout moment.',
    ],
    ask: 'question',
    question: 'Super, et après ça ?',
  },
  {
    stage: 'preferences',
    say: [
      'Je te montre maintenant les pages qui te concernent, une par une. Chacune s’allume quand c’est son tour : clique dessus dans le menu.',
      'Je prépare tout ça.',
    ],
    scene: 'loading',
    ask: 'ready',
  },
]
