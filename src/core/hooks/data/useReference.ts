'use client'

import { useCallback, useState } from 'react'

import { apiDelete, apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import { referenceSection } from '@/declarations/reference/sections'
import { feedbackTitle } from '@/declarations/ui/copy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { ReferenceKey } from '@/declarations/reference/sections'
import type { ReferenceRow } from '@/types/reference'

/**
 * Reference collection state and mutations
 * @typedef {Object} ReferenceCollection
 * @property {ReferenceRow[]} rows - Current rows
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last mutation
 * @property {(values: FormValues) => Promise<boolean>} create - Add a row
 * @property {(id: string, values: FormValues) => Promise<boolean>} update - Edit a row
 * @property {(id: string) => Promise<void>} remove - Drop a row
 * @property {(ids: string[]) => Promise<void>} reorder - Apply a new order
 * @property {() => void} clearIssues - Forget the rejections
 */

export interface ReferenceCollection {
  rows: ReferenceRow[]
  isSaving: boolean
  issues: FieldIssue[]
  create: (values: FormValues) => Promise<boolean>
  update: (id: string, values: FormValues) => Promise<boolean>
  remove: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
  clearIssues: () => void
}

/**
 * Drive one reference collection from the admin console
 * @param {ReferenceKey} section - Collection key
 * @param {ReferenceRow[]} initialRows - Rows resolved server-side
 * @return {ReferenceCollection} - State and mutations
 */

export const useReference = (
  section: ReferenceKey,
  initialRows: ReferenceRow[]
): ReferenceCollection => {
  const [rows, setRows] = useState(initialRows)
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Toast entity label
  const meta = referenceSection(section)
  const entity = meta?.singular ?? section
  const gender = meta?.gender ?? 'masculine'

  const create = useCallback(
    async (values: FormValues) => {
      const name = typeof values.name === 'string' ? values.name : undefined
      const row = await run(
        () => apiPost<ReferenceRow>(API_ROUTES.reference(section), values),
        feedbackTitle(entity, 'created', gender, name)
      )

      if (row) setRows((current) => [...current, row])

      return row !== null
    },
    [section, run, entity, gender]
  )

  const update = useCallback(
    async (id: string, values: FormValues) => {
      const name = typeof values.name === 'string' ? values.name : undefined
      const row = await run(
        () => apiPatch<ReferenceRow>(API_ROUTES.referenceItem(section, id), values),
        feedbackTitle(entity, 'saved', gender, name)
      )

      if (row) setRows((current) => current.map((entry) => (entry.id === id ? row : entry)))

      return row !== null
    },
    [section, run, entity, gender]
  )

  const remove = useCallback(
    async (id: string) => {
      const name = rows.find((row) => row.id === id)?.label
      const done = await run(
        () => apiDelete<{ id: string }>(API_ROUTES.referenceItem(section, id)),
        feedbackTitle(entity, 'deleted', gender, name)
      )

      if (done) setRows((current) => current.filter((entry) => entry.id !== id))
    },
    [section, run, entity, gender, rows]
  )

  const reorder = useCallback(
    async (ids: string[]) => {
      // Paint the new order first, the server confirms right after
      setRows((current) =>
        ids.map((id) => current.find((entry) => entry.id === id)).filter((row) => row !== undefined)
      )

      const next = await run(
        () => apiPatch<ReferenceRow[]>(API_ROUTES.referenceOrder(section), { ids }),
        REFERENCE_COPY.reordered
      )

      if (next) setRows(next)
    },
    [section, run]
  )

  return { rows, isSaving, issues, create, update, remove, reorder, clearIssues }
}
