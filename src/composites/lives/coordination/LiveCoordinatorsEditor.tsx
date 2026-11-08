'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiGet, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_FIELD_COPY, LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'

export interface LiveCoordinatorsEditorProps {
  liveId: string
  open: boolean
  onClose: () => void
}

/**
 * Drawer where the Responsables and above pick the Coordinators of an open live
 * @param {string} liveId - Live
 * @param {boolean} open - Drawer is mounted
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const LiveCoordinatorsEditor = ({ liveId, open, onClose }: LiveCoordinatorsEditorProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const { data } = useQuery({
    queryKey: ['live-coordinators', liveId],
    queryFn: ({ signal }) =>
      apiGet<{ options: FieldOption[]; selected: string[] }>(
        API_ROUTES.liveCoordinators(liveId),
        signal
      ),
    enabled: open,
    // Always the seats as they stand
    gcTime: 0,
  })

  const fields = useMemo<FieldDefinition[]>(
    () => [
      {
        name: 'coordinatorIds',
        kind: 'multiselect',
        label: LIVE_FIELD_COPY.coordinator,
        options: data?.options ?? [],
        mark: 'avatar',
      },
    ],
    [data]
  )

  const save = async (values: FormValues): Promise<boolean> => {
    const accountIds = Array.isArray(values.coordinatorIds) ? values.coordinatorIds : []
    const done = await run(
      () => apiPut(API_ROUTES.liveCoordinators(liveId), { accountIds }),
      LIVE_COORDINATION_COPY.editSaved
    )
    if (done === null) return false

    router.refresh()

    return true
  }

  return (
    <FormDrawer
      subject={FORM_SUBJECTS.live}
      open={open && data !== undefined}
      title={LIVE_COORDINATION_COPY.editTitle}
      fields={fields}
      initialValues={{ coordinatorIds: data?.selected ?? [] }}
      issues={[]}
      isSaving={isSaving}
      onSubmit={save}
      onClose={onClose}
    />
  )
}
