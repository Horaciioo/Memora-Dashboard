'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { ChatText } from '@/composites/modview/ChatText'
import { UnbanQueue } from '@/composites/modview/UnbanQueue'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useBanDetail } from '@/core/hooks/data/lives/useBanDetail'
import { useViewerComments } from '@/core/hooks/data/lives/useViewerComments'
import { useViewerDossier } from '@/core/hooks/data/lives/useViewerDossier'
import { MODVIEW_UNBAN_COPY as COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_UNBAN } from '@/declarations/ui/variants'
import type { ChatMessage, UnbanRequest } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatDay, formatDayTime } from '@/utils/format/dates'
import { formatClock } from '@/utils/format/modview'

type DeskTab = 'logs' | 'comments'

export interface UnbanDeskProps {
  requests: UnbanRequest[]
  // Request open first
  initialId: string | null
  // Real live the details are read on
  liveId: string | null
  messages: ChatMessage[]
  gate: GateCheck
  onAct: ActRunner
  onBack: () => void
}

/**
 * Unban requests desk filling the stage: the list on the left, the viewer and their request on the right
 * @param {UnbanDeskProps} props - Desk props
 * @return {JSX.Element}
 */

export const UnbanDesk = ({
  requests,
  initialId,
  liveId,
  messages,
  gate,
  onAct,
  onBack,
}: UnbanDeskProps) => {
  const [picked, setPicked] = useState<string | null>(initialId)
  const [tab, setTab] = useState<DeskTab>('logs')
  const BackIcon = ICONS.back

  // The first request stands in until one is picked, or when the picked one is handled
  const request = requests.find((entry) => entry.id === picked) ?? requests[0] ?? null
  const chatterId = request?.author.id ?? null
  const { detail } = useBanDetail(liveId, chatterId)
  const { history } = useViewerDossier(liveId, chatterId ?? '')
  const { comments } = useViewerComments(liveId, chatterId ?? '', request?.author.login ?? '')

  const logs = messages.filter((message) => message.author.id === chatterId)
  const bans = history?.filter((row) => row.kind === 'BAN').length
  const timeouts = history?.filter((row) => row.kind === 'TIMEOUT').length
  const accept = request
    ? gate({ kind: 'unbanRequest', requestId: request.id, approve: true })
    : null

  const decide = (approve: boolean) => {
    if (!request) return
    onAct({ kind: 'unbanRequest', requestId: request.id, approve })
    // The next request opens once this one is handled
    const next = requests.find((entry) => entry.id !== request.id)
    setPicked(next?.id ?? null)
  }

  return (
    <section className={MODVIEW_UNBAN.desk} aria-label={COPY.title}>
      <header className={MODVIEW_UNBAN.deskHead}>
        <button
          type="button"
          className={MODVIEW_UNBAN.iconButton}
          aria-label={COPY.back}
          title={COPY.back}
          onClick={onBack}
        >
          <BackIcon className={MODVIEW_UNBAN.icon} aria-hidden="true" />
        </button>
        <h3 className={MODVIEW_UNBAN.deskTitle}>{COPY.title}</h3>
      </header>

      <div className={MODVIEW_UNBAN.deskBody}>
        <aside className={MODVIEW_UNBAN.deskList}>
          <UnbanQueue
            requests={requests}
            selectedId={request?.id ?? null}
            onSelect={(entry) => setPicked(entry.id)}
          />
        </aside>

        {request ? (
          <div className={MODVIEW_UNBAN.detail}>
            <div className={MODVIEW_UNBAN.detailScroll}>
              <div className={MODVIEW_UNBAN.who}>
                <Avatar name={request.author.name} src={detail?.avatar ?? null} size="lg" />
                <div>
                  <h4 className={MODVIEW_UNBAN.whoName}>{request.author.name}</h4>
                  {detail?.accountCreatedAt && (
                    <p className={MODVIEW_UNBAN.whoNote}>
                      {COPY.accountCreated.replace('{date}', formatDay(detail.accountCreatedAt))}
                    </p>
                  )}
                </div>
              </div>

              <dl className={MODVIEW_UNBAN.figures}>
                {[
                  { label: COPY.bannedBy, value: detail?.bannedBy },
                  {
                    label: COPY.bannedOn,
                    value: detail?.bannedAt ? formatDayTime(detail.bannedAt) : null,
                  },
                  { label: COPY.bans, value: bans === undefined ? null : String(bans) },
                  { label: COPY.timeouts, value: timeouts ? String(timeouts) : null },
                ].map((figure) => (
                  <div key={figure.label}>
                    <dt className={MODVIEW_UNBAN.figureLabel}>{figure.label}</dt>
                    <dd className={MODVIEW_UNBAN.figureValue}>{figure.value ?? COPY.none}</dd>
                  </div>
                ))}
              </dl>

              <div className={MODVIEW_UNBAN.tabs} role="tablist">
                {(
                  [
                    ['logs', COPY.tabLogs.replace('{n}', String(logs.length))],
                    ['comments', COPY.tabComments.replace('{n}', String(comments?.length ?? 0))],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    className={cn(MODVIEW_UNBAN.tab, tab === key && MODVIEW_UNBAN.tabOn)}
                    onClick={() => setTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'logs' &&
                (logs.length === 0 ? (
                  <p className={MODVIEW_UNBAN.empty}>{COPY.logsEmpty}</p>
                ) : (
                  <ul className={MODVIEW_UNBAN.log}>
                    {logs.map((message) => (
                      <li key={message.id} className={MODVIEW_UNBAN.logLine}>
                        <time className={MODVIEW_UNBAN.logTime} dateTime={message.sentAt}>
                          {formatClock(message.sentAt)}
                        </time>
                        <ChatText text={message.text} fragments={message.fragments} />
                      </li>
                    ))}
                  </ul>
                ))}

              {tab === 'comments' &&
                ((comments?.length ?? 0) === 0 ? (
                  <p className={MODVIEW_UNBAN.empty}>{COPY.commentsEmpty}</p>
                ) : (
                  <ul className={MODVIEW_UNBAN.log}>
                    {comments?.map((comment) => (
                      <li key={comment.id} className={MODVIEW_UNBAN.comment}>
                        <span className={MODVIEW_UNBAN.commentHead}>
                          {`${comment.authorName ?? ''} · ${formatDayTime(comment.createdAt)}`}
                        </span>
                        <span>{comment.body}</span>
                      </li>
                    ))}
                  </ul>
                ))}
            </div>

            <footer className={MODVIEW_UNBAN.footer}>
              <p className={MODVIEW_UNBAN.request}>{request.text}</p>
              <div className={MODVIEW_UNBAN.actions}>
                <Button
                  variant="danger"
                  disabled={!accept?.allowed}
                  title={accept?.reason ?? undefined}
                  onClick={() => decide(false)}
                >
                  {COPY.reject}
                </Button>
                <Button
                  variant="success"
                  disabled={!accept?.allowed}
                  title={accept?.reason ?? undefined}
                  onClick={() => decide(true)}
                >
                  {COPY.accept}
                </Button>
              </div>
            </footer>
          </div>
        ) : (
          <p className={MODVIEW_UNBAN.empty}>{COPY.pick}</p>
        )}
      </div>
    </section>
  )
}
