import { Byline } from '@/components/elements/display/Byline'
import { Status } from '@/components/elements/display/Status'
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
    <Byline
      name={note.authorName}
      avatar={note.authorAvatar}
      date={formatDayTime(note.createdAt)}
    />
    {note.system && (
      <span title={MEMBER_COPY.noteSystemHint} className="ml-2 inline-flex cursor-help">
        <Status label={MEMBER_COPY.noteSystem} tone="danger" />
      </span>
    )}
  </>
)
