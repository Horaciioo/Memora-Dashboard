import { Status } from '@/components/elements/display/Status'
import { DataTable } from '@/components/structures/data/DataTable'
import type { DataTableColumn } from '@/components/structures/data/DataTable'
import type { MailJournalEntry } from '@/core/services/mail/JournalService'
import { MAIL_STATUS_TONES } from '@/declarations/mail/status'
import { MAIL_CONSOLE_COPY, MAIL_TEMPLATES } from '@/declarations/mail/copy'
import { MAIL_STYLES } from '@/declarations/ui/variants'
import { formatDayTime } from '@/utils/format/time/dates'
import type { MailKindName } from '@/utils/constants/mail'

// Journal columns
const COLUMNS: DataTableColumn<MailJournalEntry>[] = [
  {
    key: 'date',
    header: MAIL_CONSOLE_COPY.columnDate,
    render: (row) => formatDayTime(row.createdAt),
  },
  {
    key: 'mail',
    header: MAIL_CONSOLE_COPY.columnMail,
    render: (row) => MAIL_TEMPLATES[row.kind as MailKindName]?.label ?? row.kind,
  },
  {
    key: 'reference',
    header: MAIL_CONSOLE_COPY.columnReference,
    render: (row) => row.reference ?? '',
  },
  {
    key: 'status',
    header: MAIL_CONSOLE_COPY.columnStatus,
    render: (row) => (
      <Status
        tone={MAIL_STATUS_TONES[row.status].tone}
        label={MAIL_STATUS_TONES[row.status].label}
      />
    ),
  },
  {
    key: 'detail',
    header: MAIL_CONSOLE_COPY.columnDetail,
    render: (row) => <span className={MAIL_STYLES.muted}>{row.detail ?? ''}</span>,
  },
]

export interface MailJournalProps {
  entries: MailJournalEntry[]
}

/**
 * Mails handed to the provider, newest first
 * @param {MailJournalEntry[]} entries - Lines
 * @return {JSX.Element}
 */

export const MailJournal = ({ entries }: MailJournalProps) => (
  <DataTable
    columns={COLUMNS}
    rows={entries}
    getRowId={(row) => row.id}
    emptyState={{
      variant: 'start',
      figure: 'notifications',
      title: MAIL_CONSOLE_COPY.empty,
      description: MAIL_CONSOLE_COPY.journalLead,
      action: null,
    }}
  />
)
