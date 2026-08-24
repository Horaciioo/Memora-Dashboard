'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type {
  AcademyReviewView,
  JuniorNoteView,
  JuniorObjectiveView,
  JuniorSkillView,
  JuniorView,
} from '@/types/academy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { ReviewStatusName } from '@/utils/constants/hierarchy'

/**
 * Individual follow-up file state and mutations
 * @typedef {Object} JuniorFileState
 * @property {JuniorView} junior - Junior being followed
 * @property {JuniorSkillView[]} skills - Competency grades
 * @property {JuniorNoteView[]} notes - FSI notes
 * @property {JuniorObjectiveView[]} objectives - Personal objectives
 * @property {AcademyReviewView[]} reviews - Voice check-ins
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(trainingId: string, validated: boolean) => Promise<void>} setTraining - Validate a training
 * @property {(values: FormValues) => Promise<boolean>} save - Edit the follow-up
 * @property {(skillId: string, percent: number) => Promise<void>} setSkill - Move a competency
 * @property {(values: FormValues) => Promise<boolean>} addNote - Write a note
 * @property {(id: string, values: FormValues) => Promise<boolean>} editNote - Edit a note
 * @property {(id: string) => Promise<void>} dropNote - Drop a note
 * @property {(values: FormValues) => Promise<boolean>} addObjective - Set an objective
 * @property {(id: string, values: FormValues) => Promise<boolean>} editObjective - Edit an objective
 * @property {(id: string) => Promise<void>} dropObjective - Drop an objective
 * @property {(ids: string[]) => Promise<void>} reorderObjectives - Reorder the objectives
 * @property {(values: FormValues) => Promise<boolean>} addReview - Write a check-in
 * @property {(id: string, values: FormValues) => Promise<boolean>} editReview - Edit a check-in
 * @property {(id: string) => Promise<void>} dropReview - Drop a check-in
 * @property {(id: string) => Promise<void>} submitReview - Submit a check-in for decision
 * @property {(id: string, status: ReviewStatusName, decisionNote?: string) => Promise<void>} decideReview - Decide a check-in
 */

export interface JuniorFileState {
  junior: JuniorView
  skills: JuniorSkillView[]
  notes: JuniorNoteView[]
  objectives: JuniorObjectiveView[]
  reviews: AcademyReviewView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  setTraining: (trainingId: string, validated: boolean) => Promise<void>
  save: (values: FormValues) => Promise<boolean>
  setSkill: (skillId: string, percent: number) => Promise<void>
  addNote: (values: FormValues) => Promise<boolean>
  editNote: (id: string, values: FormValues) => Promise<boolean>
  dropNote: (id: string) => Promise<void>
  addObjective: (values: FormValues) => Promise<boolean>
  editObjective: (id: string, values: FormValues) => Promise<boolean>
  dropObjective: (id: string) => Promise<void>
  reorderObjectives: (ids: string[]) => Promise<void>
  addReview: (values: FormValues) => Promise<boolean>
  editReview: (id: string, values: FormValues) => Promise<boolean>
  dropReview: (id: string) => Promise<void>
  submitReview: (id: string) => Promise<void>
  decideReview: (id: string, status: ReviewStatusName, decisionNote?: string) => Promise<void>
}

/**
 * Drive one individual follow-up file
 * @param {JuniorView} initialJunior - Junior resolved server-side
 * @param {JuniorSkillView[]} initialSkills - Competencies resolved server-side
 * @param {JuniorNoteView[]} initialNotes - Notes resolved server-side
 * @param {JuniorObjectiveView[]} initialObjectives - Objectives resolved server-side
 * @param {AcademyReviewView[]} initialReviews - Check-ins resolved server-side
 * @return {JuniorFileState} - State and mutations
 */

export const useJuniorFile = (
  initialJunior: JuniorView,
  initialSkills: JuniorSkillView[],
  initialNotes: JuniorNoteView[],
  initialObjectives: JuniorObjectiveView[],
  initialReviews: AcademyReviewView[]
): JuniorFileState => {
  const [junior, setJunior] = useState(initialJunior)
  const [skills, setSkills] = useState(initialSkills)
  const [notes, setNotes] = useState(initialNotes)
  const [objectives, setObjectives] = useState(initialObjectives)
  const [reviews, setReviews] = useState(initialReviews)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Every junior mutation answers with the whole session, so the file picks its own row back
  const pickSelf = useCallback((rows: JuniorView[] | null, id: string) => {
    const mine = rows?.find((row) => row.id === id)
    if (mine) setJunior(mine)

    return rows !== null
  }, [])

  const setTraining = useCallback(
    async (trainingId: string, validated: boolean) => {
      const next = await run(() =>
        apiPatch<JuniorView[]>(API_ROUTES.juniorTrainings(junior.id), { trainingId, validated })
      )

      pickSelf(next, junior.id)
    },
    [junior.id, pickSelf, run]
  )

  const save = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPatch<JuniorView[]>(API_ROUTES.junior(junior.id), values),
        feedbackTitle('Fiche', 'saved', 'feminine', junior.displayName)
      )

      return pickSelf(next, junior.id)
    },
    [junior.id, junior.displayName, pickSelf, run]
  )

  const setSkill = useCallback(
    async (skillId: string, percent: number) => {
      const next = await run(() =>
        apiPatch<JuniorSkillView[]>(API_ROUTES.juniorSkills(junior.id), { skillId, percent })
      )

      if (next) setSkills(next)
    },
    [junior.id, run]
  )

  const addNote = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<JuniorNoteView[]>(API_ROUTES.juniorNotes(junior.id), values),
        feedbackTitle('Note', 'created', 'feminine')
      )

      if (next) setNotes(next)

      return next !== null
    },
    [junior.id, run]
  )

  const editNote = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<JuniorNoteView[]>(API_ROUTES.juniorNote(id), values),
        feedbackTitle('Note', 'saved', 'feminine')
      )

      if (next) setNotes(next)

      return next !== null
    },
    [run]
  )

  const dropNote = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<JuniorNoteView[]>(API_ROUTES.juniorNote(id)),
        feedbackTitle('Note', 'deleted', 'feminine')
      )

      if (next) setNotes(next)
    },
    [run]
  )

  const addObjective = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<JuniorObjectiveView[]>(API_ROUTES.juniorObjectives(junior.id), values),
        feedbackTitle('Objectif', 'created', 'masculine')
      )

      if (next) setObjectives(next)

      return next !== null
    },
    [junior.id, run]
  )

  const editObjective = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<JuniorObjectiveView[]>(API_ROUTES.objective(id), values),
        feedbackTitle('Objectif', 'saved', 'masculine')
      )

      if (next) setObjectives(next)

      return next !== null
    },
    [run]
  )

  const dropObjective = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<JuniorObjectiveView[]>(API_ROUTES.objective(id)),
        feedbackTitle('Objectif', 'deleted', 'masculine')
      )

      if (next) setObjectives(next)
    },
    [run]
  )

  const reorderObjectives = useCallback(
    async (ids: string[]) => {
      const next = await run(() =>
        apiPatch<JuniorObjectiveView[]>(API_ROUTES.juniorObjectivesOrder(junior.id), { ids })
      )

      if (next) setObjectives(next)
    },
    [junior.id, run]
  )

  const addReview = useCallback(
    async (values: FormValues) => {
      const next = await run(
        () => apiPost<AcademyReviewView[]>(API_ROUTES.juniorReviews(junior.id), values),
        feedbackTitle('Bilan', 'created', 'masculine')
      )

      if (next) setReviews(next)

      return next !== null
    },
    [junior.id, run]
  )

  const editReview = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<AcademyReviewView[]>(API_ROUTES.review(id), values),
        feedbackTitle('Bilan', 'saved', 'masculine')
      )

      if (next) setReviews(next)

      return next !== null
    },
    [run]
  )

  const dropReview = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiDelete<AcademyReviewView[]>(API_ROUTES.review(id)),
        feedbackTitle('Bilan', 'deleted', 'masculine')
      )

      if (next) setReviews(next)
    },
    [run]
  )

  const submitReview = useCallback(
    async (id: string) => {
      const next = await run(
        () => apiPost<AcademyReviewView[]>(API_ROUTES.reviewSubmit(id), {}),
        feedbackTitle('Bilan', 'saved', 'masculine')
      )

      if (next) setReviews(next)
    },
    [run]
  )

  const decideReview = useCallback(
    async (id: string, status: ReviewStatusName, decisionNote?: string) => {
      const next = await run(
        () => apiPost<AcademyReviewView[]>(API_ROUTES.reviewDecision(id), { status, decisionNote }),
        feedbackTitle('Bilan', 'saved', 'masculine')
      )

      if (next) setReviews(next)
    },
    [run]
  )

  return {
    junior,
    skills,
    notes,
    objectives,
    reviews,
    isSaving,
    issues,
    clearIssues,
    setTraining,
    save,
    setSkill,
    addNote,
    editNote,
    dropNote,
    addObjective,
    editObjective,
    dropObjective,
    reorderObjectives,
    addReview,
    editReview,
    dropReview,
    submitReview,
    decideReview,
  }
}
