'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'

export interface LaunchPimButtonProps {
  sessionId: string
}

/**
 * Launch a planned promotion
 * @param {string} sessionId - Session identifier
 * @return {JSX.Element}
 */

export const LaunchPimButton = ({ sessionId }: LaunchPimButtonProps) => {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const { isSaving, run } = useMutation()

  return (
    <span {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.sessionLaunch }}>
      <Button variant="primary" icon="climb" onClick={() => setConfirming(true)}>
        {ACADEMY_COPY.launch}
      </Button>
      <ConfirmDialog
        open={confirming}
        title={ACADEMY_COPY.launchTitle}
        description={ACADEMY_COPY.launchDescription}
        tone="success"
        pending={isSaving}
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          const done = await run(
            () => apiPost(API_ROUTES.sessionLaunch(sessionId), {}),
            ACADEMY_COPY.launched
          )
          setConfirming(false)
          if (done) router.refresh()
        }}
      />
    </span>
  )
}
