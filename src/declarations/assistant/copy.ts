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
  placeholder: 'Cherche, ou demande : « crée une tâche pour Procy »',
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
  hello: 'Coucou {name} !',
  status: 'Ton assistant parfait.',
  typing: 'Memora écrit',
  close: 'Fermer',
  send: 'Envoyer',
} as const

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
