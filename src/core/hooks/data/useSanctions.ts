'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import type { FormValues } from '@/types/forms'
import type { SanctionOffenseDetail, SanctionPanelView, SanctionRungInput } from '@/types/sanctions'
import type { SanctionGravityName, SanctionPanelName } from '@/utils/constants/moderation'

/**
 * Sanction panel state and mutations
 * @typedef {Object} SanctionCollection
 * @property {SanctionPanelView} panel - Tiles of the panel on screen
 * @property {SanctionOffenseDetail | null} open - Offence opened in the sheet
 * @property {boolean} isLoading - Panel being read
 * @property {boolean} isOpening - Offence sheet being read
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {(panel: SanctionPanelName, levelId: string | null) => Promise<void>} select - Read another panel
 * @property {(id: string) => Promise<void>} openOffense - Read one offence in full
 * @property {() => void} closeOffense - Close the sheet
 * @property {(id: string, values: FormValues) => Promise<boolean>} saveOffense - Edit the wording
 * @property {(id: string, levelId: string, gravity: SanctionGravityName, steps: SanctionRungInput[]) => Promise<boolean>} saveLadder - Replace a ladder
 * @property {(replace: boolean) => Promise<void>} generate - Clone the reference panel
 * @property {(name: string) => Promise<boolean>} createOffense - Add a blank offence and open it
 * @property {(id: string) => Promise<boolean>} removeOffense - Drop an offence
 */

export interface SanctionCollection {
  panel: SanctionPanelView
  open: SanctionOffenseDetail | null
  isLoading: boolean
  isOpening: boolean
  isSaving: boolean
  issues: ReturnType<typeof useMutation>['issues']
  select: (panel: SanctionPanelName, levelId: string | null) => Promise<void>
  openOffense: (id: string) => Promise<void>
  closeOffense: () => void
  saveOffense: (id: string, values: FormValues) => Promise<boolean>
  saveLadder: (
    id: string,
    levelId: string,
    gravity: SanctionGravityName,
    steps: SanctionRungInput[]
  ) => Promise<boolean>
  generate: (replace: boolean) => Promise<void>
  createOffense: (name: string) => Promise<boolean>
  removeOffense: (id: string) => Promise<boolean>
}

/**
 * Drive the sanction panel of one creator
 * @param {SanctionPanelView} initialPanel - Panel resolved server-side
 * @return {SanctionCollection} - State and mutations
 */

export const useSanctions = (initialPanel: SanctionPanelView): SanctionCollection => {
  const [panel, setPanel] = useState(initialPanel)
  const [open, setOpen] = useState<SanctionOffenseDetail | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [isOpening, setOpening] = useState(false)
  const { isSaving, issues, run } = useMutation()

  const select = useCallback(
    async (next: SanctionPanelName, levelId: string | null) => {
      setLoading(true)
      try {
        setPanel(
          await apiGet<SanctionPanelView>(API_ROUTES.sanctions(panel.youtuberId, next, levelId))
        )
      } finally {
        setLoading(false)
      }
    },
    [panel.youtuberId]
  )

  const refresh = useCallback(
    () => select(panel.panel, panel.levelId),
    [panel.levelId, panel.panel, select]
  )

  const openOffense = useCallback(async (id: string) => {
    setOpening(true)
    try {
      setOpen(await apiGet<SanctionOffenseDetail>(API_ROUTES.sanctionOffense(id)))
    } finally {
      setOpening(false)
    }
  }, [])

  const saveOffense = useCallback(
    async (id: string, values: FormValues) => {
      const next = await run(
        () => apiPatch<SanctionOffenseDetail>(API_ROUTES.sanctionOffense(id), values),
        SANCTION_COPY.offenseSaved
      )
      if (!next) return false

      // A card renamed from the panel never opens its sheet
      setOpen((current) => (current?.id === id ? next : current))
      await refresh()

      return true
    },
    [refresh, run]
  )

  const saveLadder = useCallback(
    async (
      id: string,
      levelId: string,
      gravity: SanctionGravityName,
      steps: SanctionRungInput[]
    ) => {
      const next = await run(
        () =>
          apiPut<SanctionOffenseDetail>(API_ROUTES.sanctionLadder(id), { levelId, gravity, steps }),
        SANCTION_COPY.ladderSaved
      )
      if (!next) return false

      setOpen(next)
      await refresh()

      return true
    },
    [refresh, run]
  )

  const generate = useCallback(
    async (replace: boolean) => {
      const next = await run(
        () =>
          apiPost<SanctionPanelView>(
            API_ROUTES.sanctions(panel.youtuberId, panel.panel, panel.levelId, replace),
            {}
          ),
        SANCTION_COPY.generated
      )
      if (next) setPanel(next)
    },
    [panel.levelId, panel.panel, panel.youtuberId, run]
  )

  const createOffense = useCallback(
    async (name: string) => {
      const next = await run(
        () =>
          apiPost<SanctionOffenseDetail>(
            API_ROUTES.sanctionOffenses(panel.youtuberId, panel.panel),
            {
              name,
            }
          ),
        SANCTION_COPY.offenseCreated
      )
      if (!next) return false

      setOpen(next)
      await refresh()

      return true
    },
    [panel.panel, panel.youtuberId, refresh, run]
  )

  const removeOffense = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.sanctionOffense(id)),
        SANCTION_COPY.offenseRemoved
      )
      if (!done) return false

      setOpen((current) => (current?.id === id ? null : current))
      await refresh()

      return true
    },
    [refresh, run]
  )

  return {
    panel,
    open,
    isLoading,
    isOpening,
    isSaving,
    issues,
    select,
    openOffense,
    closeOffense: () => setOpen(null),
    saveOffense,
    saveLadder,
    generate,
    createOffense,
    removeOffense,
  }
}
