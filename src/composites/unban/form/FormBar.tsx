'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ConfirmDialog } from '@/components/structures/overlays/ConfirmDialog'
import { diffSnapshots } from '@/core/lib/unban/formDiff'
import type { UnbanFormEditor } from '@/core/hooks/data/unban/useUnbanForm'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import { formatDay } from '@/utils/format/time/dates'

export interface FormBarProps {
  editor: UnbanFormEditor
}

/**
 * Version served, state of the draft, and the two ways out of it
 * @param {UnbanFormEditor} editor - Form being edited
 * @return {JSX.Element | null}
 */

export const FormBar = ({ editor }: FormBarProps) => {
  const [ask, setAsk] = useState<'publish' | 'discard' | null>(null)
  const { active, snapshot } = editor

  if (!active || !snapshot) return null

  const change = diffSnapshots(active.snapshot, snapshot)
  const changes = [
    [UNBAN_SCREEN_COPY.formChangeAdded, change.added],
    [UNBAN_SCREEN_COPY.formChangeChanged, change.changed],
    [UNBAN_SCREEN_COPY.formChangeRemoved, change.removed],
  ]
    .filter(([, labels]) => labels.length > 0)
    .map(([title, labels]) => `${title} ${(labels as string[]).join(', ')}.`)

  const saveNote = {
    saving: UNBAN_SCREEN_COPY.formSaving,
    saved: editor.hasDraft ? UNBAN_SCREEN_COPY.formSaved : '',
    failed: editor.saveError ?? UNBAN_SCREEN_COPY.formFailed,
  }[editor.saveState]

  return (
    <div className={UNBAN_DESK_STYLES.bar2}>
      <div>
        <p className="text-sm font-semibold">{UNBAN_SCREEN_COPY.formLive}</p>
        <p className={UNBAN_DESK_STYLES.barNote}>
          {editor.hasDraft
            ? `${UNBAN_COPY.formDraft}. ${saveNote}`
            : [
                active.publishedAt
                  ? UNBAN_SCREEN_COPY.formLiveSince.replace('{date}', formatDay(active.publishedAt))
                  : '',
                saveNote,
              ]
                .filter(Boolean)
                .join('. ')}
        </p>
      </div>
      {editor.hasDraft && (
        <div className={UNBAN_DESK_STYLES.actions}>
          <Button onClick={() => setAsk('discard')}>{UNBAN_COPY.formDiscard}</Button>
          <Button
            variant="primary"
            disabled={editor.saveState !== 'saved'}
            onClick={() => setAsk('publish')}
          >
            {UNBAN_SCREEN_COPY.formPublish}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={ask === 'publish'}
        title={UNBAN_SCREEN_COPY.formPublishTitle}
        description={[UNBAN_SCREEN_COPY.formPublishDescription, ...changes].join(' ')}
        confirmLabel={ACTION_COPY.confirm}
        tone="success"
        pending={editor.isSaving}
        onCancel={() => setAsk(null)}
        onConfirm={async () => {
          await editor.publish()
          setAsk(null)
        }}
      />
      <ConfirmDialog
        open={ask === 'discard'}
        title={UNBAN_SCREEN_COPY.formDiscardTitle}
        description={UNBAN_SCREEN_COPY.formDiscardDescription}
        confirmLabel={ACTION_COPY.confirm}
        tone="danger"
        pending={editor.isSaving}
        onCancel={() => setAsk(null)}
        onConfirm={async () => {
          await editor.discard()
          setAsk(null)
        }}
      />
    </div>
  )
}
