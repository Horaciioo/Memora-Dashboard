'use client'

import { useRouter } from 'next/navigation'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import {
  useQuestionnaire,
  type Questionnaire,
} from '@/core/hooks/data/recruitment/useQuestionnaire'
import {
  useRecruitmentFile,
  type RecruitmentFile,
} from '@/core/hooks/data/recruitment/useRecruitmentFile'
import { canMoveStep } from '@/core/lib/recruitment/stepState'
import { ROUTES } from '@/declarations/navigation'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { ACTION_COPY } from '@/declarations/ui/copy'
import type { MenuItem } from '@/managers/front-end'
import type {
  CandidateView,
  RecruitmentDetail,
  RecruitmentFields,
  RecruitmentRights,
  RecruitmentStepView,
} from '@/types/recruitment'

/**
 * Form or dialog standing open
 * @typedef {'candidate' | 'step' | null} RecruitmentDialog
 */

export type RecruitmentDialog = 'candidate' | 'step' | null

/**
 * Everything the tabs of a recruitment file share
 * @typedef {Object} RecruitmentFileState
 */

export interface RecruitmentFileState {
  detail: RecruitmentDetail
  file: RecruitmentFile
  fields: RecruitmentFields
  can: RecruitmentRights
  questionnaire: Questionnaire
  dialog: RecruitmentDialog
  closeDialog: () => void
  editingCandidate: CandidateView | null
  editingStep: RecruitmentStepView | null
  pendingCandidate: CandidateView | null
  pendingStep: RecruitmentStepView | null
  advancingStep: RecruitmentStepView | null
  setAdvancingStep: (step: RecruitmentStepView | null) => void
  setPendingCandidate: (candidate: CandidateView | null) => void
  setPendingStep: (step: RecruitmentStepView | null) => void
  openCandidate: (id: string) => void
  candidateForm: (candidate: CandidateView | null) => void
  stepForm: (step: RecruitmentStepView | null) => void
  candidateMenu: (candidate: CandidateView) => MenuItem[]
  stepMenu: (step: RecruitmentStepView) => MenuItem[]
  // Clearing asks first, reopening goes straight
  toggleStep: (step: RecruitmentStepView) => void
  isStepMovable: (step: RecruitmentStepView) => boolean
}

const FileContext = createContext<RecruitmentFileState | null>(null)

/**
 * Read the state of the open recruitment file
 * @return {RecruitmentFileState} - Shared state
 */

export const useRecruitmentState = (): RecruitmentFileState => {
  const state = useContext(FileContext)
  if (!state) throw new Error('useRecruitmentState needs a RecruitmentFileProvider')

  return state
}

export interface RecruitmentFileProviderProps {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  children: ReactNode
}

/**
 * Hold the state of a recruitment file for its tabs
 * @param {RecruitmentDetail} detail - File resolved server-side
 * @param {RecruitmentFields} fields - Declarations of the forms
 * @param {RecruitmentRights} can - What the viewer may do
 * @param {ReactNode} children - Tabs and drawers
 * @return {JSX.Element}
 */

export const RecruitmentFileProvider = ({
  detail,
  fields,
  can,
  children,
}: RecruitmentFileProviderProps) => {
  const router = useRouter()
  const file = useRecruitmentFile(detail)
  const { platform, youtuber } = detail.summary
  const questionnaire = useQuestionnaire(platform, youtuber.label, file.questionKeys)
  const [dialog, setDialog] = useState<RecruitmentDialog>(null)
  const [editingCandidate, setEditingCandidate] = useState<CandidateView | null>(null)
  const [editingStep, setEditingStep] = useState<RecruitmentStepView | null>(null)
  const [pendingCandidate, setPendingCandidate] = useState<CandidateView | null>(null)
  const [pendingStep, setPendingStep] = useState<RecruitmentStepView | null>(null)
  const [advancingStep, setAdvancingStep] = useState<RecruitmentStepView | null>(null)

  const openCandidate = (id: string) => router.push(ROUTES.candidate(detail.summary.id, id))

  const openDialog = (next: RecruitmentDialog) => {
    file.clearIssues()
    setDialog(next)
  }

  const candidateForm = (candidate: CandidateView | null) => {
    setEditingCandidate(candidate)
    openDialog('candidate')
  }

  const stepForm = (step: RecruitmentStepView | null) => {
    setEditingStep(step)
    openDialog('step')
  }

  // Only the next step is cleared, only the last one reopens
  const isStepMovable = (step: RecruitmentStepView) =>
    can.manage && canMoveStep(file.steps, step.id, step.doneAt === null)

  const toggleStep = (step: RecruitmentStepView) => {
    if (step.doneAt === null) setAdvancingStep(step)
    else void file.setStepDone(step.id, false)
  }

  const candidateMenu = (candidate: CandidateView): MenuItem[] => [
    {
      id: 'open',
      label: ACTION_COPY.open,
      icon: 'forward',
      onSelect: () => openCandidate(candidate.id),
    },
    {
      id: 'interview',
      label: QUESTIONNAIRE_COPY.start,
      icon: 'voice',
      disabled: !can.writeCandidates,
      onSelect: () => openCandidate(candidate.id),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !can.writeCandidates,
      onSelect: () => candidateForm(candidate),
    },
    {
      id: 'member',
      label: RECRUITMENT_COPY.openMember,
      icon: 'members',
      disabled: candidate.memberId === null,
      onSelect: () => router.push(ROUTES.member(candidate.memberId!)),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !can.manage,
      onSelect: () => setPendingCandidate(candidate),
    },
  ]

  const stepMenu = (step: RecruitmentStepView): MenuItem[] => [
    {
      id: 'done',
      label: step.doneAt ? RECRUITMENT_COPY.stepUndone : RECRUITMENT_COPY.stepDone,
      icon: 'confirm',
      disabled: !isStepMovable(step),
      onSelect: () => toggleStep(step),
    },
    {
      id: 'edit',
      label: ACTION_COPY.edit,
      icon: 'edit',
      disabled: !can.manage,
      onSelect: () => stepForm(step),
    },
    {
      id: 'delete',
      label: ACTION_COPY.delete,
      icon: 'remove',
      danger: true,
      separatorBefore: true,
      disabled: !can.manage,
      onSelect: () => setPendingStep(step),
    },
  ]

  const state: RecruitmentFileState = {
    detail,
    file,
    fields,
    can,
    questionnaire,
    dialog,
    closeDialog: () => setDialog(null),
    editingCandidate,
    editingStep,
    pendingCandidate,
    pendingStep,
    advancingStep,
    setAdvancingStep,
    setPendingCandidate,
    setPendingStep,
    openCandidate,
    candidateForm,
    stepForm,
    candidateMenu,
    stepMenu,
    toggleStep,
    isStepMovable,
  }

  return <FileContext.Provider value={state}>{children}</FileContext.Provider>
}
