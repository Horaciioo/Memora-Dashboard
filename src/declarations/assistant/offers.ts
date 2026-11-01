import { ROUTES } from '@/declarations/navigation'
import { WorkflowScopes } from '@/utils/constants/workflow'
import type { WorkflowScopeName } from '@/utils/constants/workflow'

/**
 * What Memora offers on a page
 * @typedef {Object} AssistantOffer
 * @property {string} ask - Button question
 * @property {string} href - Page holding the creation
 * @property {string[]} nudges - Lines dropped now and then
 */

export interface AssistantOffer {
  ask: string
  href: string
  nudges: readonly string[]
}

/**
 * Offers per creation button
 * @type {Record<string, AssistantOffer>}
 */

export const ASSISTANT_OFFERS = {
  absence: {
    ask: 'On te déclare une absence ?',
    href: ROUTES.absences,
    nudges: [
      'On te pose une petite absence ?',
      'Tu pars bientôt ? Je te note ça.',
      'Un imprévu ? Je préviens l’équipe pour toi.',
    ],
  },
  event: {
    ask: 'On se prévoit un évènement ?',
    href: ROUTES.calendar,
    nudges: ['On cale un truc dans l’agenda ?', 'Un créneau à bloquer ? Je m’en occupe.'],
  },
  candidate: {
    ask: 'On recrute des p’tits nouveaux ?',
    href: ROUTES.recruitments,
    nudges: ['Un nouveau candidat en vue ?', 'Quelqu’un a postulé ? On l’ajoute.'],
  },
  task: {
    ask: 'Des tâches supplémentaires à faire ?',
    href: ROUTES.tasks,
    nudges: ['On te crée une petite tâche ?', 'Un truc à pas oublier ? Note-le ici.'],
  },
  project: {
    ask: 'On taffe sur un nouveau projet ?',
    href: ROUTES.projects,
    nudges: ['Un nouveau projet en tête ?', 'On lance un projet ensemble ?'],
  },
  meeting: {
    ask: 'On se cale une petite réunion ?',
    href: ROUTES.meetings,
    nudges: ['On cale une réunion ?', 'Besoin de réunir l’équipe ?'],
  },
  announcement: {
    ask: 'On annonce un truc à l’équipe ?',
    href: ROUTES.announcements,
    nudges: ['Un truc à annoncer à l’équipe ?', 'On fait passer un message ?'],
  },
  member: {
    ask: 'On accueille un nouveau modo ?',
    href: ROUTES.members,
    nudges: ['Quelqu’un de nouveau dans l’équipe ?', 'Un modo à accueillir ?'],
  },
  live: {
    ask: 'On s’fait un p’tit live ?',
    href: ROUTES.lives,
    nudges: ['Un live qui arrive ? On l’annonce ?', 'Tu veux prévenir l’équipe d’un live ?'],
  },
} as const satisfies Record<string, AssistantOffer>

/**
 * Offers per work board
 * @type {Record<WorkflowScopeName, AssistantOffer>}
 */

export const WORK_OFFERS: Record<WorkflowScopeName, AssistantOffer> = {
  [WorkflowScopes.Project]: ASSISTANT_OFFERS.project,
  [WorkflowScopes.Task]: ASSISTANT_OFFERS.task,
  [WorkflowScopes.Meeting]: ASSISTANT_OFFERS.meeting,
}

/**
 * Memora button copy
 * @type {{ label: string, placeholder: string, nudges: readonly string[] }}
 */

export const ASSISTANT_DOCK_COPY = {
  label: 'Demande à Memora',
  placeholder: 'Écris à Memora…',
  // Pages without a creation
  nudges: [
    'Besoin d’un coup de main ?',
    'Je suis là si tu as besoin.',
    'Une tâche à créer ? Demande-moi.',
  ],
} as const
