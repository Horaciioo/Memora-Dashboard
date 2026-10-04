import { createRegistry } from '@/core/lib/registry'
import { ROUTES } from '@/declarations/navigation'

/**
 * Kind of record a notification points at
 * @type {string}
 */

export type NotificationTargetName =
  | 'task'
  | 'project'
  | 'meeting'
  | 'member'
  | 'recruitment'
  | 'team'
  | 'absence'
  | 'training'
  | 'calendar'
  | 'legacy'
  | 'live'
  | 'liveReport'
  | 'junior'
  | 'home'

/**
 * Where one notification leads
 * @typedef {Object} NotificationTargetOption
 * @property {string} label - What the destination is called
 * @property {(id: string | null) => string | null} route - Destination builder
 */

interface NotificationTargetOption {
  label: string
  route: (id: string | null) => string | null
}

/*
 * A notification stores its target as a kind and an identifier, never a resolved path — the
 * route is rebuilt on read, so moving a page never leaves a stale link behind in the table.
 */

const NOTIFICATION_TARGET_MAP: Record<NotificationTargetName, NotificationTargetOption> = {
  task: { label: 'la tâche', route: (id) => (id ? ROUTES.task(id) : null) },
  project: { label: 'le projet', route: (id) => (id ? ROUTES.project(id) : null) },
  meeting: { label: 'la réunion', route: (id) => (id ? ROUTES.meeting(id) : null) },
  member: { label: 'le modérateur', route: (id) => (id ? ROUTES.member(id) : null) },
  recruitment: { label: 'le recrutement', route: (id) => (id ? ROUTES.recruitment(id) : null) },
  team: { label: 'les équipes', route: () => ROUTES.teams },
  absence: { label: 'les absences', route: () => ROUTES.absences },
  training: { label: 'les formations', route: () => ROUTES.trainings },
  legacy: {
    label: 'le parcours Legacy',
    route: (id) => (id ? ROUTES.legacyTrack(id) : ROUTES.legacy),
  },
  live: { label: 'le live', route: (id) => (id ? ROUTES.live(id) : ROUTES.lives) },
  liveReport: { label: 'le bilan', route: (id) => (id ? ROUTES.liveReport(id) : ROUTES.lives) },
  // Junior target identifier is "sessionId/juniorId"
  junior: {
    label: 'la fiche du Junior',
    route: (id) => (id ? ROUTES.session(id) : ROUTES.academy),
  },
  home: { label: 'tes tâches', route: () => ROUTES.home },
  calendar: {
    label: 'le calendrier',
    route: (id) => (id ? ROUTES.calendarEvent(id) : ROUTES.calendar),
  },
}

export const NOTIFICATION_TARGETS = createRegistry(NOTIFICATION_TARGET_MAP)

/**
 * Target identifier of a junior file
 * @param {string} sessionId - Promotion
 * @param {string} juniorId - Junior seat
 * @return {string} - Identifier the junior target reads back
 */

export const juniorTargetId = (sessionId: string, juniorId: string): string =>
  `${sessionId}/${juniorId}`
