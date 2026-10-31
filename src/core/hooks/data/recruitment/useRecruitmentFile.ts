'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useRecruitmentLive } from '@/core/hooks/data/recruitment/useRecruitmentLive'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { INTEGRATION_LINK_COPY } from '@/declarations/onboarding/copy'
import { entityFeedback } from '@/declarations/ui/copy'
import type { CommentView } from '@/types/comments'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { IntegrationLinkView } from '@/types/onboarding'
import type {
  AnswerState,
  CandidateView,
  RecruitmentDetail,
  RecruitmentStepView,
} from '@/types/recruitment'
import { BLANK_ANSWER } from '@/core/lib/recruitment/questionnaire'
import type { InterviewPatch } from '@/types/recruitment'

/**
 * One recruitment session file
 * @typedef {Object} RecruitmentFile
 * @property {string} instructions - Consignes in force
 * @property {CandidateView[]} candidates - Applicants held
 * @property {RecruitmentStepView[]} steps - Timeline moments
 * @property {IntegrationLinkView | null} link - Integration form handed out
 * @property {string[]} questionKeys - Questions picked for the interviews
 * @property {(id: string, key: string, patch: Partial<AnswerState>) => Promise<void>} saveAnswer - Note one question
 * @property {(id: string, stage: string, done: boolean) => Promise<void>} markStage - Tick a timeline moment
 * @property {(id: string, patch: InterviewPatch) => Promise<boolean>} setInterview - Set register, start or verdict
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
 * @property {(id: string, pinned: boolean) => Promise<void>} pinComment - Pin a remark
 * @property {CommentView[]} comments - Remarks left on the session
 * @property {(values: FormValues) => Promise<boolean>} addSessionComment - Leave a remark on the session
 * @property {(id: string) => Promise<void>} removeSessionComment - Drop a session remark
 * @property {(values: FormValues) => Promise<boolean>} addStep - Add a timeline moment
 * @property {(id: string, values: FormValues) => Promise<boolean>} updateStep - Edit a timeline moment
 * @property {(id: string, done: boolean) => Promise<void>} setStepDone - Clear or reopen a moment
 * @property {(id: string) => Promise<void>} removeStep - Drop a timeline moment
 * @property {(instructions: string) => Promise<boolean>} saveInstructions - Write the consignes
 * @property {(values: FormValues) => Promise<boolean>} emitLink - Hand out the integration form
 * @property {() => Promise<void>} revokeLink - Close the integration form
 */

export interface RecruitmentFile {
  instructions: string
  candidates: CandidateView[]
  steps: RecruitmentStepView[]
  link: IntegrationLinkView | null
  questionKeys: string[]
  saveAnswer: (id: string, key: string, patch: Partial<AnswerState>) => Promise<void>
  markStage: (id: string, stage: string, done: boolean) => Promise<void>
  setInterview: (id: string, patch: InterviewPatch) => Promise<boolean>
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
  pinComment: (id: string, pinned: boolean) => Promise<void>
  comments: CommentView[]
  addSessionComment: (values: FormValues) => Promise<boolean>
  removeSessionComment: (id: string) => Promise<void>
  addStep: (values: FormValues) => Promise<boolean>
  updateStep: (id: string, values: FormValues) => Promise<boolean>
  setStepDone: (id: string, done: boolean) => Promise<void>
  removeStep: (id: string) => Promise<void>
  saveInstructions: (instructions: string) => Promise<boolean>
  emitLink: (values: FormValues) => Promise<boolean>
  revokeLink: () => Promise<void>
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
  const [comments, setComments] = useState(detail.comments)
  const [link, setLink] = useState(detail.link)
  const questionKeys = detail.questionKeys

  // A page read again hands over the fresh state
  const [seen, setSeen] = useState(detail)
  if (seen !== detail) {
    setSeen(detail)
    setInstructions(detail.instructions)
    setCandidates(detail.candidates)
    setSteps(detail.steps)
    setComments(detail.comments)
    setLink(detail.link)
  }
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Every candidate mutation answers with the whole card
  const mergeCandidate = useCallback((saved: CandidateView) => {
    setCandidates((current) =>
      current.some((entry) => entry.id === saved.id)
        ? current.map((entry) => (entry.id === saved.id ? saved : entry))
        : [...current, saved]
    )
  }, [])

  const dropCandidate = useCallback((id: string) => {
    setCandidates((current) => current.filter((entry) => entry.id !== id))
  }, [])

  useRecruitmentLive(sessionId, mergeCandidate, dropCandidate)

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
        entityFeedback('candidate', 'created', name)
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
        entityFeedback('candidate', 'saved')
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
        entityFeedback('candidate', 'deleted')
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
        entityFeedback('review', 'saved')
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
        entityFeedback('comment', 'created')
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
        entityFeedback('comment', 'deleted')
      )

      if (saved) mergeCandidate(saved)
    },
    [run, mergeCandidate]
  )

  const pinComment = useCallback(
    async (id: string, pinned: boolean) => {
      const saved = await run(() =>
        apiPatch<CandidateView>(API_ROUTES.candidateComment(id), { pinned })
      )

      if (saved) mergeCandidate(saved)
    },
    [run, mergeCandidate]
  )

  const addSessionComment = useCallback(
    async (values: FormValues) => {
      const saved = await run(
        () => apiPost<CommentView[]>(API_ROUTES.recruitmentComments(sessionId), values),
        entityFeedback('comment', 'created')
      )

      if (saved) setComments(saved)

      return saved !== null
    },
    [run, sessionId]
  )

  const removeSessionComment = useCallback(
    async (id: string) => {
      const saved = await run(
        () => apiDelete<CommentView[]>(API_ROUTES.recruitmentComment(id)),
        entityFeedback('comment', 'deleted')
      )

      if (saved) setComments(saved)
    },
    [run]
  )

  const addStep = useCallback(
    async (values: FormValues) => {
      const name = typeof values.title === 'string' ? values.title : undefined
      const saved = await run(
        () => apiPost<RecruitmentStepView>(API_ROUTES.recruitmentSteps(sessionId), values),
        entityFeedback('step', 'created', name)
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
        entityFeedback('step', 'saved')
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
        entityFeedback('step', 'deleted')
      )

      if (dropped !== null) setSteps((current) => current.filter((entry) => entry.id !== id))
    },
    [run]
  )

  const saveInstructions = useCallback(
    async (next: string) => {
      const saved = await run(
        () => apiPut<string>(API_ROUTES.recruitmentInstructions(sessionId), { instructions: next }),
        entityFeedback('instructions', 'saved', undefined, true)
      )

      if (saved !== null) setInstructions(saved)

      return saved !== null
    },
    [run, sessionId]
  )

  // Notes land on the card at once, the server follows
  const saveAnswer = useCallback(
    async (id: string, key: string, patch: Partial<AnswerState>) => {
      setCandidates((current) =>
        current.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                answers: {
                  ...entry.answers,
                  [key]: { ...BLANK_ANSWER, ...entry.answers[key], ...patch },
                },
              }
            : entry
        )
      )

      await run(() => apiPut(API_ROUTES.candidateAnswer(id, key), patch))
    },
    [run]
  )

  // The moment flips at once, the server follows
  const markStage = useCallback(
    async (id: string, stage: string, done: boolean) => {
      setCandidates((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, stageMarks: { ...entry.stageMarks, [stage]: done } } : entry
        )
      )

      await run(() => apiPut(API_ROUTES.candidateStage(id, stage), { done }))
    },
    [run]
  )

  // The server answers with the whole card
  const setInterview = useCallback(
    async (id: string, patch: InterviewPatch) => {
      const saved = await run(() => apiPut<CandidateView>(API_ROUTES.candidateInterview(id), patch))

      if (saved) mergeCandidate(saved)

      return saved !== null
    },
    [run, mergeCandidate]
  )

  // Handing out the form also clears the step that carries it
  const emitLink = useCallback(
    async (values: FormValues) => {
      const emitted = await run(
        () => apiPost<IntegrationLinkView>(API_ROUTES.recruitmentLink(sessionId), values),
        INTEGRATION_LINK_COPY.emitted
      )

      if (emitted) {
        setLink(emitted)
        setSteps((current) =>
          current.map((step) =>
            step.emitsInvite && !step.doneAt ? { ...step, doneAt: new Date().toISOString() } : step
          )
        )
      }

      return emitted !== null
    },
    [run, sessionId]
  )

  const revokeLink = useCallback(async () => {
    const dropped = await run(() => apiDelete<null>(API_ROUTES.recruitmentLink(sessionId)))

    if (dropped !== null) setLink(null)
  }, [run, sessionId])

  return {
    instructions,
    candidates,
    steps,
    link,
    questionKeys,
    saveAnswer,
    markStage,
    setInterview,
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
    pinComment,
    comments,
    addSessionComment,
    removeSessionComment,
    addStep,
    updateStep,
    setStepDone,
    removeStep,
    saveInstructions,
    emitLink,
    revokeLink,
  }
}
