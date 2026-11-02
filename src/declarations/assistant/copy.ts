/**
 * Assistant replies
 * @type {Record<string, string>}
 */

export const ASSISTANT_COPY = {
  name: 'Memora',
  // Stage of the chat itself
  maturity: 'alpha',
  launcher: 'Demande à Memora…',
  launcherTitle: 'Memora, recherche et actions',
  placeholder: 'Cherche, ou demande : « crée une tâche pour MODO X »',
  paletteRecents: 'Tes dernières pages',
  paletteAsks: 'Demande à Memora',
  paletteGoes: 'Aller à',
  answerPlaceholder: 'Ta réponse…',
  section: 'Memora',
  thinking: 'Memora réfléchit',
  unknown: 'Je n’ai pas bien compris. Essaie par exemple :',
  denied: 'Tu n’as pas l’accès pour ça.',
  failed: 'Ça n’a pas marché : {error}',
  offline: 'Je n’arrive pas à joindre Memora. Réessaie, rien n’a été créé en double.',
  goTo: 'J’ouvre {page}.',
  noSuchPage: 'Je ne trouve pas cette page parmi celles que tu peux ouvrir.',
  notFound: 'Je ne trouve rien qui s’appelle « {name} ».',
  pickOne: 'Plusieurs résultats pour « {name} », lequel ?',
  whoIs: 'De qui parles-tu ?',
  whichOne: 'Laquelle ?',
  openRecord: 'J’ouvre {name}.',
  openPointed: 'J’ouvre la fiche.',
  taskTitle: 'Quel est le titre de la tâche ?',
  taskProject: 'Dans quel projet ?',
  taskReady: 'Je crée cette tâche ?',
  taskCreated: 'C’est fait, la tâche « {title} » est créée.',
  taskOthers: 'Tu ne peux créer une tâche que pour toi, dans un projet où tu es.',
  ownerAway: '{name} est en absence en ce moment, choisis quelqu’un d’autre.',
  noLive: 'Aucun live à afficher pour le moment.',
  liveOpen: 'J’ouvre le live {name}.',
  liveReport: 'J’ouvre le bilan du live {name}.',
  logsOpen: 'J’ouvre les logs filtrés.',
  confirm: 'Créer',
  cancel: 'Annuler',
  answer: 'Valider',
  open: 'Ouvrir',
  back: 'Retour à la recherche',
  hintRun: '↵ pour lancer, Échap pour fermer',
} as const

/**
 * Floating chat welcome
 * @type {Record<string, string>}
 */

export const ASSISTANT_INTRO_COPY = {
  status: 'Ton assistant parfait.',
  typing: 'Memora écrit',
  close: 'Fermer',
  send: 'Envoyer',
} as const

/**
 * First line of the chat, written to the member
 * @typedef {Object} AssistantHello
 * @property {string} text - Line kept, the name is a fictive mention
 * @property {string} [draft] - Line typed first, then wiped
 * @property {readonly [number, number]} [hours] - Hours it fits, [from, to[ wrapping past midnight
 */

export interface AssistantHello {
  text: string
  draft?: string
  hours?: readonly [number, number]
}

/**
 * Welcomes, one drawn each time among those fitting the hour
 * @type {readonly AssistantHello[]}
 */

export const ASSISTANT_HELLOS: readonly AssistantHello[] = [
  { text: 'Coucou @[{name}] !' },
  { text: 'Salut @[{name}] !' },
  { text: 'Hello @[{name}] !' },
  { text: 'Hey @[{name}] !' },
  { text: 'Te revoilà @[{name}] !' },
  { text: 'Content de te voir @[{name}] !' },
  { text: 'Content de te revoir par ici @[{name}] !' },
  { text: 'On est productif aujourd’hui @[{name}] ?' },
  { text: 'Bonjour @[{name}] !', hours: [5, 12] },
  { text: 'Oh, un lève-tôt @[{name}] !', hours: [5, 8] },
  { text: 'Bien dormi @[{name}] ?', hours: [6, 11] },
  {
    draft: 'Envie d’un café...',
    text: 'Une envie de productivité @[{name}] ?',
    hours: [6, 12],
  },
  { text: 'Bon après-midi @[{name}] !', hours: [12, 18] },
  { text: 'Alors @[{name}], cette journée ?', hours: [14, 19] },
  { text: 'Bonsoir @[{name}] !', hours: [18, 22] },
  { text: 'Ah, un couche-tard @[{name}] !', hours: [22, 5] },
  { text: 'En pleine nuit blanche @[{name}] ?', hours: [0, 5] },
  { text: 'Encore debout @[{name}] ?', hours: [23, 4] },
]

/**
 * Line the Memora button says when the Home loads
 * @typedef {Object} AssistantWelcome
 * @property {string} text - Line, {name} stands for the first name
 * @property {readonly [number, number]} [hours] - Hours it fits, [from, to[ wrapping past midnight
 */

export interface AssistantWelcome {
  text: string
  hours?: readonly [number, number]
}

/**
 * Lines of the Home, one drawn each load among those fitting the hour
 * @type {readonly AssistantWelcome[]}
 */

export const ASSISTANT_WELCOMES: readonly AssistantWelcome[] = [
  { text: 'Hey {name}, on bosse sur quoi aujourd’hui ?' },
  { text: 'Salut {name}, content de te revoir par ici.' },
  { text: 'Coucou {name}, qu’est-ce qu’on attaque en premier ?' },
  { text: 'Re {name}, on reprend où tu t’étais arrêté ?' },
  { text: 'Bonjour {name}, un petit café et on s’y met ?', hours: [5, 12] },
  { text: 'Bon après-midi {name}, il reste de quoi bien avancer.', hours: [12, 18] },
  { text: 'Bonsoir {name}, une dernière ligne droite ?', hours: [18, 22] },
  { text: 'Encore debout {name} ? Ne veille pas trop, hein.', hours: [22, 5] },
]

/**
 * Chat openers, one drawn each time
 * @type {readonly string[]}
 */

export const ASSISTANT_GREETINGS = [
  'On te fait faire quoi aujourd’hui ?',
  'Tu veux bosser sur quoi aujourd’hui ?',
  'C’est quoi ton objectif aujourd’hui ?',
  'On attaque quoi aujourd’hui ?',
  'C’est quoi le programme aujourd’hui ?',
  'Par quoi on commence ?',
  'Tu as besoin de quoi aujourd’hui ?',
  'On s’occupe de quoi ensemble ?',
  'Dis-moi tout, on fait quoi ?',
  'Je t’écoute, on avance sur quoi ?',
  'Qu’est-ce que je peux faire pour toi ?',
  'Une idée de ce que tu veux faire ?',
] as const

/**
 * Recognised parameter labels
 * @type {Record<string, string>}
 */

export const ASSISTANT_SLOT_LABELS = {
  title: 'Titre',
  ownerId: 'Pour',
  projectId: 'Projet',
  dueDate: 'Échéance',
  page: 'Page',
  level: 'Niveau',
  period: 'Période',
  actor: 'Acteur',
  live: 'Live',
  member: 'Modérateur',
  task: 'Tâche',
  project: 'Projet',
} as const

export type AssistantSlotKey = keyof typeof ASSISTANT_SLOT_LABELS
