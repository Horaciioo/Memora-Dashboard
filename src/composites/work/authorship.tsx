import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { FIELD_COPY } from '@/declarations/ui/copy'
import { DATE_COPY } from '@/declarations/ui/dates'
import { AUTHORSHIP_STYLES } from '@/declarations/ui/variants'
import type { WorkAuthorship, WorkPerson } from '@/types/work'
import { formatDayTime } from '@/utils/format/dates'

export interface AuthorshipStripProps {
  record: WorkAuthorship
}

/**
 * Draw the member behind a stamp, a portrait beside their name
 * @param {WorkPerson | null} person - Member who touched the record
 * @return {ReactNode} - Portrait and name, a dash when nobody is named
 */

const stamp = (person: WorkPerson | null): ReactNode =>
  person ? (
    <>
      <Avatar name={person.name} src={person.src} size="xs" />
      {person.name}
    </>
  ) : (
    DATE_COPY.none
  )

/**
 * Single line of who opened a record and who touched it last, sitting above its journal
 * since both answer the same question
 * @param {WorkAuthorship} record - Who touched the record and when
 * @return {JSX.Element}
 */

export const AuthorshipStrip = ({ record }: AuthorshipStripProps) => {
  const stamps = [
    { label: FIELD_COPY.createdBy, value: stamp(record.createdBy) },
    { label: FIELD_COPY.createdAt, value: formatDayTime(record.createdAt) },
    { label: FIELD_COPY.updatedBy, value: stamp(record.updatedBy) },
    { label: FIELD_COPY.updatedAt, value: formatDayTime(record.updatedAt) },
  ]

  return (
    <p className={AUTHORSHIP_STYLES.strip}>
      {stamps.map((entry, index) => (
        <Fragment key={entry.label}>
          {index > 0 && <span className={AUTHORSHIP_STYLES.separator} aria-hidden="true" />}
          <span className={AUTHORSHIP_STYLES.stamp}>
            <span className={AUTHORSHIP_STYLES.label}>{entry.label}</span>
            {entry.value}
          </span>
        </Fragment>
      ))}
    </p>
  )
}
