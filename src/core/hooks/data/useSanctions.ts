'use client'

import { useCallback, useState } from 'react'

import { apiGet, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { LadderStepInput } from '@/core/services/sanctions/SanctionService'
import type { FormValues } from '@/types/forms'
import type { SanctionOffenseDetail, SanctionPanelView } from '@/types/sanctions'

/**
 * Sanction panel state and mutations
 * @typedef {Object} SanctionCollection
 * @property {SanctionPanelView} panel - Offence tiles of the open panel
 * @property {SanctionOffenseDetail | null} open - Offence opened in the dialog
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections to paint on the form
 * @property {() => void} clearIssues - Drop the rejections
 * @property {(youtuberId: string, levelId: string | null) => Promise<void>} select - Read another panel
 * @property {(id: string) => Promise<void>} openOffense - Read one offence in full
 * @property {() => void} closeOffense - Close the dialog
 * @property {(id: string, values: FormValues) => Promise<boolean>} saveOffense - Edit the wording
 * @property {(id: string, levelId: string, steps: LadderStepInput[]) => Promise<boolean>} saveLadder - Replace a ladder
 * @property {(youtuberId: string, levelId: string | null) => Promise<void>} generate - Clone the declared panel
 */

export interface SanctionCollection {
  panel: SanctionPanelView
  open: SanctionOffenseDetail | null
  isSaving: boolean
  issues: ReturnType<typeof useMutation>['issues']
  clearIssues: () => void
  select: (youtuberId: string, levelId: string | null) => Promise<void>
  openOffense: (id: string) => Promise<void>
  closeOffense: () => void
  saveOffense: (id: string, values: FormValues) => Promise<boolean>
  saveLadder: (id: string, levelId: string, steps: LadderStepInput[]) => Promise<boolean>
  generate: (youtuberId: string, levelId: string | null) => Promise<void>
}

/**
 * Drive the sanction panel
 * @param {SanctionPanelView} initialPanel - Panel resolved server-side
 * @return {SanctionCollection} - State and mutations
 */

export const useSanctions = (initialPanel: SanctionPanelView): SanctionCollection => {
  const [panel, setPanel] = useState(initialPanel)
  const [open, setOpen] = useState<SanctionOffenseDetail | null>(null)
  const { isSaving, issues, clearIssues, run } = useMutation()

  const select = useCallback(async (youtuberId: string, levelId: string | null) => {
    const next = await apiGet<SanctionPanelView>(API_ROUTES.sanctions(youtuberId, levelId ?? undefined))
    setPanel(next)
  }, [])

  const openOffense = useCallback(async (id: string) => {
    setOpen(await apiGet<SanctionOffenseDetail>(API_ROUTES.sanctionOffense(id)))
  }, [])

  const saveOffense = async (id: string, values: FormValues): Promise<boolean> => {
    const next = await run(
      () => apiPatch<SanctionOffenseDetail>(API_ROUTES.sanctionOffense(id), values),
      feedbackTitle('Infraction', 'saved', 'feminine')
    )

    if (!next) return false

    setOpen(next)
    await select(panel.youtuberId, panel.activeLevelId)

    return true
  }

  const saveLadder = async (
    id: string,
    levelId: string,
    steps: LadderStepInput[]
  ): Promise<boolean> => {
    const next = await run(
      () => apiPut<SanctionOffenseDetail>(API_ROUTES.sanctionLadder(id), { levelId, steps }),
      feedbackTitle('Barème', 'saved', 'masculine')
    )

    if (!next) return false

    setOpen(next)
    await select(panel.youtuberId, panel.activeLevelId)

    return true
  }

  const generate = async (youtuberId: string, levelId: string | null) => {
    const next = await run(
      () => apiPost<SanctionPanelView>(API_ROUTES.sanctions(youtuberId, levelId ?? undefined), {}),
      feedbackTitle('Panel', 'saved', 'masculine')
    )

    if (next) setPanel(next)
  }

  return {
    panel,
    open,
    isSaving,
    issues,
    clearIssues,
    select,
    openOffense,
    closeOffense: () => setOpen(null),
    saveOffense,
    saveLadder,
    generate,
  }
}
