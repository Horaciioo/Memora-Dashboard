'use client'

import { Button } from '@/components/elements/actions/Button'
import { Status } from '@/components/elements/display/Status'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { AddRow } from '@/components/structures/AddRow'
import { Section } from '@/components/structures/Section'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { useEditGestures } from '@/core/hooks/interaction/useEditGestures'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { ACADEMY_STAGE_REGISTRY, NOTE_KIND_REGISTRY } from '@/declarations/academy/registries'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

/**
 * Confidential notes written on the junior
 * @return {JSX.Element}
 */

export const NotesTab = () => {
  const { file, can, noteForm, setPendingNote } = useJuniorState()
  const gestures = useEditGestures()

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiNoteAdd }}>
      <Section title={ACADEMY_COPY.tabNotes} bare>
        {!can.readNotes ? (
          <EmptyState
            figure="notes"
            title={ACADEMY_COPY.confidential}
            description={ACADEMY_COPY.noteLocked}
            action={
              <Button icon="blocked" disabled>
                {ACADEMY_COPY.confidential}
              </Button>
            }
          />
        ) : file.notes.length === 0 ? (
          <EmptyState
            figure="notes"
            title={ACADEMY_COPY.noteEmptyTitle}
            description={ACADEMY_COPY.noteEmptyDescription}
            action={
              <Button
                variant="primary"
                icon="add"
                disabled={!can.writeNotes}
                onClick={() => noteForm(null)}
              >
                {ACADEMY_COPY.noteAdd}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {file.notes.map((note) => {
              const kind = NOTE_KIND_REGISTRY.get(note.kind)

              return (
                <article
                  key={note.id}
                  className={cn(
                    MEMBER_FILE.note,
                    can.writeNotes &&
                      'cursor-pointer transition-shadow hover:shadow-[var(--shadow-md)]'
                  )}
                  {...gestures({
                    canEdit: can.writeNotes,
                    label: kind.label,
                    onEdit: () => noteForm(note),
                    onRemove: () => setPendingNote(note),
                  })}
                >
                  <header className="flex flex-wrap items-center gap-2">
                    <Status label={kind.label} accent={kind.accent} />
                    <span className="text-xs text-[var(--color-ink-subtle)]">
                      {[
                        ACADEMY_STAGE_REGISTRY.label(note.stage),
                        note.authorName,
                        formatDay(note.createdAt),
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </header>
                  <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                </article>
              )
            })}
            <AddRow
              label={ACADEMY_COPY.noteAdd}
              disabled={!can.writeNotes}
              onClick={() => noteForm(null)}
            />
          </div>
        )}
      </Section>
    </div>
  )
}
