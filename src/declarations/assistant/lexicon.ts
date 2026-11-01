import { ROUTES } from '@/declarations/navigation'
import type { JournalPeriod } from '@/declarations/system/monitoring/journal'
import type { LogLevelName } from '@/utils/constants/events'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Words an intent listens for
 * @typedef {Object} IntentRule
 * @property {string[]} [verbs] - Action words
 * @property {string[]} [nouns] - Resource words
 * @property {'verb' | 'noun' | 'both' | 'either'} needs - Words required
 */

export interface IntentRule {
  verbs?: readonly string[]
  nouns?: readonly string[]
  needs: 'verb' | 'noun' | 'both' | 'either'
}

// Verbs that make something
const CREATE_VERBS = [
  'cree',
  'creer',
  'creez',
  'creation',
  'ajoute',
  'ajouter',
  'ajoutez',
  'nouvelle',
  'nouveau',
  'assigne',
  'assigner',
  'attribue',
  'donne',
] as const

const TASK_NOUNS = ['tache', 'taches', 'todo', 'task'] as const

/**
 * Words that steer an absence talk, per way in
 * @type {Record<'edit' | 'delete' | 'list', string[]>}
 */

export const ASSISTANT_ABSENCE_MODES = {
  edit: [
    'modifie',
    'modifier',
    'modifies',
    'change',
    'changer',
    'decale',
    'decaler',
    'deplace',
    'deplacer',
    'prolonge',
    'prolonger',
    'rallonge',
    'rallonger',
    'raccourcis',
    'raccourcir',
    'corrige',
    'corriger',
  ],
  delete: [
    'supprime',
    'supprimer',
    'supprimes',
    'retire',
    'retirer',
    'annule',
    'annuler',
    'efface',
    'effacer',
    'enleve',
    'enlever',
  ],
  list: ['liste', 'lister', 'montre', 'affiche', 'consulte', 'consulter', 'quelles', 'combien'],
} as const

// Verbs that start an absence
const ABSENCE_VERBS = [
  ...CREATE_VERBS,
  'pose',
  'poser',
  'poses',
  'declare',
  'declarer',
  'prends',
  'prendre',
  'mets',
  'mettre',
  'signale',
  'signaler',
  'pars',
  'part',
  'partir',
  'suis',
  'serai',
  'vais',
  'absente',
  ...ASSISTANT_ABSENCE_MODES.edit,
  ...ASSISTANT_ABSENCE_MODES.delete,
  ...ASSISTANT_ABSENCE_MODES.list,
] as const

/**
 * Intent rules, read in order
 * @type {Record<string, IntentRule>}
 */

export const ASSISTANT_INTENTS = {
  createTask: { verbs: CREATE_VERBS, nouns: TASK_NOUNS, needs: 'both' },
  absence: {
    verbs: ABSENCE_VERBS,
    nouns: ['absence', 'absences', 'conge', 'conges', 'vacances', 'absent', 'indisponible'],
    needs: 'both',
  },
  filterLogs: {
    nouns: ['log', 'logs', 'journal', 'journaux', 'erreur', 'erreurs'],
    needs: 'noun',
  },
  liveReport: { nouns: ['bilan', 'bilans', 'rapport', 'recap'], needs: 'noun' },
  openLive: { nouns: ['live', 'lives', 'stream', 'streams', 'direct'], needs: 'noun' },
  openTask: { nouns: TASK_NOUNS, needs: 'noun' },
  openProject: { nouns: ['projet', 'projets'], needs: 'noun' },
  findMember: {
    verbs: ['qui'],
    nouns: [
      'fiche',
      'profil',
      'modo',
      'modos',
      'moderateur',
      'moderateurs',
      'moderatrice',
      'membre',
      'membres',
    ],
    needs: 'either',
  },
  navigate: { needs: 'noun' },
} as const satisfies Record<string, IntentRule>

export type AssistantIntentName = keyof typeof ASSISTANT_INTENTS

/**
 * Intent order
 * @type {AssistantIntentName[]}
 */

export const ASSISTANT_INTENT_ORDER = Object.keys(ASSISTANT_INTENTS) as AssistantIntentName[]

/**
 * Words that only steer
 * @type {string[]}
 */

export const ASSISTANT_FILLERS = [
  'va',
  'vas',
  'aller',
  'allons',
  'ouvre',
  'ouvrir',
  'ouvres',
  'affiche',
  'afficher',
  'montre',
  'montrer',
  'emmene',
  'amene',
  'direction',
  'voir',
  'vois',
  'trouve',
  'trouver',
  'cherche',
  'chercher',
  'filtre',
  'filtrer',
  'prepare',
  'preparer',
  'page',
  'est',
  'peux',
  'tu',
  'me',
  'moi',
  'stp',
  'svp',
  'merci',
  'je',
  'veux',
  'voudrais',
  'sur',
  'vers',
] as const

/**
 * Articles and joiners
 * @type {string[]}
 */

export const ASSISTANT_STOPWORDS = [
  'le',
  'la',
  'les',
  'l',
  'de',
  'du',
  'des',
  'd',
  'un',
  'une',
  'mon',
  'ma',
  'mes',
  'ton',
  'ta',
  'tes',
  'son',
  'sa',
  'ses',
  'au',
  'aux',
  'et',
  'en',
  'dans',
  'avec',
  'qui',
  'que',
  'afin',
  'a',
] as const

/**
 * Words pointing back
 * @type {Record<string, 'member' | 'demonstrative'>}
 */

export const ASSISTANT_REFERENCES = {
  lui: 'member',
  elle: 'member',
  il: 'member',
  celui: 'member',
  celle: 'member',
  ce: 'demonstrative',
  cet: 'demonstrative',
  cette: 'demonstrative',
} as const

/**
 * Words naming the latest
 * @type {string[]}
 */

export const ASSISTANT_LATEST = ['dernier', 'derniere', 'precedent', 'recent'] as const

/**
 * Words naming the running one
 * @type {string[][]}
 */

export const ASSISTANT_CURRENT = [['en', 'cours'], ['actuel'], ['maintenant']] as const

/**
 * Markers before an assignee
 * @type {Record<string, boolean>}
 */

export const ASSISTANT_OWNER_MARKERS: Record<string, boolean> = {
  // Strong marker
  pour: true,
  // Weak marker
  a: false,
}

/**
 * Words naming oneself
 * @type {string[]}
 */

export const ASSISTANT_SELF = ['moi', 'me', 'myself'] as const

/**
 * Due date words
 * @type {Record<string, number>}
 */

export const ASSISTANT_DAY_OFFSETS: Record<string, number> = {
  aujourdhui: 0,
  ajd: 0,
  demain: 1,
  apresdemain: 2,
}

/**
 * Weekday names
 * @type {string[]}
 */

export const ASSISTANT_WEEKDAYS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const

/**
 * Units after "dans"
 * @type {Record<string, number>}
 */

export const ASSISTANT_DAY_UNITS: Record<string, number> = {
  jour: 1,
  jours: 1,
  semaine: 7,
  semaines: 7,
}

/**
 * Lengths a period is spoken in
 * @type {Record<string, number>}
 */

export const ASSISTANT_PERIOD_UNITS: Record<string, number> = {
  ...ASSISTANT_DAY_UNITS,
  quinzaine: 15,
  mois: 30,
}

/**
 * Month names and their short forms
 * @type {Record<string, number>}
 */

export const ASSISTANT_MONTHS: Record<string, number> = {
  janvier: 1,
  janv: 1,
  fevrier: 2,
  fevr: 2,
  mars: 3,
  avril: 4,
  avr: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  juil: 7,
  aout: 8,
  septembre: 9,
  sept: 9,
  octobre: 10,
  oct: 10,
  novembre: 11,
  nov: 11,
  decembre: 12,
  dec: 12,
}

/**
 * Answers read as yes, no or a stop
 * @type {{ yes: string[], no: string[], stop: string[] }}
 */

export const ASSISTANT_ANSWERS = {
  yes: ['oui', 'ouais', 'yes', 'yep', 'ok', 'okay', 'accord', 'carrement', 'bien', 'volontiers'],
  no: ['non', 'nan', 'nope', 'no', 'pas', 'aucune', 'aucun', 'rien'],
  stop: ['stop', 'annule', 'annuler', 'laisse', 'tomber', 'oublie', 'quitte'],
} as const

/**
 * Spelled numbers
 * @type {Record<string, number>}
 */

export const ASSISTANT_NUMBERS: Record<string, number> = {
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
}

/**
 * Severity words
 * @type {Record<string, LogLevelName>}
 */

export const ASSISTANT_LOG_LEVELS: Record<string, LogLevelName> = {
  erreur: 'Error',
  erreurs: 'Error',
  error: 'Error',
  errors: 'Error',
  bug: 'Error',
  bugs: 'Error',
  crash: 'Error',
  alerte: 'Warning',
  alertes: 'Warning',
  avertissement: 'Warning',
  avertissements: 'Warning',
  warning: 'Warning',
  warnings: 'Warning',
  info: 'Info',
  infos: 'Info',
  information: 'Info',
  informations: 'Info',
}

/**
 * Period words
 * @type {Record<string, JournalPeriod>}
 */

export const ASSISTANT_LOG_PERIODS: Record<string, JournalPeriod> = {
  aujourdhui: 'day',
  hier: 'day',
  jour: 'day',
  journee: 'day',
  semaine: 'week',
  hebdo: 'week',
  mois: 'month',
  tout: 'all',
  toujours: 'all',
}

/**
 * Markers before a log actor
 * @type {string[]}
 */

export const ASSISTANT_ACTOR_MARKERS = ['de', 'par', 'du'] as const

/**
 * Page reachable by name
 * @typedef {Object} AssistantPage
 * @property {string} href - Destination
 * @property {string} label - Display name
 * @property {string[]} phrases - Folded names
 * @property {PermissionName} [permission] - Gate off the rail
 */

export interface AssistantPage {
  href: string
  label: string
  phrases: readonly string[]
  permission?: PermissionName
}

/**
 * Pages by name
 * @type {AssistantPage[]}
 */

export const ASSISTANT_PAGES: readonly AssistantPage[] = [
  {
    href: ROUTES.dashboard,
    label: 'Accueil',
    phrases: ['accueil', 'tableau de bord', 'dashboard', 'home'],
  },
  { href: ROUTES.absences, label: 'Absences', phrases: ['absences', 'absence', 'conges'] },
  {
    href: ROUTES.changelog,
    label: 'Nouveautés',
    phrases: ['nouveautes', 'patchnote', 'patchnotes', 'changelog', 'mises a jour'],
  },
  { href: ROUTES.play, label: 'Play', phrases: ['play', 'jeux', 'arcade'] },
  { href: ROUTES.calendar, label: 'Calendrier', phrases: ['calendrier', 'agenda', 'planning'] },
  { href: ROUTES.trainings, label: 'Formations', phrases: ['formations', 'formation', 'cours'] },
  { href: ROUTES.members, label: 'Modérateurs', phrases: ['moderateurs', 'modos', 'membres'] },
  { href: ROUTES.projects, label: 'Projets', phrases: ['projets', 'projet'] },
  { href: ROUTES.tasks, label: 'Tâches', phrases: ['taches', 'tache', 'todo'] },
  { href: ROUTES.meetings, label: 'Réunions', phrases: ['reunions', 'reunion', 'meetings'] },
  {
    href: ROUTES.announcements,
    label: 'Communications',
    phrases: ['communications', 'annonces', 'annonce'],
  },
  {
    href: ROUTES.recruitments,
    label: 'Recrutements',
    phrases: ['recrutements', 'recrutement', 'candidats'],
  },
  { href: ROUTES.academy, label: 'Academy', phrases: ['academy', 'academie'] },
  { href: ROUTES.legacy, label: 'Legacy', phrases: ['legacy'] },
  { href: ROUTES.lives, label: 'Lives', phrases: ['lives', 'live', 'streams'] },
  {
    href: ROUTES.sanctions,
    label: 'Panel Twitch',
    phrases: ['panel twitch', 'sanctions', 'twitch'],
  },
  {
    href: ROUTES.discordSanctions,
    label: 'Panel Discord',
    phrases: ['panel discord', 'discord'],
  },
  { href: ROUTES.marsha, label: 'Marsha Bots', phrases: ['marsha', 'bots', 'commandes'] },
  { href: ROUTES.settings, label: 'Configuration', phrases: ['configuration', 'config'] },
  { href: ROUTES.system, label: 'Système', phrases: ['systeme'] },
  {
    href: ROUTES.journal,
    label: 'Logs',
    phrases: ['logs', 'journal'],
    permission: Permissions.AccessManage,
  },
  { href: ROUTES.notifications, label: 'Notifications', phrases: ['notifications', 'notifs'] },
  {
    href: ROUTES.preferences,
    label: 'Paramètres',
    phrases: ['parametres', 'preferences', 'reglages'],
  },
  { href: ROUTES.pages, label: 'Pages privées', phrases: ['pages', 'notes'] },
]

/**
 * Example sentences
 * @type {string[]}
 */

export const ASSISTANT_EXAMPLES = [
  'Crée une tâche pour X : préparer le planning vendredi',
  'Ouvre le calendrier',
  'Bilan du dernier live',
  'Erreurs d’hier dans les logs',
  'Fiche de Procy',
] as const
