'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { MODVIEW_TEAM_COPY as COPY } from '@/declarations/modview/watch'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import type { FieldDefinition, FieldOption, FormValues } from '@/types/forms'

export interface LiveReinforcementEditorProps {
  liveId: string
  open: boolean
  onClose: () => void
}

/**
 * Drawer where the Responsables call members from outside the team to a live
 * @param {string} liveId - Live
 * @param {boolean} open - Drawer is mounted
 * @param {() => void} onClose - Dismiss handler
 * @return {JSX.Element}
 */

export const LiveReinforcementEditor = ({
  liveId,
  open,
  onClose,
}: LiveReinforcementEditorProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const { data } = useQuery({
    queryKey: ['live-reinforcement', liveId],
    queryFn: ({ signal }) =>
      apiGet<{ options: FieldOption[] }>(API_ROUTES.liveReinforcement(liveId), signal),
    enabled: open,
    // Always who is still outside
    gcTime: 0,
  })

  const fields = useMemo<FieldDefinition[]>(
    () => [
      {
        name: 'accountIds',
        kind: 'multiselect',
        label: COPY.reinforceLabel,
        options: data?.options ?? [],
        mark: 'avatar',
      },
    ],
    [data]
  )

  const save = async (values: FormValues): Promise<boolean> => {
    const accountIds = Array.isArray(values.accountIds) ? values.accountIds : []
    if (accountIds.length === 0) return true

    const done = await run(
      () => apiPost(API_ROUTES.liveReinforcement(liveId), { accountIds }),
      COPY.reinforced
    )
    if (done === null) return false

    router.refresh()

    return true
  }

  return (
    <FormDrawer
      subject={FORM_SUBJECTS.live}
      open={open && data !== undefined}
      title={COPY.reinforceTitle}
      fields={fields}
      initialValues={{ accountIds: [] }}
      issues={[]}
      isSaving={isSaving}
      onSubmit={save}
      onClose={onClose}
    />
  )
}
