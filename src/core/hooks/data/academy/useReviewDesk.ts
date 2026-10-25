'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiGet, apiPatch, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import type { ReviewDecisionInput } from '@/core/hooks/data/academy/useJuniorFile'
import { entityFeedback } from '@/declarations/ui/copy'
import type { AcademyReviewView, JuniorSkillView } from '@/types/academy'
import type { FieldIssue, FormValues } from '@/types/forms'
import { ReviewStatuses } from '@/utils/constants/hierarchy'

/**
 * Everything a check-in is made of
 * @typedef {Object} DeskRows
 * @property {JuniorSkillView[]} skills - Competency grades
 * @property {AcademyReviewView[]} reviews - Check-ins written
 */

interface DeskRows {
  skills: JuniorSkillView[]
  reviews: AcademyReviewView[]
}

/**
 * Check-in of one junior seen from a flow, away from their file
 * @typedef {Object} ReviewDesk
 * @property {boolean} isLoading - Rows still coming
 * @property {JuniorSkillView[]} skills - Competency grades
 * @property {AcademyReviewView[]} reviews - Check-ins written
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(skillId: string, percent: number) => Promise<void>} setSkill - Grade a competency
 * @property {(values: FormValues) => Promise<boolean>} fileReview - Write the check-in then hand it in
 * @property {(id: string, input: ReviewDecisionInput) => Promise<boolean>} decide - Decide a check-in
 */

export interface ReviewDesk {
  isLoading: boolean
  skills: JuniorSkillView[]
  reviews: AcademyReviewView[]
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  setSkill: (skillId: string, percent: number) => Promise<void>
  fileReview: (values: FormValues) => Promise<boolean>
  decide: (id: string, input: ReviewDecisionInput) => Promise<boolean>
}

/**
 * Drive the check-in of one junior inside a flow
 * @param {string} juniorId - Junior identifier
 * @return {ReviewDesk} - Rows and mutations
 */

export const useReviewDesk = (juniorId: string): ReviewDesk => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isSaving, issues, clearIssues, run } = useMutation()
  const key = QUERY_KEYS.reviewDesk(juniorId)

  const { data, isLoading } = useQuery<DeskRows>({
    queryKey: key,
    queryFn: async ({ signal }) => {
      const [skills, reviews] = await Promise.all([
        apiGet<JuniorSkillView[]>(API_ROUTES.juniorSkills(juniorId), signal),
        apiGet<AcademyReviewView[]>(API_ROUTES.juniorReviews(juniorId), signal),
      ])

      return { skills, reviews }
    },
    gcTime: 0,
  })

  const keep = useCallback(
    (next: Partial<DeskRows>) =>
      queryClient.setQueryData<DeskRows>(key, (current) =>
        current ? { ...current, ...next } : current
      ),
    [queryClient, key]
  )

  const setSkill = useCallback(
    async (skillId: string, percent: number) => {
      const next = await run(() =>
        apiPatch<JuniorSkillView[]>(API_ROUTES.juniorSkills(juniorId), { skillId, percent })
      )
      if (next) keep({ skills: next })
    },
    [run, juniorId, keep]
  )

  const fileReview = useCallback(
    async (values: FormValues) => {
      const reviews = data?.reviews ?? []
      const isDraftOfStage = (review: AcademyReviewView) =>
        review.status === ReviewStatuses.Draft && review.stage === values.stage
      const draft = reviews.find(isDraftOfStage)

      // The draft is written first so a refused deposit keeps what was typed
      const written = await run(() =>
        draft
          ? apiPatch<AcademyReviewView[]>(API_ROUTES.review(draft.id), values)
          : apiPost<AcademyReviewView[]>(API_ROUTES.juniorReviews(juniorId), values)
      )
      const current = written?.find(isDraftOfStage)
      if (!written || !current) return false
      keep({ reviews: written })

      const submitted = await run(
        () => apiPost<AcademyReviewView[]>(API_ROUTES.reviewSubmit(current.id), {}),
        entityFeedback('review', 'saved')
      )
      if (submitted) keep({ reviews: submitted })
      router.refresh()

      return submitted !== null
    },
    [data, run, juniorId, keep, router]
  )

  const decide = useCallback(
    async (id: string, input: ReviewDecisionInput) => {
      const next = await run(
        () =>
          apiPost<AcademyReviewView[]>(API_ROUTES.reviewDecision(id), {
            status: input.bounce ? ReviewStatuses.Rejected : ReviewStatuses.Validated,
            decision: input.decision,
            deadlineAt: input.deadlineAt,
            decisionNote: input.decisionNote,
          }),
        entityFeedback('review', 'saved')
      )
      if (next) keep({ reviews: next })
      router.refresh()

      return next !== null
    },
    [run, keep, router]
  )

  return {
    isLoading,
    skills: data?.skills ?? [],
    reviews: data?.reviews ?? [],
    isSaving,
    issues,
    clearIssues,
    setSkill,
    fileReview,
    decide,
  }
}
