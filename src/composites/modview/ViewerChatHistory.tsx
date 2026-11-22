'use client'

import { Fragment } from 'react'

import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { ChatText } from '@/composites/modview/ChatText'
import { useViewerChat } from '@/core/hooks/data/lives/useViewerChat'
import { MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import type { ViewerSanction } from '@/types/lives'
import type { ChatMessage } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/time/dates'
import { formatClock, formatDuration } from '@/utils/format/modview'

export interface ViewerChatHistoryProps {
  liveId: string | null
  chatterId: string
  // Lines of the live, shown alone off a real live
  liveMessages: ChatMessage[]
  // Sanctions woven between the lines, none keeps the lists apart
  sanctions?: ViewerSanction[] | null
}

// One line, whichever source it comes from
interface Line {
  id: string
  text: string
  sentAt: string
  isRemoved: boolean
  isImported: boolean
  message?: ChatMessage
  // A sanction line instead of a message
  sanction?: ViewerSanction
}

// Sanction as one plain sentence
const sanctionSentence = (row: ViewerSanction) =>
  [
    MODERATION_KINDS[row.kind].label,
    row.durationSeconds ? formatDuration(row.durationSeconds) : null,
    row.actorName ? MODVIEW_USER_COPY.sanctionBy.replace('{name}', row.actorName) : null,
    row.reason,
  ]
    .filter(Boolean)
    .join(' ')

/**
 * Everything a viewer said, oldest at the bottom, a heading per day
 * @param {string | null} liveId - Live, none off a real live
 * @param {string} chatterId - Viewer
 * @param {ChatMessage[]} liveMessages - Lines of the live
 * @return {JSX.Element}
 */

export const ViewerChatHistory = ({
  liveId,
  chatterId,
  liveMessages,
  sanctions,
}: ViewerChatHistoryProps) => {
  const chat = useViewerChat(liveId, chatterId)

  const messageLines: Line[] | null =
    liveId === null
      ? [...liveMessages].reverse().map((message) => ({
          id: message.id,
          text: message.text,
          sentAt: message.sentAt,
          isRemoved: Boolean(message.deletedBy),
          isImported: false,
          message,
        }))
      : (chat.messages?.map((row) => ({
          id: row.id,
          text: row.body,
          sentAt: row.sentAt,
          isRemoved: row.deleted,
          isImported: row.source === 'IMPORT',
        })) ?? null)

  // Sanctions older than the loaded page wait for it
  const merged = sanctions !== undefined
  const oldest = messageLines?.at(-1)?.sentAt
  const sanctionLines: Line[] = (sanctions ?? [])
    .filter((row) => !chat.hasMore || !oldest || row.occurredAt >= oldest)
    .map((row) => ({
      id: `sanction-${row.id}`,
      text: sanctionSentence(row),
      sentAt: row.occurredAt,
      isRemoved: false,
      isImported: false,
      sanction: row,
    }))
  const lines: Line[] | null =
    messageLines === null || (merged && sanctions === null)
      ? null
      : [...messageLines, ...sanctionLines].sort((a, b) => b.sentAt.localeCompare(a.sentAt))

  if (lines === null) return <div className={MODVIEW_USER.listBody} aria-busy="true" />
  if (lines.length === 0) {
    return (
      <div className={MODVIEW_USER.listBody}>
        <EmptyState compact figure="notes" title={MODVIEW_USER_COPY.messagesEmpty} />
      </div>
    )
  }

  // A heading each time the day changes
  const dayOf = (iso: string) => formatDay(iso)

  return (
    <div className={MODVIEW_USER.listBody}>
      {lines.map((line, index) => (
        <Fragment key={line.id}>
          {(index === 0 || dayOf(lines[index - 1]!.sentAt) !== dayOf(line.sentAt)) && (
            <h5 className={MODVIEW_USER.dayHead}>{dayOf(line.sentAt)}</h5>
          )}
          <p className={cn(MODVIEW_USER.line, line.isRemoved && MODVIEW_USER.lineRemoved)}>
            <time dateTime={line.sentAt} className={MODVIEW_USER.lineTime}>
              {formatClock(line.sentAt)}
            </time>
            <span className="min-w-0 flex-1">
              {line.sanction ? (
                <span className={MODVIEW_USER.lineSanction}>{line.text}</span>
              ) : line.message ? (
                <ChatText
                  text={line.text}
                  fragments={line.message.fragments}
                  flagged={line.message.flagged}
                />
              ) : (
                line.text
              )}
              {line.isRemoved && !merged && (
                <span className={MODVIEW_USER.lineTag}>{MODVIEW_USER_COPY.messageRemoved}</span>
              )}
              {line.isImported && (
                <span className={MODVIEW_USER.lineTag}>{MODVIEW_USER_COPY.imported}</span>
              )}
            </span>
          </p>
        </Fragment>
      ))}
      {chat.hasMore && (
        <button
          type="button"
          className={MODVIEW_USER.more}
          disabled={chat.isFetchingMore}
          onClick={chat.loadMore}
        >
          {MODVIEW_USER_COPY.historyOlder}
        </button>
      )}
    </div>
  )
}
