import { ROUTES } from '@/declarations/navigation'
import type { NotificationTargetName } from '@/declarations/notifications/targets'

/**
 * Place of Memora a recap chapter speaks about
 * @type {string}
 */

export type RecapChapterName =
  | 'tasks'
  | 'projects'
  | 'meetings'
  | 'events'
  | 'absences'
  | 'pages'
  | 'academy'
  | 'recruitment'
  | 'unban'
  | 'around'

/**
 * Part of a chapter, told under its own small title when the chapter holds several
 * @type {string}
 */

export type RecapSectionName = 'rollCalls' | 'lives' | 'calendar'

/**
 * Title of every section
 * @type {Record<RecapSectionName, string>}
 */

export const RECAP_SECTIONS: Record<RecapSectionName, string> = {
  rollCalls: 'Appels de présence',
  lives: 'Lives',
  calendar: 'Calendrier',
}

/**
 * Section each kind of record is told in, when its chapter has several
 * @type {Partial<Record<NotificationTargetName, RecapSectionName>>}
 */

export const SECTION_OF_TARGET: Partial<Record<NotificationTargetName, RecapSectionName>> = {
  live: 'lives',
  liveReport: 'lives',
  calendar: 'calendar',
}

/**
 * Title of every chapter
 * @type {Record<RecapChapterName, string>}
 */

export const RECAP_CHAPTERS: Record<RecapChapterName, string> = {
  tasks: 'Tes tâches',
  projects: 'Tes projets',
  meetings: 'Tes réunions',
  events: 'Tes événements',
  absences: 'Les absences',
  pages: 'Tes pages',
  academy: 'La formation',
  recruitment: 'Le recrutement',
  unban: 'Les débans',
  around: 'Autour de toi',
}

/**
 * Chapter each kind of record is told in
 * @type {Record<NotificationTargetName, RecapChapterName>}
 */

export const CHAPTER_OF_TARGET: Record<NotificationTargetName, RecapChapterName> = {
  task: 'tasks',
  home: 'tasks',
  project: 'projects',
  meeting: 'meetings',
  calendar: 'events',
  live: 'events',
  liveReport: 'events',
  absence: 'absences',
  page: 'pages',
  training: 'academy',
  legacy: 'academy',
  junior: 'academy',
  recruitment: 'recruitment',
  unbanRequest: 'unban',
  member: 'around',
  team: 'around',
  identity: 'around',
  playGame: 'around',
  playGroup: 'around',
}

/**
 * Page each chapter is told on
 * @type {Record<RecapChapterName, string>}
 */

export const RECAP_CHAPTER_PAGES: Record<RecapChapterName, string> = {
  tasks: ROUTES.tasks,
  projects: ROUTES.projects,
  meetings: ROUTES.meetings,
  events: ROUTES.lives,
  absences: ROUTES.absences,
  pages: ROUTES.pages,
  academy: ROUTES.academy,
  recruitment: ROUTES.recruitments,
  unban: ROUTES.unban,
  around: ROUTES.members,
}

/**
 * Title of the strip Memora shows while she takes the member to a chapter
 * @type {Record<RecapChapterName, string>}
 */

export const RECAP_CHAPTER_GO: Record<RecapChapterName, string> = {
  tasks: 'En ce qui concerne tes tâches, tu as :',
  projects: 'En ce qui concerne tes projets, tu as :',
  meetings: 'En ce qui concerne tes réunions, tu as :',
  events: 'En ce qui concerne tes événements, tu as :',
  absences: 'En ce qui concerne les absences, tu as :',
  pages: 'En ce qui concerne tes pages, tu as :',
  academy: 'En ce qui concerne la formation, tu as :',
  recruitment: 'En ce qui concerne le recrutement, tu as :',
  unban: 'En ce qui concerne les débans, tu as :',
  around: 'Autour de toi, tu as :',
}

/**
 * Line shown while Memora gets a chapter ready
 * @type {Record<RecapChapterName, string>}
 */

export const RECAP_CHAPTER_PREPARING: Record<RecapChapterName, string> = {
  tasks: 'Je te prépare tes tâches',
  projects: 'Je te prépare tes projets',
  meetings: 'Je te prépare tes réunions',
  events: 'Je te prépare tes événements',
  absences: 'Je te prépare les absences',
  pages: 'Je te prépare tes pages',
  academy: 'Je te prépare la formation',
  recruitment: 'Je te prépare le recrutement',
  unban: 'Je te prépare les débans',
  around: 'Je te prépare ce qui se passe autour de toi',
}
