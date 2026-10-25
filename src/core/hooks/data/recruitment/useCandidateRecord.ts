'use client'

import { useMemo } from 'react'

import { useRecordFile } from '@/core/hooks/data/work/useRecordFile'
import type { RecordFile } from '@/core/hooks/data/work/useRecordFile'
import { API_ROUTES } from '@/core/lib/api/routes'
import { candidateRecordValues } from '@/core/lib/recruitment/candidateRecord'
import type { CandidateView } from '@/types/recruitment'

const CANDIDATE_ENTITY = { label: 'Candidat', gender: 'masculine' } as const

/**
 * Inline record of a candidate
 * @param {CandidateView} candidate - Applicant followed
 * @return {RecordFile} - State and mutations
 */

export const useCandidateRecord = (candidate: CandidateView): RecordFile => {
  // A stable object, a fresh one every render would loop the record's resync
  const initialValues = useMemo(() => candidateRecordValues(candidate), [candidate])

  return useRecordFile({
    path: API_ROUTES.candidate(candidate.id),
    entity: CANDIDATE_ENTITY,
    initialValues,
  })
}
