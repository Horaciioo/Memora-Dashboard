'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Byline } from '@/components/elements/display/Byline'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import type { GateCheck } from '@/composites/modview/types'
import { useViewerComments } from '@/core/hooks/data/lives/useViewerComments'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import type { Chatter } from '@/types/modview'
import { formatDayTime } from '@/utils/format/time/dates'

export interface ViewerNotesProps {
  liveId: string
  chatter: Chatter
  gate: GateCheck
}

/**
 * Private notes the team keeps on a viewer
 * @param {string} liveId - Live the notes hang on
 * @param {Chatter} chatter - Viewer
 * @param {GateCheck} gate - Rights check
 * @return {JSX.Element}
 */

export const ViewerNotes = ({ liveId, chatter, gate }: ViewerNotesProps) => {
  const [draft, setDraft] = useState('')
  const [isWriting, setIsWriting] = useState(false)
  const { comments, isSaving, add } = useViewerComments(liveId, chatter.id, chatter.login)
  const moderate = gate({ kind: 'ban', chatterId: chatter.id, reason: null })
  const isEmpty = comments !== null && comments.length === 0

  const send = async () => {
    const text = draft.trim()
    if (text && (await add(text))) setDraft('')
  }

  return (
    <div className={MODVIEW_USER.notes}>
      {(!isEmpty || isWriting) && (
        <section className={MODVIEW_USER.section}>
          <textarea
            autoFocus={isWriting}
            className={MODVIEW_USER.comment}
            placeholder={MODVIEW_USER_COPY.commentPlaceholder}
            aria-label={MODVIEW_USER_COPY.commentField}
            value={draft}
            disabled={!moderate.allowed}
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button
            variant="primary"
            isLoading={isSaving}
            disabled={!moderate.allowed || !draft.trim()}
            title={moderate.reason ?? undefined}
            onClick={() => void send()}
          >
            {MODVIEW_USER_COPY.commentSend}
          </Button>
        </section>
      )}

      {isEmpty && !isWriting && (
        <EmptyState
          compact
          figure="notes"
          title={MODVIEW_USER_COPY.notesEmptyTitle}
          action={
            <Button
              variant="primary"
              disabled={!moderate.allowed}
              title={moderate.reason ?? undefined}
              onClick={() => setIsWriting(true)}
            >
              {MODVIEW_USER_COPY.notesEmptyAction}
            </Button>
          }
        />
      )}

      {(comments?.length ?? 0) > 0 && (
        <div className={MODVIEW_USER.messages}>
          {comments!.map((comment) => (
            <article key={comment.id} className={MODVIEW_USER.message}>
              <div className={MODVIEW_USER.commentHead}>
                <span className={MODVIEW_USER.commentAuthor}>
                  <Byline
                    name={comment.authorName}
                    avatar={comment.authorAvatar}
                    date={formatDayTime(comment.createdAt)}
                  />
                </span>
              </div>
              <p className={MODVIEW_USER.commentBody}>{comment.body}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
