'use client'

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import { useComments, type CommentsState } from '@/core/hooks/data/work/useComments'
import { useJuniorFile, type JuniorFileState } from '@/core/hooks/data/academy/useJuniorFile'
import {
  useJuniorActions,
  usePromotionActions,
  type JuniorActions,
  type PromotionActions,
} from '@/core/hooks/data/academy/useParkourActions'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FSI_TABS } from '@/declarations/academy/guides'
import type {
  AcademyReviewView,
  CourseCard,
  JuniorLiveView,
  JuniorNoteView,
  JuniorObjectiveView,
  JuniorSkillView,
  JuniorView,
  ParkourView,
  PeriodView,
  PimTimeline,
} from '@/types/academy'
import type { CommentView } from '@/types/comments'
import type { FieldDefinition } from '@/types/forms'

/**
 * Declarations of the forms of a junior file
 * @typedef {Object} JuniorFields
 */

export interface JuniorFields {
  junior: FieldDefinition[]
  note: FieldDefinition[]
  objective: FieldDefinition[]
  review: FieldDefinition[]
  comment: FieldDefinition[]
}

/**
 * What the viewer may do on the file
 * @typedef {Object} JuniorRights
 */

export interface JuniorRights {
  viewerId: string
  manage: boolean
  // Responsable or above
  lead: boolean
  readLogs: boolean
  writeSkills: boolean
  readNotes: boolean
  writeNotes: boolean
  readObjectives: boolean
  writeObjectives: boolean
  readReviews: boolean
  writeReviews: boolean
  validateReviews: boolean
}

/**
 * What the server resolved around the junior
 * @typedef {Object} JuniorSurroundings
 */

export interface JuniorSurroundings {
  sessionId: string
  sessionTitle: string
  functionName: string
  timeline: PimTimeline
  periods: PeriodView[]
  parkour: ParkourView | null
  lives: JuniorLiveView[]
  courses: CourseCard[]
  // Recruitment session the junior came from
  recruitment: { path: string; name: string } | null
}

/**
 * Initial rows of the file
 * @typedef {Object} JuniorRows
 */

export interface JuniorRows {
  junior: JuniorView
  skills: JuniorSkillView[]
  notes: JuniorNoteView[]
  objectives: JuniorObjectiveView[]
  reviews: AcademyReviewView[]
  comments: CommentView[]
}

/**
 * Form standing open
 * @typedef {'note' | 'objective' | 'review' | 'trainer' | null} JuniorDialog
 */

export type JuniorDialog = 'note' | 'objective' | 'review' | 'trainer' | null

/**
 * Flow of check-ins or decisions standing open
 * @typedef {'reviews' | 'decisions' | null} JuniorFlow
 */

export type JuniorFlow = 'reviews' | 'decisions' | null

/**
 * Everything the tabs of a junior file share
 * @typedef {Object} JuniorFileContextState
 */

export interface JuniorFileContextState extends JuniorSurroundings {
  file: JuniorFileState
  comments: CommentsState
  actions: JuniorActions
  promotion: PromotionActions
  fields: JuniorFields
  can: JuniorRights
  tab: string
  setTab: (tab: string) => void
  dialog: JuniorDialog
  closeDialog: () => void
  flow: JuniorFlow
  setFlow: (flow: JuniorFlow) => void
  editingNote: JuniorNoteView | null
  editingObjective: JuniorObjectiveView | null
  pendingNote: JuniorNoteView | null
  pendingObjective: JuniorObjectiveView | null
  pendingReview: AcademyReviewView | null
  setPendingNote: (note: JuniorNoteView | null) => void
  setPendingObjective: (objective: JuniorObjectiveView | null) => void
  setPendingReview: (review: AcademyReviewView | null) => void
  noteForm: (note: JuniorNoteView | null) => void
  objectiveForm: (objective: JuniorObjectiveView | null) => void
  reviewForm: () => void
  trainerForm: () => void
}

const FileContext = createContext<JuniorFileContextState | null>(null)

/**
 * Read the state of the open junior file
 * @return {JuniorFileContextState} - Shared state
 */

export const useJuniorState = (): JuniorFileContextState => {
  const state = useContext(FileContext)
  if (!state) throw new Error('useJuniorState needs a JuniorFileProvider')

  return state
}

export interface JuniorFileProviderProps {
  rows: JuniorRows
  surroundings: JuniorSurroundings
  fields: JuniorFields
  can: JuniorRights
  initialTab?: string
  children: ReactNode
}

/**
 * Hold the state of a junior file for its tabs
 * @param {JuniorRows} rows - Rows resolved server-side
 * @param {JuniorSurroundings} surroundings - Promotion, timeline, periods, lives and courses
 * @param {JuniorFields} fields - Declarations of the forms
 * @param {JuniorRights} can - What the viewer may do
 * @param {string} [initialTab] - Tab a walkthrough opens on
 * @param {ReactNode} children - Tabs and drawers
 * @return {JSX.Element}
 */

export const JuniorFileProvider = ({
  rows,
  surroundings,
  fields,
  can,
  initialTab,
  children,
}: JuniorFileProviderProps) => {
  const file = useJuniorFile(rows.junior, rows.skills, rows.notes, rows.objectives, rows.reviews)
  const comments = useComments(
    rows.comments,
    API_ROUTES.juniorComments(rows.junior.id),
    API_ROUTES.academyComment
  )
  const actions = useJuniorActions(rows.junior.id)
  const promotion = usePromotionActions(rows.junior.sessionId)
  const [tab, setTab] = useState(initialTab ?? FSI_TABS.informations)
  const [dialog, setDialog] = useState<JuniorDialog>(null)
  const [flow, setFlow] = useState<JuniorFlow>(null)
  const [editingNote, setEditingNote] = useState<JuniorNoteView | null>(null)
  const [editingObjective, setEditingObjective] = useState<JuniorObjectiveView | null>(null)
  const [pendingNote, setPendingNote] = useState<JuniorNoteView | null>(null)
  const [pendingObjective, setPendingObjective] = useState<JuniorObjectiveView | null>(null)
  const [pendingReview, setPendingReview] = useState<AcademyReviewView | null>(null)

  const open = (next: Exclude<JuniorDialog, null>) => {
    file.clearIssues()
    setDialog(next)
  }

  const state: JuniorFileContextState = {
    ...surroundings,
    file,
    comments,
    actions,
    promotion,
    fields,
    can,
    tab,
    setTab,
    dialog,
    closeDialog: () => setDialog(null),
    flow,
    setFlow,
    editingNote,
    editingObjective,
    pendingNote,
    pendingObjective,
    pendingReview,
    setPendingNote,
    setPendingObjective,
    setPendingReview,
    noteForm: (note) => {
      setEditingNote(note)
      open('note')
    },
    objectiveForm: (objective) => {
      setEditingObjective(objective)
      open('objective')
    },
    reviewForm: () => open('review'),
    trainerForm: () => open('trainer'),
  }

  return <FileContext.Provider value={state}>{children}</FileContext.Provider>
}
