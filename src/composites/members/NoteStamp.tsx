import { Status } from '@/components/elements/display/Status'
import { Dotted } from '@/components/elements/display/Dotted'
import { MEMBER_COPY } from '@/declarations/members/copy'
import type { MemberNote } from '@/types/members'
import { formatDayTime } from '@/utils/format/dates'

export interface NoteStampProps {
  note: MemberNote
}

/**
 * Who wrote a note and when, a note of the system carries its red tag beside the time
 * @param {NoteStampProps} props - Note
 * @return {JSX.Element}
 */

export const NoteStamp = ({ note }: NoteStampProps) => (
  <>
    <Dotted items={[note.authorName, formatDayTime(note.createdAt)]} />
    {note.system && (
      <span title={MEMBER_COPY.noteSystemHint} className="ml-2 inline-flex cursor-help">
        <Status label={MEMBER_COPY.noteSystem} tone="danger" />
      </span>
    )}
  </>
)
