'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { CandidateView, RecruitmentDetail, RecruitmentStepView } from '@/types/recruitment'

// Toast entity labels
const CANDIDATE = 'Candidat'
const STEP = 'Étape'
const COMMENT = 'Commentaire'
const REVIEW = 'Bilan'
const INSTRUCTIONS = 'Consignes'

/**
 * One recruitment session file, its candidates, its timeline and its written traces
 * @typedef {Object} RecruitmentFile
 * @property {string} instructions - Consignes in force
 * @property {CandidateView[]} candidates - Applicants held
 * @property {RecruitmentStepView[]} steps - Timeline moments
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(values: FormValues) => Promise<boolean>} addCandidate - Add an applicant
 * @property {(id: string, values: FormValues) => Promise<boolean>} updateCandidate - Edit an applicant
 * @property {(id: string) => Promise<void>} removeCandidate - Drop an applicant
 * @property {(id: string, outcomeId: string, index: number) => Promise<void>} moveCandidate - Move a card
 * @property {(id: string, review: string) => Promise<boolean>} saveReview - Write a bilan
 * @property {(id: string, values: FormValues) => Promise<boolean>} addComment - Leave a remark
 * @property {(id: string) => Promise<void>} removeComment - Drop a remark
 * @property {(values: FormValues) => Promise<boolean>} addStep - Add a timeline moment
 * @property {(id: string, values: FormValues) => Promise<boolean>} updateStep - Edit a timeline moment
 * @property {(id: string, done: boolean) => Promise<void>} setStepDone - Clear or reopen a moment
 * @property {(id: string) => Promise<void>} removeStep - Drop a timeline moment
 * @property {(instructions: string) => Promise<boolean>} saveInstructions - Write the consignes
 */

export interface RecruitmentFile {
  instructions: string
  candidates: CandidateView[]
  steps: RecruitmentStepView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  addCandidate: (values: FormValues) => Promise<boolean>
  updateCandidate: (id: string, values: FormValues) => Promise<boolean>
  removeCandidate: (id: string) => Promise<void>
  moveCandidate: (id: string, outcomeId: string, index: number) => Promise<void>
  saveReview: (id: string, review: string) => Promise<boolean>
  addComment: (id: string, values: FormValues) => Promise<boolean>
  removeComment: (id: string) => Promise<void>
  addStep: (values: FormValues) => Promise<boolean>
  updateStep: (id: string, values: FormValues) => Promise<boolean>
  setStepDone: (id: string, done: boolean) => Promise<void>
  removeStep: (id: string) => Promise<void>
  saveInstructions: (instructions: string) => Promise<boolean>
}

/**
 * Drive one recruitment session file
 * @param {RecruitmentDetail} detail - File resolved server-side
 * @return {RecruitmentFile} - State and mutations
 */

export const useRecruitmentFile = (detail: RecruitmentDetail): RecruitmentFile => {
  const sessionId = detail.summary.id
  const [instructions, setInstructions] = useState(detail.instructions)
  const [candidates, setCandidates] = useState(detail.candidates)
  const [steps, setSteps] = useState(detail.steps)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Every candidate mutation answers with the whole card, so one merge covers them all
  const mergeCandidate = useCallback((saved: CandidateView) => {
    setCandidates((current) =>
      current.some((entry) => entry.id === saved.id)
        ? current.map((entry) => (entry.id === saved.id ? saved : entry))
        : [...current, saved]
    )
  }, [])

  const mergeStep = useCallback((saved: RecruitmentStepView) => {
    setSteps((current) =>
      current.some((entry) => entry.id === saved.id)
        ? current.map((entry) => (entry.id === saved.id ? saved : entry))
        : [...current, saved]
    )
  }, [])

  const addCandidate = useCallback(
    async (values: FormValues) => {
      const name = typeof values.discordId === 'string' ? values.discordId : undefined
      const saved = await run(
        () => apiPost<CandidateView>(API_ROUTES.recruitmentCandidates(sessionId), values),
        feedbackTitle(CANDIDATE, 'created', 'masculine', name)
      )

      if (saved) mergeCandidate(saved)

      return saved !== null
    },
    [run, sessionId, mergeCandidate]
  )

  const updateCandidate = useCallback(
    async (id: string, values: FormValues) => {
      const saved = await run(
        () => apiPatch<CandidateView>(API_ROUTES.candidate(id), values),
        feedbackTitle(CANDIDATE, 'saved', 'masculine')
      )

      if (saved) mergeCandidate(saved)

      return saved !== null
    },
    [run, mergeCandidate]
  )

  const removeCandidate = useCallback(
    async (id: string) => {
      const dropped = await run(
        () => apiDelete<null>(API_ROUTES.candidate(id)),
        feedbackTitle(CANDIDATE, 'deleted', 'masculine')
      )

      if (dropped !== null) setCandidates((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  const moveCandidate = useCallback(
    async (id: string, outcomeId: string, index: number) => {
      const saved = await run(() =>
        apiPatch<CandidateView>(API_ROUTES.candidateColumn(id), { outcomeId, index })
      )

      if (saved) mergeCandidate(saved)
    },
    [run, mergeCandidate]
  )

  const saveReview = useCallback(
    async (id: string, review: string) => {
      const saved = await run(
        () => apiPut<CandidateView>(API_ROUTES.candidateReview(id), { review }),
        feedbackTitle(REVIEW, 'saved', 'masculine')
      )

      if (saved) mergeCandidate(saved)

      return saved !== null
    },
    [run, mergeCandidate]
  )

  const addComment = useCallback(
    async (id: string, values: FormValues) => {
      const saved = await run(
        () => apiPost<CandidateView>(API_ROUTES.candidateComments(id), values),
        feedbackTitle(COMMENT, 'created', 'masculine')
      )

      if (saved) mergeCandidate(saved)

      return saved !== null
    },
    [run, mergeCandidate]
  )

  const removeComment = useCallback(
    async (id: string) => {
      const saved = await run(
        () => apiDelete<CandidateView>(API_ROUTES.candidateComment(id)),
        feedbackTitle(COMMENT, 'deleted', 'masculine')
      )

      if (saved) mergeCandidate(saved)
    },
    [run, mergeCandidate]
  )

  const addStep = useCallback(
    async (values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const saved = await run(
        () => apiPost<RecruitmentStepView>(API_ROUTES.recruitmentSteps(sessionId), values),
        feedbackTitle(STEP, 'created', 'feminine', name)
      )

      if (saved) mergeStep(saved)

      return saved !== null
    },
    [run, sessionId, mergeStep]
  )

  const updateStep = useCallback(
    async (id: string, values: FormValues) => {
      const saved = await run(
        () => apiPatch<RecruitmentStepView>(API_ROUTES.recruitmentStep(id), values),
        feedbackTitle(STEP, 'saved', 'feminine')
      )

      if (saved) mergeStep(saved)

      return saved !== null
    },
    [run, mergeStep]
  )

  const setStepDone = useCallback(
    async (id: string, done: boolean) => {
      const saved = await run(() =>
        apiPatch<RecruitmentStepView>(API_ROUTES.recruitmentStepStatus(id), { done })
      )

      if (saved) mergeStep(saved)
    },
    [run, mergeStep]
  )

  const removeStep = useCallback(
    async (id: string) => {
      const dropped = await run(
        () => apiDelete<null>(API_ROUTES.recruitmentStep(id)),
        feedbackTitle(STEP, 'deleted', 'feminine')
      )

      if (dropped !== null) setSteps((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  const saveInstructions = useCallback(
    async (next: string) => {
      const saved = await run(
        () => apiPut<string>(API_ROUTES.recruitmentInstructions(sessionId), { instructions: next }),
        feedbackTitle(INSTRUCTIONS, 'saved', 'feminine', undefined, true)
      )

      if (saved !== null) setInstructions(saved)

      return saved !== null
    },
    [run, sessionId]
  )

  return {
    instructions,
    candidates,
    steps,
    isSaving,
    issues,
    clearIssues,
    addCandidate,
    updateCandidate,
    removeCandidate,
    moveCandidate,
    saveReview,
    addComment,
    removeComment,
    addStep,
    updateStep,
    setStepDone,
    removeStep,
    saveInstructions,
  }
}
