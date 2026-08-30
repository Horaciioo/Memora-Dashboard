import {
  AbsencesIllustration,
  AcademyIllustration,
  EmptyBoxIllustration,
  LiveconIllustration,
  MeetingsIllustration,
  MembersIllustration,
  ModerationIllustration,
  NoResultsIllustration,
  NotesIllustration,
  NotificationsIllustration,
  ProjectsIllustration,
  SettingsIllustration,
  TasksIllustration,
  TeamsIllustration,
} from '@/components/elements/feedback/EmptyStateIllustration'
import type { EmptyStateIllustrationProps } from '@/components/elements/feedback/EmptyStateIllustration'
import type { FC } from 'react'

/**
 * Drawn figures shown inside an empty box
 * @type {Record<string, FC<EmptyStateIllustrationProps>>}
 */

export const ILLUSTRATIONS = {
  start: EmptyBoxIllustration,
  filter: NoResultsIllustration,
  members: MembersIllustration,
  teams: TeamsIllustration,
  projects: ProjectsIllustration,
  tasks: TasksIllustration,
  meetings: MeetingsIllustration,
  absences: AbsencesIllustration,
  livecon: LiveconIllustration,
  academy: AcademyIllustration,
  notes: NotesIllustration,
  notifications: NotificationsIllustration,
  settings: SettingsIllustration,
  moderation: ModerationIllustration,
} as const satisfies Record<string, FC<EmptyStateIllustrationProps>>

export type IllustrationName = keyof typeof ILLUSTRATIONS
