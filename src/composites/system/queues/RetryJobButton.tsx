'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/ConfirmDialog'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { QUEUES_COPY } from '@/declarations/system/queues'

export interface RetryJobButtonProps {
  name: string
}

/**
 * Retry failed runs after a confirmation
 * @param {string} name - Job key
 * @return {JSX.Element}
 */

export const RetryJobButton = ({ name }: RetryJobButtonProps) => {
  const router = useRouter()
  const [isAsking, setAsking] = useState(false)
  const [isPending, setPending] = useState(false)
  const [hasFailed, setFailed] = useState(false)

  const retry = async () => {
    setPending(true)
    setFailed(false)

    try {
      await apiPost(API_ROUTES.retryJob(name), {})
      router.refresh()
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
      setAsking(false)
    }
  }

  return (
    <>
      <Button onClick={() => setAsking(true)}>
        {hasFailed ? QUEUES_COPY.retryFailed : QUEUES_COPY.retry}
      </Button>
      <ConfirmDialog
        open={isAsking}
        title={QUEUES_COPY.retryTitle}
        description={QUEUES_COPY.retryLead}
        confirmLabel={QUEUES_COPY.retry}
        tone="warning"
        pending={isPending}
        onCancel={() => setAsking(false)}
        onConfirm={retry}
      />
    </>
  )
}
