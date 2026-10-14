'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import { useSession, type SessionState } from '@/core/hooks/data/useAcademy'
import { useComments, type CommentsState } from '@/core/hooks/data/useComments'
import { usePromotionActions, type PromotionActions } from '@/core/hooks/data/useParkourActions'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { MenuItem } from '@/managers/front-end'
import type { JuniorView, PeriodView, SessionDetail } from '@/types/academy'
import type { CalendarEntry } from '@/types/calendar'
import type { CommentView } from '@/types/comments'
import type { FieldDefinition } from '@/types/forms'

/**
 * Declarations of the forms of a session file
 * @typedef {Object} SessionFields
 */

export interface SessionFields {
  session: FieldDefinition[]
  junior: FieldDefinition[]
  calendar: FieldDefinition[]
  review: FieldDefinition[]
  comment: FieldDefinition[]
}

/**
 * What the viewer may do on the file
 * @typedef {Object} SessionRights
 */

export interface SessionRights {
  viewerId: string
  manage: boolean
  // Responsable or above
  lead: boolean
  manageCalendar: boolean
  readLogs: boolean
  readNotes: boolean
  writeNotes: boolean
  writeReviews: boolean
  validateReviews: boolean
}

/**
 * Calendar window the session opens on
 * @typedef {Object} SessionCalendar
 */

export interface SessionCalendar {
  entries: CalendarEntry[]
  anchor: string
}

/**
 * Form standing open
 * @typedef {'junior' | null} SessionDialog
 */

export type SessionDialog = 'junior' | null

/**
 * Flow of check-ins or decisions standing open
 * @typedef {'reviews' | 'decisions' | null} SessionFlow
 */

export type SessionFlow = 'reviews' | 'decisions' | null

/**
 * Everything the tabs of a session file share
 * @typedef {Object} SessionFileState
 */

export interface SessionFileState {
  detail: SessionDetail
  session: SessionState
  comments: CommentsState
  promotion: PromotionActions
  periods: PeriodView[]
  flow: SessionFlow
  setFlow: (flow: SessionFlow) => void
  fields: SessionFields
  can: SessionRights
  calendar: SessionCalendar
  hasCandidates: boolean
  dialog: SessionDialog
  closeDialog: () => void
  editingJunior: JuniorView | null
  pendingJunior: JuniorView | null
  setPendingJunior: (junior: JuniorView | null) => void
  juniorForm: (junior: JuniorView | null) => void
  openJunior: (junior: JuniorView) => void
  juniorMenu: (junior: JuniorView) => MenuItem[]
}

const FileContext = createContext<SessionFileState | null>(null)

/**
 * Read the state of the open session file
 * @return {SessionFileState} - Shared state
 */

export const useSessionState = (): SessionFileState => {
  const state = useContext(FileContext)
  if (!state) throw new Error('useSessionState needs a SessionFileProvider')

  return state
}

export interface SessionFileProviderProps {
  detail: SessionDetail
  fields: SessionFields
  can: SessionRights
  calendar: SessionCalendar
  periods: PeriodView[]
  comments: CommentView[]
  hasCandidates: boolean
  children: ReactNode
}

/**
 * Hold the state of an academy session file for its tabs
 * @param {SessionDetail} detail - File resolved server-side
 * @param {SessionFields} fields - Declarations of the forms
 * @param {SessionRights} can - What the viewer may do
 * @param {SessionCalendar} calendar - Calendar window
 * @param {PeriodView[]} periods - Dated periods of the promotion
 * @param {CommentView[]} comments - Remarks left on the promotion
 * @param {boolean} hasCandidates - A moderator may still be taken in
 * @param {ReactNode} children - Tabs and drawers
 * @return {JSX.Element}
 */

export const SessionFileProvider = ({
  detail,
  fields,
  can,
  calendar,
  periods,
  comments: initialComments,
  hasCandidates,
  children,
}: SessionFileProviderProps) => {
  const router = useRouter()
  const session = useSession(detail.summary.id, detail.juniors)
  const comments = useComments(
    initialComments,
    API_ROUTES.sessionComments(detail.summary.id),
    API_ROUTES.academyComment
  )
  const promotion = usePromotionActions(detail.summary.id)
  const [flow, setFlow] = useState<SessionFlow>(null)
  const [dialog, setDialog] = useState<SessionDialog>(null)
  const [editingJunior, setEditingJunior] = useState<JuniorView | null>(null)
  const [pendingJunior, setPendingJunior] = useState<JuniorView | null>(null)

  const openJunior = (junior: JuniorView) =>
    router.push(ROUTES.junior(detail.summary.id, junior.id))

  const juniorForm = (junior: JuniorView | null) => {
    session.clearIssues()
    setEditingJunior(junior)
    setDialog('junior')
  }

  const juniorMenu = (junior: JuniorView): MenuItem[] => [
    {
      id: 'open',
      label: ACADEMY_COPY.fileTitle,
      icon: 'sheet',
      onSelect: () => openJunior(junior),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !can.manage,
      onSelect: () => juniorForm(junior),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !can.manage,
      onSelect: () => setPendingJunior(junior),
    },
  ]

  const state: SessionFileState = {
    detail,
    session,
    comments,
    promotion,
    periods,
    flow,
    setFlow,
    fields,
    can,
    calendar,
    hasCandidates,
    dialog,
    closeDialog: () => setDialog(null),
    editingJunior,
    pendingJunior,
    setPendingJunior,
    juniorForm,
    openJunior,
    juniorMenu,
  }

  return <FileContext.Provider value={state}>{children}</FileContext.Provider>
}
