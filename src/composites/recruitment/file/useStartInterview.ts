'use client'

import { useRouter } from 'next/navigation'

import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { ROUTES } from '@/declarations/navigation'

/**
 * Start an interview then open its page
 * @return {(candidateId: string) => void} - Starter
 */

export const useStartInterview = () => {
  const router = useRouter()
  const { detail, file } = useRecruitmentState()

  return (candidateId: string) =>
    void file
      .setInterview(candidateId, { started: true })
      .then(() => router.push(ROUTES.interview(detail.summary.id, candidateId)))
}
