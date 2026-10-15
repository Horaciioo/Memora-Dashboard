'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { toActivityCsv } from '@/core/lib/system/activityCsv'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_COPY } from '@/declarations/system/journal'

/**
 * Download the filtered journal
 * @return {JSX.Element}
 */

export const JournalExport = () => {
  const params = useSearchParams()
  const [isBusy, setBusy] = useState(false)
  const [hasFailed, setFailed] = useState(false)

  const download = async () => {
    setBusy(true)
    setFailed(false)

    try {
      const entries = await apiGet<ActivityEntry[]>(API_ROUTES.journalExport(params.toString()))
      const blob = new Blob([toActivityCsv(entries)], { type: 'text/csv;charset=utf-8' })

      // Temporary link
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${JOURNAL_COPY.exportFile}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      URL.revokeObjectURL(link.href)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button isLoading={isBusy} onClick={download}>
      {hasFailed ? JOURNAL_COPY.exportFailed : JOURNAL_COPY.export}
    </Button>
  )
}
