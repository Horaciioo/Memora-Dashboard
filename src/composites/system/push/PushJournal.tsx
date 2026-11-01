'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { DataTable } from '@/components/structures/data/DataTable'
import type { DataTableColumn } from '@/components/structures/data/DataTable'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { NOTIFICATION_KIND_REGISTRY } from '@/declarations/notifications/registries'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PUSH_CONSOLE_COPY } from '@/declarations/pwa/copy'
import { PUSH_STATUS_TONES } from '@/declarations/pwa/push'
import { PUSH_STYLES } from '@/declarations/ui/variants'
import type { PushDeliveryView, PushJournalPage } from '@/types/push'
import { formatDayTime } from '@/utils/format/dates'
import { deviceLabel } from '@/utils/format/device'
import { PUSH_DELIVERY_STATUSES } from '@/utils/constants/push'

// Journal columns
const COLUMNS: DataTableColumn<PushDeliveryView>[] = [
  {
    key: 'date',
    header: PUSH_CONSOLE_COPY.columnDate,
    render: (row) => formatDayTime(row.createdAt),
  },
  {
    key: 'member',
    header: PUSH_CONSOLE_COPY.columnMember,
    render: (row) => <span className={PUSH_STYLES.journalMember}>{row.accountName}</span>,
  },
  {
    key: 'notification',
    header: PUSH_CONSOLE_COPY.columnNotification,
    render: (row) =>
      row.isTest
        ? `${PUSH_CONSOLE_COPY.test} · ${row.kind ? NOTIFICATION_KIND_REGISTRY.label(row.kind) : ''}`
        : row.kind
          ? NOTIFICATION_KIND_REGISTRY.label(row.kind)
          : null,
  },
  {
    key: 'device',
    header: PUSH_CONSOLE_COPY.columnDevice,
    render: (row) => deviceLabel(row.device, PREFERENCES_COPY.unknownDevice),
  },
  {
    key: 'result',
    header: PUSH_CONSOLE_COPY.columnResult,
    render: (row) => (
      <Status
        tone={PUSH_STATUS_TONES[row.status]}
        label={`${PUSH_DELIVERY_STATUSES.label(PUSH_DELIVERY_STATUSES.ids[row.status])}${row.statusCode ? ` (${row.statusCode})` : ''}`}
      />
    ),
  },
]

export interface PushJournalProps {
  initial: PushJournalPage
}

/**
 * Pushes handed to the push services, newest first
 * @param {PushJournalPage} initial - First page resolved server-side
 * @return {JSX.Element}
 */

export const PushJournal = ({ initial }: PushJournalProps) => {
  const [entries, setEntries] = useState(initial.entries)
  const [next, setNext] = useState(initial.next)
  const { isSaving, run } = useMutation()

  const loadMore = async () => {
    if (!next) return

    const page = await run(() => apiGet<PushJournalPage>(API_ROUTES.pushJournal(next)))
    if (!page) return

    setEntries((current) => [...current, ...page.entries])
    setNext(page.next)
  }

  return (
    <>
      <DataTable
        columns={COLUMNS}
        rows={entries}
        getRowId={(row) => row.id}
        emptyState={{
          variant: 'start',
          figure: 'notifications',
          title: PUSH_CONSOLE_COPY.journalEmptyTitle,
          description: PUSH_CONSOLE_COPY.journalEmptyLead,
          action: null,
        }}
      />
      {next && (
        <Button variant="ghost" icon="expand" disabled={isSaving} onClick={() => void loadMore()}>
          {PUSH_CONSOLE_COPY.loadMore}
        </Button>
      )}
    </>
  )
}
