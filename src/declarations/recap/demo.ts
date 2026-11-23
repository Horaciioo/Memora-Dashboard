import type { NotificationTargetName } from '@/declarations/notifications/targets'
import type { RecapBeatName } from '@/declarations/recap/beats'
import type { RecapFigure, RecapPerson } from '@/types/recap'
import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * Made-up members of the dev recap
 * @type {RecapPerson[]}
 */

export const DEMO_PEOPLE: RecapPerson[] = [
  { id: 'demo-lea', name: 'Léa', avatar: null },
  { id: 'demo-hugo', name: 'Hugo', avatar: null },
  { id: 'demo-ines', name: 'Inès', avatar: null },
  { id: 'demo-sam', name: 'Sam', avatar: null },
  { id: 'demo-noor', name: 'Noor', avatar: null },
]

/**
 * One made-up movement, its moment given as hours before now
 * @typedef {Object} DemoMove
 * @property {RecapBeatName} beat - Kind of movement
 * @property {NotificationKindName} [alert] - Notification kind behind an alert
 * @property {number} hoursAgo - Age of the movement
 * @property {string[]} actors - Names of the members behind it
 * @property {number} count - Occurrences folded in
 * @property {NotificationTargetName | null} target - Record kind
 * @property {string | null} subject - Record title
 * @property {RecapFigure[]} [figures] - Tally
 */

export interface DemoMove {
  beat: RecapBeatName
  alert?: NotificationKindName
  hoursAgo: number
  actors: string[]
  count: number
  target: NotificationTargetName | null
  subject: string | null
  figures?: RecapFigure[]
}

/**
 * Movements of the dev recap, one of each weight and each source
 * @type {DemoMove[]}
 */

export const DEMO_MOVES: DemoMove[] = [
  {
    beat: 'alert',
    alert: 'Mentioned',
    hoursAgo: 3,
    actors: ['Léa'],
    count: 2,
    target: 'task',
    subject: 'Refaire le règlement du Discord',
  },
  {
    beat: 'comments',
    hoursAgo: 4,
    actors: ['Léa', 'Hugo'],
    count: 5,
    target: 'task',
    subject: 'Refaire le règlement du Discord',
    figures: [{ key: 'comments', count: 5 }],
  },
  {
    beat: 'alert',
    alert: 'MeetingRequested',
    hoursAgo: 9,
    actors: ['Inès'],
    count: 1,
    target: 'meeting',
    subject: 'Point mensuel',
  },
  {
    beat: 'absencesWaiting',
    hoursAgo: 0,
    actors: ['Sam', 'Noor', 'Hugo'],
    count: 3,
    target: 'absence',
    subject: null,
  },
  {
    beat: 'rollCallPresent',
    hoursAgo: 14,
    actors: ['Léa', 'Hugo', 'Inès', 'Sam'],
    count: 4,
    target: 'calendar',
    subject: 'Live de ce soir',
  },
  {
    beat: 'rollCallAbsent',
    hoursAgo: 15,
    actors: ['Noor'],
    count: 1,
    target: 'calendar',
    subject: 'Live de ce soir',
  },
  {
    beat: 'comments',
    hoursAgo: 17,
    actors: ['Hugo'],
    count: 1,
    target: 'calendar',
    subject: 'Réunion de la semaine',
  },
  {
    beat: 'edited',
    hoursAgo: 20,
    actors: ['Inès'],
    count: 1,
    target: 'project',
    subject: 'Refonte des bilans',
  },
  {
    beat: 'pageShared',
    hoursAgo: 26,
    actors: ['Sam'],
    count: 1,
    target: 'page',
    subject: 'Guide du nouveau modérateur',
  },
  {
    beat: 'comments',
    hoursAgo: 30,
    actors: ['Noor'],
    count: 2,
    target: 'page',
    subject: 'Guide du nouveau modérateur',
    figures: [{ key: 'comments', count: 2 }],
  },
  {
    beat: 'alert',
    alert: 'AccessChanged',
    hoursAgo: 40,
    actors: [],
    count: 1,
    target: null,
    subject: null,
  },
  {
    beat: 'alert',
    alert: 'LiveAnnounced',
    hoursAgo: 52,
    actors: ['Hugo'],
    count: 1,
    target: 'live',
    subject: 'Soirée spéciale',
  },
  {
    beat: 'alert',
    alert: 'CommunicationPublished',
    hoursAgo: 60,
    actors: ['Léa'],
    count: 1,
    target: 'project',
    subject: 'Annonce du nouveau planning',
  },
]
