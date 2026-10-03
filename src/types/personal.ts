import type { IconName } from '@/declarations/ui/icons'
import type { AttendeeKindName, MeetingAudienceName } from '@/utils/constants/workflow'

/**
 * Birthday shown on the home page
 * @typedef {Object} HomeBirthday
 * @property {string} accountId - Member identifier
 * @property {string} displayName - Member name
 * @property {string | null} avatarUrl - Member portrait
 * @property {string} day - ISO day it falls on
 */

export interface HomeBirthday {
  accountId: string
  displayName: string
  avatarUrl: string | null
  day: string
}

/**
 * Meeting a member is expected at
 * @typedef {Object} HomeMeeting
 * @property {string} id - Meeting identifier
 * @property {string} title - Meeting title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string} scheduledAt - ISO start
 * @property {number | null} durationMin - Length in minutes
 * @property {MeetingAudienceName} audience - Whole team or named seats
 * @property {AttendeeKindName | null} seat - Seat the member holds
 */

export interface HomeMeeting {
  id: string
  title: string
  emoji: string | null
  scheduledAt: string
  durationMin: number | null
  audience: MeetingAudienceName
  seat: AttendeeKindName | null
}

/**
 * Where a home task comes from
 * @typedef {'pimStep' | 'assignTrainer' | 'launchPim' | 'training'} HomeTaskKind
 */

export type HomeTaskKind = 'pimStep' | 'assignTrainer' | 'launchPim' | 'training'

/**
 * One thing the member has to do, computed and never stored
 * @typedef {Object} HomeTask
 * @property {string} key - Stable identifier
 * @property {HomeTaskKind} kind - Where it comes from
 * @property {string} title - What to do
 * @property {string} context - Who or what it concerns
 * @property {IconName} icon - Glyph
 * @property {string} href - Where it gets done, walkthrough included
 * @property {string | null} description - What must happen
 * @property {string | null} guide - Detailed walkthrough, markdown
 * @property {string | null} destinationLabel - Name of the place it opens
 * @property {string | null} dueAt - ISO planned day
 */

export interface HomeTask {
  key: string
  kind: HomeTaskKind
  title: string
  context: string
  icon: IconName
  href: string
  description: string | null
  guide: string | null
  destinationLabel: string | null
  dueAt: string | null
}

/**
 * One line of the home queue, whatever it comes from
 * @typedef {Object} HomeEntry
 * @property {string} key - Stable identifier
 * @property {IconName | null} icon - Glyph when no emoji
 * @property {string | null} emoji - Emoji standing for the entry
 * @property {string} title - What is asked
 * @property {string | null} meta - Who or what it concerns
 * @property {string | null} note - Words the requester left
 * @property {string | null} due - Relative wording of its day
 * @property {HomeAction[]} actions - What the member can do, the first one leading
 */

export interface HomeEntry {
  key: string
  icon: IconName | null
  emoji: string | null
  title: string
  meta: string | null
  note: string | null
  due: string | null
  actions: HomeAction[]
}

/**
 * Button of a home entry, a link or a handler
 * @typedef {Object} HomeAction
 * @property {string} id - Stable identifier
 * @property {string} label - Button text
 * @property {'primary' | 'secondary'} variant - Visual weight
 * @property {string} [href] - Destination when it navigates
 * @property {() => void} [onSelect] - Handler when it acts in place
 */

export interface HomeAction {
  id: string
  label: string
  variant: 'primary' | 'secondary'
  href?: string
  onSelect?: () => void
}
