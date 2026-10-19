import { Avatar } from '@/components/elements/display/Avatar'
import { Section } from '@/components/structures/page/Section'
import type { ModeratorOption } from '@/composites/lives/bilan/moderation/ModeratorPicker'
import { BILAN_COPY } from '@/declarations/lives/bilan'
import { LIVE_REPORT } from '@/declarations/ui/variants'
import type { LiveNote } from '@/types/lives'
import { formatHourMark } from '@/utils/format/dates'

export interface NotesBoxesProps {
  notes: LiveNote[]
  options: ModeratorOption[]
}

/**
 * Notes left on viewers during the live: the total, then one box per author
 * @param {LiveNote[]} notes - Notes
 * @param {ModeratorOption[]} options - Moderators, for the portraits
 * @return {JSX.Element}
 */

export const NotesBoxes = ({ notes, options }: NotesBoxesProps) => {
  const byAuthor = [...Map.groupBy(notes, (note) => note.authorId ?? note.authorName)]

  return (
    <Section title={BILAN_COPY.notesTitle} description={BILAN_COPY.notesLead} padded>
      {notes.length === 0 ? (
        <p className={LIVE_REPORT.empty}>{BILAN_COPY.notesEmpty}</p>
      ) : (
        <>
          <div className={LIVE_REPORT.noteTotalRow}>
            <span className={LIVE_REPORT.noteTotal}>{notes.length}</span>
            <span className={LIVE_REPORT.figureLabel}>
              {notes.length === 1
                ? BILAN_COPY.notesOne
                : BILAN_COPY.notesCount.replace('{count}', '')}
            </span>
          </div>
          <div className={LIVE_REPORT.noteGrid}>
            {byAuthor.map(([key, list]) => {
              const author = options.find((option) => option.key === list[0].authorId)

              return (
                <article key={key} className={LIVE_REPORT.noteBox}>
                  <header className={LIVE_REPORT.noteAuthor}>
                    <Avatar name={list[0].authorName} src={author?.avatar ?? null} size="sm" />
                    {list[0].authorName}
                    <span className={LIVE_REPORT.noteAuthorCount}>{list.length}</span>
                  </header>
                  <ul className={LIVE_REPORT.noteList}>
                    {list.map((note) => (
                      <li key={note.id} className={LIVE_REPORT.noteItem}>
                        <span className={LIVE_REPORT.noteOn}>
                          {formatHourMark(note.at)}{' '}
                          {BILAN_COPY.notesOn.replace('{login}', note.viewerLogin)}
                        </span>
                        <span className={LIVE_REPORT.noteBody}>{note.body}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </>
      )}
    </Section>
  )
}
