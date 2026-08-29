import type { FormValues } from '@/types/forms'

/**
 * Reference pointed at by a work item
 * @typedef {Object} WorkTag
 * @property {string} id - Row identifier
 * @property {string} label - Display label
 * @property {string | null} accent - Colour token
 */

export interface WorkTag {
  id: string
  label: string
  accent: string | null
}

/**
 * Member shown on a work item
 * @typedef {Object} WorkPerson
 * @property {string} id - Account identifier
 * @property {string} name - Display name
 * @property {string | null} src - Portrait
 */

export interface WorkPerson {
  id: string
  name: string
  src: string | null
}

/**
 * Who touched a record and when, carried by every work item
 * @typedef {Object} WorkAuthorship
 * @property {WorkPerson | null} createdBy - Who opened it
 * @property {string} createdAt - ISO creation
 * @property {WorkPerson | null} updatedBy - Who last edited it
 * @property {string} updatedAt - ISO last edit
 */

export interface WorkAuthorship {
  createdBy: WorkPerson | null
  createdAt: string
  updatedBy: WorkPerson | null
  updatedAt: string
}

/**
 * Card of the project board
 * @typedef {Object} ProjectSummary
 * @property {string} id - Project identifier
 * @property {string} title - Project title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string | null} description - Project description
 * @property {string | null} columnId - Workflow state identifier
 * @property {WorkTag | null} state - Workflow state
 * @property {WorkTag | null} priority - Priority
 * @property {WorkTag | null} platform - Platform
 * @property {WorkTag | null} youtuber - YouTuber concerned
 * @property {WorkPerson[]} leads - Project responsables
 * @property {WorkPerson[]} assistants - Project assistants
 * @property {string | null} deadline - ISO deadline
 * @property {number} position - Order inside its column
 * @property {number} communicationCount - Announcements written
 * @property {number} taskCount - Tasks attached
 * @property {number} meetingCount - Meetings attached
 * @property {FormValues} values - Values feeding the edit form
 */

export interface ProjectSummary extends WorkAuthorship {
  id: string
  title: string
  emoji: string | null
  description: string | null
  columnId: string | null
  state: WorkTag | null
  priority: WorkTag | null
  platform: WorkTag | null
  youtuber: WorkTag | null
  leads: WorkPerson[]
  assistants: WorkPerson[]
  deadline: string | null
  position: number
  communicationCount: number
  taskCount: number
  meetingCount: number
  values: FormValues
}

/**
 * Announcement written for a project
 * @typedef {Object} CommunicationEntry
 * @property {string} id - Announcement identifier
 * @property {string} title - Announcement title
 * @property {string} body - Markdown body
 * @property {WorkTag | null} platform - Platform it is posted on
 * @property {string | null} authorName - Who wrote it
 * @property {string | null} publishedAt - ISO publication date
 * @property {FormValues} values - Values feeding the edit form
 */

export interface CommunicationEntry {
  id: string
  title: string
  body: string
  platform: WorkTag | null
  authorName: string | null
  publishedAt: string | null
  values: FormValues
}

/**
 * Card of the task board
 * @typedef {Object} TaskSummary
 * @property {string} id - Task identifier
 * @property {string} title - Task title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string | null} description - Task description
 * @property {string | null} columnId - Workflow state identifier
 * @property {WorkTag | null} state - Workflow state
 * @property {WorkTag | null} priority - Priority
 * @property {WorkTag | null} youtuber - YouTuber concerned
 * @property {WorkTag | null} project - Project it belongs to
 * @property {WorkPerson | null} owner - Task owner
 * @property {string | null} dueDate - ISO due date
 * @property {number} position - Order inside its column
 * @property {FormValues} values - Values feeding the edit form
 */

export interface TaskSummary extends WorkAuthorship {
  id: string
  title: string
  emoji: string | null
  description: string | null
  columnId: string | null
  state: WorkTag | null
  priority: WorkTag | null
  youtuber: WorkTag | null
  project: WorkTag | null
  owner: WorkPerson | null
  dueDate: string | null
  position: number
  values: FormValues
}

/**
 * Card of the meeting board
 * @typedef {Object} MeetingSummary
 * @property {string} id - Meeting identifier
 * @property {string} title - Meeting title
 * @property {string | null} emoji - Glyph drawn before the title
 * @property {string | null} introduction - Opening words
 * @property {string | null} outro - Closing words
 * @property {string | null} minutes - Meeting minutes
 * @property {string | null} columnId - Workflow state identifier
 * @property {WorkTag | null} state - Workflow state
 * @property {WorkTag | null} youtuber - YouTuber concerned
 * @property {WorkTag | null} project - Project it belongs to
 * @property {string} scheduledAt - ISO date and time
 * @property {number | null} durationMin - Length in minutes
 * @property {WorkPerson[]} leads - Main attendees
 * @property {WorkPerson[]} assistants - Assisting attendees
 * @property {WorkPerson[]} participants - Attending moderators
 * @property {number} position - Order inside its column
 * @property {FormValues} values - Values feeding the edit form
 */

export interface MeetingSummary extends WorkAuthorship {
  id: string
  title: string
  emoji: string | null
  introduction: string | null
  outro: string | null
  minutes: string | null
  columnId: string | null
  state: WorkTag | null
  youtuber: WorkTag | null
  project: WorkTag | null
  scheduledAt: string
  durationMin: number | null
  leads: WorkPerson[]
  assistants: WorkPerson[]
  participants: WorkPerson[]
  position: number
  values: FormValues
}

/**
 * Point covered during a meeting
 * @typedef {Object} MeetingTopicEntry
 * @property {string} id - Topic identifier
 * @property {string} emoji - Glyph drawn before the title
 * @property {string} title - Topic title
 * @property {string | null} body - Markdown notes
 * @property {number} position - Order inside the meeting
 * @property {FormValues} values - Values feeding the edit form
 */

export interface MeetingTopicEntry {
  id: string
  emoji: string
  title: string
  body: string | null
  position: number
  values: FormValues
}

/**
 * Full meeting file
 * @typedef {Object} MeetingDetail
 * @property {MeetingSummary} summary - Board level fields
 * @property {MeetingTopicEntry[]} topics - Points covered, in reading order
 */

export interface MeetingDetail {
  summary: MeetingSummary
  topics: MeetingTopicEntry[]
}

/**
 * Full project file
 * @typedef {Object} ProjectDetail
 * @property {ProjectSummary} summary - Board level fields
 * @property {CommunicationEntry[]} communications - Announcements
 * @property {TaskSummary[]} tasks - Attached tasks
 * @property {MeetingSummary[]} meetings - Attached meetings
 */

export interface ProjectDetail {
  summary: ProjectSummary
  communications: CommunicationEntry[]
  tasks: TaskSummary[]
  meetings: MeetingSummary[]
}
