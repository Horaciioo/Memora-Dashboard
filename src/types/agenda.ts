/**
 * Window a point looks at
 * @type {'day' | 'week'}
 */

export type AgendaSpan = 'day' | 'week'

/**
 * One kind of fact a member can ask for alone
 * @type {'tasks' | 'late' | 'plans' | 'away' | 'birthdays'}
 */

export type AgendaFocus = 'tasks' | 'late' | 'plans' | 'away' | 'birthdays'

/**
 * Something that waits for the member
 * @typedef {Object} AgendaTask
 * @property {string} title - What to do
 * @property {string} context - Who or what it concerns
 * @property {string} href - Where it gets done
 * @property {string | null} dueDay - Wall day it is due, none when open
 */

export interface AgendaTask {
  title: string
  context: string
  href: string
  dueDay: string | null
}

/**
 * Something the calendar plans
 * @typedef {Object} AgendaPlan
 * @property {string} title - Entry name
 * @property {string} startsAt - ISO start
 * @property {string} day - Wall day it falls on
 */

export interface AgendaPlan {
  title: string
  startsAt: string
  day: string
}

/**
 * Someone on a given day
 * @typedef {Object} AgendaPerson
 * @property {string} name - Display name
 * @property {string} day - Wall day, when they are back or when it falls
 */

export interface AgendaPerson {
  name: string
  day: string
}

/**
 * What a point is made of, read once and told without another query
 * @typedef {Object} AgendaFacts
 * @property {AgendaTask[]} tasks - What waits for the member
 * @property {AgendaPlan[]} plans - What the calendar plans
 * @property {AgendaPerson[]} away - Members in absence
 * @property {AgendaPerson[]} birthdays - Birthdays in the window
 */

export interface AgendaFacts {
  tasks: AgendaTask[]
  plans: AgendaPlan[]
  away: AgendaPerson[]
  birthdays: AgendaPerson[]
}
