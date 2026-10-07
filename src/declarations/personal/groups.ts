import type { IconName } from '@/declarations/ui/icons'

/**
 * How a kind of home task reads once gathered
 * @typedef {Object} TaskGroupOption
 * @property {string} one - Sentence for a single task
 * @property {string} other - Sentence for several, {n} stands for the count
 * @property {string} title - Title of the window walking them
 * @property {IconName} icon - Glyph
 */

export interface TaskGroupOption {
  one: string
  other: string
  title: string
  icon: IconName
}

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
  },
  assignTrainer: {
    one: 'Tu dois attribuer {n} Formateur',
    other: 'Tu dois attribuer {n} Formateurs',
    title: 'Formateurs à attribuer',
    icon: 'tasks',
  },
  launchPim: {
    one: 'Tu peux lancer {n} PIM',
    other: 'Tu peux lancer {n} PIM',
    title: 'PIM à lancer',
    icon: 'tasks',
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
  },
  pimReview: {
    one: 'Tu as {n} bilan de PIM à faire',
    other: 'Tu as {n} bilans de PIM à faire',
    title: 'Bilans de PIM',
    icon: 'tasks',
  },
  pimDecision: {
    one: 'Tu as {n} bilan à trancher',
    other: 'Tu as {n} bilans à trancher',
    title: 'Bilans à trancher',
    icon: 'tasks',
  },
  secondPeriod: {
    one: 'Tu peux lancer {n} période 2',
    other: 'Tu peux lancer {n} périodes 2',
    title: 'Périodes 2 à lancer',
    icon: 'tasks',
  },
  departure: {
    one: 'Tu as {n} départ à annoncer',
    other: 'Tu as {n} départs à annoncer',
    title: 'Départs à annoncer',
    icon: 'tasks',
  },
}
