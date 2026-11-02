import type { IconName } from '@/declarations/ui/icons'
import type { HomeTaskKind } from '@/types/personal'

/**
 * How a kind of home task reads once gathered
 * @typedef {Object} TaskGroupOption
 * @property {string} one - Sentence for a single task
 * @property {string} other - Sentence for several, {n} stands for the count
 * @property {string} title - Title of the window walking them
 * @property {IconName} icon - Glyph
 * @property {boolean} [pim] - A step of the PIM: its context reads as a list of facts
 * @property {boolean} [solo] - Walked alone: no counter, no timeline, no previous or next
 */

export interface TaskGroupOption {
  one: string
  other: string
  title: string
  icon: IconName
  pim?: boolean
  solo?: boolean
}

/**
 * Glyph of each fact of a PIM context, in the order it is written: person, promotion, creator
 * @type {IconName[]}
 */

export const PIM_FACT_ICONS: IconName[] = ['members', 'academy', 'youtuber']

/**
 * Separator between the facts of a task context
 * @type {string}
 */

export const CONTEXT_SEPARATOR = ', '

/**
 * Steps of the timeline drawn at once, the others scroll in as the walk moves
 * @type {number}
 */

export const STEPPER_VISIBLE_STEPS = 7

/**
 * Gathered task kinds, by the group key of their entries
 * @type {Record<string, TaskGroupOption>}
 */

export const TASK_GROUPS: Record<string, TaskGroupOption> = {
  coordination: {
    one: 'On te propose de coordonner {n} live',
    other: 'On te propose de coordonner {n} lives',
    title: 'Coordination de lives',
    icon: 'coordinator',
    solo: true,
  },
  absence: {
    one: 'Tu as {n} absence à voir',
    other: 'Tu as {n} absences à voir',
    title: 'Absences à voir',
    icon: 'absences',
  },
  call: {
    one: 'Tu dois répondre à {n} appel de présence',
    other: 'Tu dois répondre à {n} appels de présence',
    title: 'Appels de présence',
    icon: 'meetings',
  },
  pimStep: {
    one: 'Tu as {n} étape de PIM à valider',
    other: 'Tu as {n} étapes de PIM à valider',
    title: 'Étapes de PIM',
    icon: 'clock',
    pim: true,
  },
  assignTrainer: {
    one: 'Tu dois attribuer {n} Formateur',
    other: 'Tu dois attribuer {n} Formateurs',
    title: 'Formateurs à attribuer',
    icon: 'tasks',
    pim: true,
  },
  launchPim: {
    one: 'Tu peux lancer {n} PIM',
    other: 'Tu peux lancer {n} PIM',
    title: 'PIM à lancer',
    icon: 'tasks',
    pim: true,
  },
  training: {
    one: 'Tu as {n} formation à suivre',
    other: 'Tu as {n} formations à suivre',
    title: 'Formations à suivre',
    icon: 'academy',
  },
  declareKickoff: {
    one: 'Tu dois déclarer {n} début de PIM',
    other: 'Tu dois déclarer {n} débuts de PIM',
    title: 'Débuts de PIM à déclarer',
    icon: 'tasks',
    pim: true,
  },
  pimReview: {
    one: 'Tu as {n} bilan de PIM à faire',
    other: 'Tu as {n} bilans de PIM à faire',
    title: 'Bilans de PIM',
    icon: 'tasks',
    pim: true,
  },
  pimDecision: {
    one: 'Tu as {n} bilan à trancher',
    other: 'Tu as {n} bilans à trancher',
    title: 'Bilans à trancher',
    icon: 'tasks',
    pim: true,
  },
  secondPeriod: {
    one: 'Tu peux lancer {n} période 2',
    other: 'Tu peux lancer {n} périodes 2',
    title: 'Périodes 2 à lancer',
    icon: 'tasks',
    pim: true,
  },
  candidateReview: {
    one: 'Tu as {n} bilan candidat à remplir',
    other: 'Tu as {n} bilans candidats à remplir',
    title: 'Bilans candidats',
    icon: 'note',
  },
  mention: {
    one: 'On t’a mentionné dans {n} commentaire',
    other: 'On t’a mentionné dans {n} commentaires',
    title: 'Mentions',
    icon: 'note',
  },
  liveReport: {
    one: 'Tu as {n} bilan de live à voir',
    other: 'Tu as {n} bilans de live à voir',
    title: 'Bilans de live',
    icon: 'modActions',
  },
  task: {
    one: 'Tu as {n} tâche à faire',
    other: 'Tu as {n} tâches à faire',
    title: 'Tâches',
    icon: 'tasks',
  },
  departure: {
    one: 'Tu as {n} départ à annoncer',
    other: 'Tu as {n} départs à annoncer',
    title: 'Départs à annoncer',
    icon: 'tasks',
  },
}

/**
 * Kinds of home task the timeline mirrors into the task board
 * @type {readonly HomeTaskKind[]}
 */

export const SYSTEM_TASK_KINDS: readonly HomeTaskKind[] = [
  'assignTrainer',
  'launchPim',
  'declareKickoff',
  'pimDecision',
  'secondPeriod',
  'pimReview',
  'training',
  'candidateReview',
]

/**
 * Kinds of home task that also sit on the task board
 * @type {readonly HomeTaskKind[]}
 */

export const BOARD_TASK_KINDS: readonly HomeTaskKind[] = [...SYSTEM_TASK_KINDS, 'task']
