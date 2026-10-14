'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { RESIGNABLE_PHASES } from '@/core/lib/academy/parkour'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'

/**
 * Records the resignation of the junior, offered to a responsable and above while the PIM runs
 * @return {JSX.Element | null}
 */

export const ResignButton = () => {
  const { file, can, actions } = useJuniorState()
  const [isAsking, setAsking] = useState(false)

  if (!can.lead || !RESIGNABLE_PHASES.includes(file.junior.phase)) return null

  return (
    <>
      <Button variant="ghost" icon="close" onClick={() => setAsking(true)}>
        {PARKOUR_COPY.resign}
      </Button>
      <ConfirmDialog
        open={isAsking}
        title={PARKOUR_COPY.resignTitle}
        description={PARKOUR_COPY.resignDescription}
        tone="danger"
        pending={actions.isSaving}
        onCancel={() => setAsking(false)}
        onConfirm={async () => {
          await actions.resign()
          setAsking(false)
        }}
      />
    </>
  )
}
