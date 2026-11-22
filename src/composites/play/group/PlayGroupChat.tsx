'use client'

import { Fragment, useEffect, useRef, useState } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { PlayGroupGames } from '@/composites/play/group/PlayGroupGames'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { fillPlayMessage, PLAY_GAMES, PLAY_GROUP_COPY, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_GROUP_QUEST_BOOST, PLAY_GROUP_QUEST_COPY } from '@/declarations/play/groupQuests'
import { BUTTON_STYLES, PLAY_CREW, PLAY_GROUP, PLAY_GROUP_CHEER } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatClock } from '@/utils/format/modview'

// Lines from one author within this gap share a head
const FOLLOW_GAP_MS = 5 * MINUTE_MS

/**
 * Conversation as bubbles on the page, then a floating composer with a game tray
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @return {JSX.Element}
 */

export const PlayGroupChat = ({ group }: { group: PlayGroupView }) => {
  const actions = usePlayGroup()
  const [draft, setDraft] = useState('')
  const [isTray, setTray] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const AddIcon = ICONS[isTray ? 'close' : 'add']
  // The quest card sits after the last line sent before it was done
  const doneAt = group.quest?.completedAt ? Date.parse(group.quest.completedAt) : null
  const cheerAt =
    doneAt === null
      ? null
      : group.messages.reduce(
          (found, message, index) => (Date.parse(message.createdAt) <= doneAt ? index : found),
          -1
        )
  const cheer = (
    <div className={PLAY_GROUP_CHEER.card} role="status">
      <span className={PLAY_GROUP_CHEER.from}>{PLAY_GROUP_QUEST_COPY.system}</span>
      <span className={PLAY_GROUP_CHEER.title}>{PLAY_GROUP_QUEST_COPY.cheer}</span>
      <span className={PLAY_GROUP_CHEER.body}>
        {fillPlayMessage(PLAY_GROUP_QUEST_COPY.cheerBody, {
          percent: PLAY_GROUP_QUEST_BOOST.percent,
          hours: PLAY_GROUP_QUEST_BOOST.hours,
        })}
      </span>
    </div>
  )

  // The newest line stays in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [group.messages.length])

  const send = async () => {
    const body = draft.trim()
    if (body && (await actions.say(group.id, body))) setDraft('')
  }

  return (
    <>
      <div className={PLAY_CREW.chat}>
        {group.messages.length === 0 && (
          <p className={PLAY_CREW.empty}>{PLAY_GROUP_COPY.chatEmpty}</p>
        )}
        {cheerAt === -1 && cheer}
        {group.messages.map((message, index) => {
          const previous = group.messages[index - 1]
          const isCall = Boolean(message.game && message.sessionId)
          const isFollow =
            previous &&
            previous.author.accountId === message.author.accountId &&
            Date.parse(message.createdAt) - Date.parse(previous.createdAt) < FOLLOW_GAP_MS

          return (
            <Fragment key={message.id}>
              <div
                className={cn(
                  PLAY_CREW.line,
                  message.isMine && PLAY_CREW.lineMine,
                  !isFollow && PLAY_CREW.lineGap
                )}
              >
                <span className={PLAY_CREW.slot}>
                  {!isFollow && !message.isMine && (
                    <PlayAvatar
                      accountId={message.author.accountId}
                      name={message.author.name}
                      src={message.author.avatarUrl}
                      size="xs"
                    />
                  )}
                </span>
                <div className={cn(PLAY_CREW.column, message.isMine && PLAY_CREW.columnMine)}>
                  {!isFollow && (
                    <span className={PLAY_CREW.meta}>
                      {!message.isMine && (
                        <span className={PLAY_CREW.author}>{message.author.name}</span>
                      )}
                      <span className={PLAY_CREW.time}>{formatClock(message.createdAt)}</span>
                    </span>
                  )}
                  {isCall && message.game && message.sessionId ? (
                    <div className={PLAY_CREW.call}>
                      <span className={PLAY_CREW.callArt}>
                        <PlayGameArt game={message.game} className={PLAY_GROUP.gameArt} />
                      </span>
                      <span className={PLAY_CREW.callText}>
                        <span className={PLAY_CREW.callLead}>{PLAY_GROUP_COPY.invitedToPlay}</span>
                        <span className={PLAY_CREW.callName}>{PLAY_GAMES.label(message.game)}</span>
                      </span>
                      <AppLink
                        href={ROUTES.playSession(message.sessionId)}
                        className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeSmall)}
                      >
                        {PLAY_GROUP_COPY.joinTable}
                      </AppLink>
                    </div>
                  ) : (
                    <p
                      className={cn(
                        PLAY_CREW.bubble,
                        message.isMine ? PLAY_CREW.bubbleMine : PLAY_CREW.bubbleOther
                      )}
                    >
                      {message.body}
                    </p>
                  )}
                </div>
              </div>
              {cheerAt === index && cheer}
            </Fragment>
          )
        })}
        <div ref={endRef} />
      </div>
      <form
        className={PLAY_CREW.composer}
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        {isTray && <PlayGroupGames group={group} onLaunched={() => setTray(false)} />}
        <label className={PLAY_CREW.pill}>
          <button
            type="button"
            className={PLAY_CREW.add}
            aria-label={PLAY_GROUP_COPY.pickGame}
            aria-pressed={isTray}
            onClick={() => setTray(!isTray)}
          >
            <AddIcon className="size-5" aria-hidden />
          </button>
          <input
            value={draft}
            maxLength={PLAY_SETTINGS.group.messageMax}
            placeholder={PLAY_GROUP_COPY.chatPlaceholder}
            aria-label={PLAY_GROUP_COPY.chatPlaceholder}
            className={PLAY_CREW.input}
            onChange={(event) => setDraft(event.target.value)}
            disabled={actions.isSaving}
          />
        </label>
      </form>
    </>
  )
}
