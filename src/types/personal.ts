import type { ReactNode } from 'react'
import type { IconName } from '@/declarations/ui/icons'

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
 * Entry the calendar plans next
 * @typedef {Object} HomePlanned
 * @property {string} id - Entry identifier
 * @property {string} title - Entry title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string} startsAt - ISO start
 * @property {boolean} allDay - Takes the whole day
 * @property {boolean} isDone - Already over
 */

export interface HomePlanned {
  id: string
  title: string
  emoji: string | null
  startsAt: string
  allDay: boolean
  isDone: boolean
}

/**
 * Where a home task comes from
 * @typedef {string} HomeTaskKind
 */

export type HomeTaskKind =
  | 'pimStep'
  | 'assignTrainer'
  | 'launchPim'
  | 'training'
  | 'declareKickoff'
  | 'pimReview'
  | 'pimDecision'
  | 'secondPeriod'
  | 'departure'

/**
 * One thing the member has to do
 * @typedef {Object} HomeTask
 * @property {string} key - Stable identifier
 * @property {HomeTaskKind} kind - Where it comes from
 * @property {string} title - What to do
 * @property {string} context - Who or what it concerns
 * @property {IconName} icon - Glyph
 * @property {string} href - Where it gets done
 * @property {string | null} description - What must happen
 * @property {string | null} guide - Detailed walkthrough
 * @property {string | null} destinationLabel - Name of the place it opens
 * @property {string | null} dueAt - ISO planned day
 * @property {{ id: string, body: string } | null} [announcement] - Text to copy then mark published
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
  announcement?: { id: string; body: string } | null
}

/**
 * One line of the home queue
 * @typedef {Object} HomeEntry
 * @property {string} key - Stable identifier
 * @property {IconName | null} icon - Glyph when no emoji
 * @property {string | null} emoji - Emoji standing for the entry
 * @property {string} title - What is asked
 * @property {string | null} meta - Who or what it concerns
 * @property {string} group - Kind of task it belongs to
 * @property {string | null} note - Words the requester left
 * @property {string | null} due - Relative wording of its day
 * @property {HomeAction[]} actions - What the member can do
 * @property {ReactNode} [detail] - Extra reading in the stepper
 */

export interface HomeEntry {
  key: string
  icon: IconName | null
  emoji: string | null
  title: string
  meta: string | null
  group: string
  note: string | null
  due: string | null
  actions: HomeAction[]
  detail?: ReactNode
}

/**
 * Button of a home entry
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
