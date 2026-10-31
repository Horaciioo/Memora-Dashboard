'use client'

import { Byline } from '@/components/elements/display/Byline'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Tip } from '@/components/elements/feedback/Tip'
import { ChatText } from '@/composites/modview/ChatText'
import { WarnDialog } from '@/composites/modview/WarnDialog'
import { ViewerDossier } from '@/composites/modview/ViewerDossier'
import type { ViewerDossierProps } from '@/composites/modview/ViewerDossier'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useGlideBox } from '@/core/hooks/interaction/layout/useGlideBox'
import { useViewerComments } from '@/core/hooks/data/lives/useViewerComments'
import { useViewerDossier } from '@/core/hooks/data/lives/useViewerDossier'
import { parseDuration } from '@/core/lib/modview/commands'
import { MODVIEW_COPY, MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { MODVIEW_DEFAULTS, TIMEOUT_PRESETS } from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_USER } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'
import { formatDuration } from '@/utils/format/modview'

type ViewerTab = 'dossier' | 'comments' | 'sanctions'

export interface ViewerCardProps {
  chatter: Chatter
  messages: ChatMessage[]
  // Sanctions the viewer got on this live
  liveSanctions: number
  gate: GateCheck
  onAct: ActRunner
  onClose: () => void
  isWatched: boolean
  onWatch: () => void
  // Sits in the right column instead of over the stage
  isDocked?: boolean
  // Width of the docked column, in pixels
  width?: number
  // Dossier of a real live
  dossier?: { liveId: string } & Omit<ViewerDossierProps, 'chatter' | 'history'>
}

/**
 * One viewer: their Twitch, three figures, what they said and the gestures
 * @param {ViewerCardProps} props - Card props
 * @return {JSX.Element}
 */

export const ViewerCard = ({
  chatter,
  messages,
  liveSanctions,
  gate,
  onAct,
  onClose,
  isWatched,
  onWatch,
  isDocked,
  width,
  dossier,
}: ViewerCardProps) => {
  const [reason, setReason] = useState('')
  const [draft, setDraft] = useState('')
  const [custom, setCustom] = useState('')
  const [page, setPage] = useState(1)
  const [isWarning, setWarning] = useState(false)
  const [tab, setTab] = useState<ViewerTab>('dossier')
  const { history } = useViewerDossier(dossier?.liveId ?? null, chatter.id)
  const { comments, isSaving, add } = useViewerComments(
    dossier?.liveId ?? null,
    chatter.id,
    chatter.login
  )
  const chatterId = chatter.id
  const lastLine = [...messages].reverse().find((message) => !message.deletedBy)
  const moderate = gate({ kind: 'ban', chatterId, reason: null })
  const motive = reason.trim() || null
  const customSeconds = parseDuration(custom)
  // Newest first, a few at a time
  const pageCount = Math.max(1, Math.ceil(messages.length / MODVIEW_DEFAULTS.messagesPerPage))
  const currentPage = Math.min(page, pageCount)
  const pageMessages = [...messages]
    .reverse()
    .slice(
      (currentPage - 1) * MODVIEW_DEFAULTS.messagesPerPage,
      currentPage * MODVIEW_DEFAULTS.messagesPerPage
    )
  const DeleteIcon = ICONS.modDelete
  const TwitchIcon = ICONS.twitch

  // Comments need a real live to hang on
  const tabs: { key: ViewerTab; label: string }[] = [
    { key: 'dossier', label: MODVIEW_USER_COPY.tabDossier },
    ...(dossier ? [{ key: 'comments' as const, label: MODVIEW_USER_COPY.tabComments }] : []),
    { key: 'sanctions', label: MODVIEW_USER_COPY.tabSanctions },
  ]

  const { listRef, boxRef } = useGlideBox<HTMLDivElement>(`${tab}:${tabs.length}`)

  const send = async () => {
    const text = draft.trim()
    if (!text) return
    if (await add(text)) setDraft('')
  }

  // Glyphs only, the name rides in the tip
  const figures: { icon: IconName; label: string; value: string }[] = [
    { icon: 'chat', label: MODVIEW_USER_COPY.statMessages, value: String(messages.length) },
    {
      icon: 'sanctionsPanel',
      label: MODVIEW_USER_COPY.statTotal,
      value: history ? String(history.length) : '–',
    },
    { icon: 'stream', label: MODVIEW_USER_COPY.statLive, value: String(liveSanctions) },
  ]

  return (
    <aside
      className={isDocked ? MODVIEW_USER.docked : MODVIEW_USER.panel}
      style={isDocked && width ? { width } : undefined}
      aria-label={MODVIEW_USER_COPY.title}
    >
      <header className={MODVIEW_USER.head}>
        <Button
          variant="ghost"
          icon="close"
          className={MODVIEW_USER.close}
          aria-label={MODVIEW_USER_COPY.close}
          onClick={onClose}
        />
        <TwitchIcon className={MODVIEW_USER.glyph} aria-hidden="true" />
        <h3 className={MODVIEW_USER.name}>{chatter.name}</h3>
        <Button
          variant={isWatched ? 'secondary' : 'ghost'}
          icon="visible"
          className={MODVIEW_USER.watch}
          aria-label={isWatched ? MODVIEW_WATCH_COPY.stop : MODVIEW_WATCH_COPY.start}
          title={isWatched ? MODVIEW_WATCH_COPY.stop : MODVIEW_WATCH_COPY.start}
          onClick={onWatch}
        />
      </header>

      <div ref={listRef} className={MODVIEW_USER.tabs} role="tablist">
        <span ref={boxRef} className={MODVIEW_USER.tabBox} aria-hidden="true" />
        {tabs.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            className={cn(MODVIEW_USER.tab, tab === entry.key && MODVIEW_USER.tabOn)}
            onClick={() => setTab(entry.key)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className={MODVIEW_USER.stats}>
        {figures.map(({ icon, label, value }) => {
          const Icon = ICONS[icon]

          return (
            <Tip key={icon} label={label} className={MODVIEW_USER.stat}>
              <Icon className={MODVIEW_USER.statIcon} aria-hidden="true" />
              <span className={MODVIEW_USER.statValue}>{value}</span>
              <span className="sr-only">{label}</span>
            </Tip>
          )
        })}
      </div>

      <div className={MODVIEW_USER.body}>
        {tab === 'dossier' && (
          <>
            <section className={MODVIEW_USER.section}>
              <h4 className={MODVIEW_USER.label}>{MODVIEW_USER_COPY.messages}</h4>
              {messages.length === 0 ? (
                <p className={MODVIEW_USER.empty}>{MODVIEW_USER_COPY.messagesEmpty}</p>
              ) : (
                <ul className={MODVIEW_USER.messages}>
                  {pageMessages.map((message) => (
                    <li
                      key={message.id}
                      className={cn(MODVIEW_USER.message, MODVIEW_USER.messageRow)}
                    >
                      <span className={MODVIEW_USER.messageText}>
                        <ChatText
                          text={message.text}
                          fragments={message.fragments}
                          flagged={message.flagged}
                        />
                      </span>
                      {!message.deletedBy && (
                        <button
                          type="button"
                          className={MODVIEW_USER.messageTool}
                          disabled={!moderate.allowed}
                          title={moderate.reason ?? MODVIEW_USER_COPY.deleteMessage}
                          aria-label={MODVIEW_USER_COPY.deleteMessage}
                          onClick={() =>
                            onAct({ kind: 'delete', messageId: message.id, chatterId })
                          }
                        >
                          <DeleteIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {pageCount > 1 && (
                <nav className={MODVIEW_USER.pager} aria-label={MODVIEW_USER_COPY.messages}>
                  <Button
                    variant="ghost"
                    icon="back"
                    aria-label={MODVIEW_COPY.pagePrevious}
                    title={MODVIEW_COPY.pagePrevious}
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  />
                  <span className={MODVIEW_USER.pagerLabel}>
                    {MODVIEW_COPY.pageOf
                      .replace('{page}', String(currentPage))
                      .replace('{total}', String(pageCount))}
                  </span>
                  <Button
                    variant="ghost"
                    icon="forward"
                    aria-label={MODVIEW_COPY.pageNext}
                    title={MODVIEW_COPY.pageNext}
                    disabled={currentPage >= pageCount}
                    onClick={() => setPage(currentPage + 1)}
                  />
                </nav>
              )}
            </section>

            {dossier && <ViewerDossier chatter={chatter} history={history} {...dossier} />}
          </>
        )}
        {tab === 'comments' && (
          <>
            <section className={MODVIEW_USER.section}>
              <textarea
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

            {comments !== null && comments.length === 0 ? (
              <p className={MODVIEW_USER.empty}>{MODVIEW_USER_COPY.commentsEmpty}</p>
            ) : (
              <div className={MODVIEW_USER.messages}>
                {(comments ?? []).map((comment) => (
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
          </>
        )}
        {tab === 'sanctions' && (
          <>
            <section className={MODVIEW_USER.section}>
              <input
                className={MODVIEW_USER.reason}
                placeholder={MODVIEW_USER_COPY.reasonPlaceholder}
                aria-label={MODVIEW_USER_COPY.reason}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />

              <div className={MODVIEW_USER.presets}>
                {TIMEOUT_PRESETS.map((seconds) => (
                  <button
                    key={seconds}
                    type="button"
                    className={MODVIEW_USER.preset}
                    disabled={!moderate.allowed}
                    title={moderate.reason ?? MODVIEW_USER_COPY.timeout}
                    onClick={() => onAct({ kind: 'timeout', chatterId, seconds, reason: motive })}
                  >
                    {formatDuration(seconds)}
                  </button>
                ))}
              </div>

              <div className={MODVIEW_USER.custom}>
                <input
                  className={MODVIEW_USER.reason}
                  placeholder={MODVIEW_USER_COPY.customDuration}
                  aria-label={MODVIEW_USER_COPY.customDuration}
                  value={custom}
                  onChange={(event) => setCustom(event.target.value)}
                />
                <Button
                  variant="secondary"
                  disabled={!moderate.allowed || customSeconds === null}
                  title={moderate.reason ?? undefined}
                  onClick={() =>
                    customSeconds !== null &&
                    onAct({ kind: 'timeout', chatterId, seconds: customSeconds, reason: motive })
                  }
                >
                  {MODVIEW_USER_COPY.customApply}
                </Button>
              </div>

              <div className={MODVIEW_USER.actions}>
                <Button
                  variant="secondary"
                  disabled={!moderate.allowed || !lastLine}
                  title={moderate.reason ?? undefined}
                  onClick={() =>
                    lastLine && onAct({ kind: 'delete', messageId: lastLine.id, chatterId })
                  }
                >
                  {MODVIEW_USER_COPY.delete}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!moderate.allowed}
                  title={moderate.reason ?? undefined}
                  onClick={() => setWarning(true)}
                >
                  {MODVIEW_USER_COPY.warn}
                </Button>
                <Button
                  variant="danger"
                  disabled={!moderate.allowed}
                  title={moderate.reason ?? undefined}
                  onClick={() => onAct({ kind: 'ban', chatterId, reason: motive })}
                >
                  {MODVIEW_USER_COPY.ban}
                </Button>
                <Button
                  variant="secondary"
                  disabled={!moderate.allowed}
                  title={moderate.reason ?? undefined}
                  onClick={() => onAct({ kind: 'unban', chatterId })}
                >
                  {MODVIEW_USER_COPY.unban}
                </Button>
              </div>
              {!moderate.allowed && <p className={MODVIEW_USER.lock}>{moderate.reason}</p>}
            </section>
          </>
        )}
      </div>

      {isWarning && (
        <WarnDialog
          name={chatter.name}
          onConfirm={(reason) => onAct({ kind: 'warn', chatterId, reason })}
          onClose={() => setWarning(false)}
        />
      )}
    </aside>
  )
}
