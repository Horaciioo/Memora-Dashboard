'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { PlayGameArt } from '@/composites/play/brand/PlayGameArt'
import { usePlayGroup } from '@/core/hooks/data/play/usePlayGroup'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GAMES, PLAY_GROUP_COPY, PLAY_SETTINGS } from '@/declarations/play'
import { PLAY_BOX, PLAY_CHAT_UI, PLAY_GROUP } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatClock } from '@/utils/format/modview'

// Lines from one author within this gap share a header
const FOLLOW_GAP_MS = 5 * MINUTE_MS

/**
 * Chat of the group: lines, then the field, the page reads again on each line
 * @param {Object} props - Group
 * @param {PlayGroupView} props.group - Group
 * @param {() => void} [props.onPlay] - Opens the games
 * @return {JSX.Element}
 */

export const PlayGroupChat = ({ group, onPlay }: { group: PlayGroupView; onPlay?: () => void }) => {
  const actions = usePlayGroup()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  // The newest line stays in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [group.messages.length])

  const send = async () => {
    const body = draft.trim()
    if (body && (await actions.say(group.id, body))) setDraft('')
  }

  return (
    <div className={PLAY_BOX.room}>
      <div className={PLAY_BOX.chat}>
        {group.messages.length === 0 && (
          <p className={PLAY_BOX.hint}>{PLAY_GROUP_COPY.chatEmpty}</p>
        )}
        {group.messages.map((message, index) => {
          const previous = group.messages[index - 1]
          const isInvite = Boolean(message.game && message.sessionId)
          const isFollow =
            !isInvite &&
            previous &&
            !previous.game &&
            previous.author.accountId === message.author.accountId &&
            Date.parse(message.createdAt) - Date.parse(previous.createdAt) < FOLLOW_GAP_MS
          if (isFollow) {
            return (
              <p key={message.id} className={cn(PLAY_CHAT_UI.follow, PLAY_CHAT_UI.text)}>
                {message.body}
              </p>
            )
          }

          return (
            <div key={message.id} className={PLAY_CHAT_UI.message}>
              <Avatar name={message.author.name} src={message.author.avatarUrl} size="xs" />
              <div className={PLAY_CHAT_UI.body}>
                <span className={PLAY_CHAT_UI.meta}>
                  <span className={PLAY_CHAT_UI.author}>{message.author.name}</span>
                  <span className={PLAY_CHAT_UI.time}>{formatClock(message.createdAt)}</span>
                </span>
                {message.game && message.sessionId ? (
                  <>
                    <p className={PLAY_CHAT_UI.text}>{PLAY_GROUP_COPY.invitedToPlay}</p>
                    <AppLink
                      href={ROUTES.playSession(message.sessionId)}
                      className={PLAY_GROUP.chatGame}
                    >
                      <PlayGameArt game={message.game} className={PLAY_GROUP.gameArt} />
                      <span className={PLAY_GROUP.gameShade} aria-hidden="true" />
                      <span className={PLAY_GROUP.gameTitle}>{PLAY_GAMES.label(message.game)}</span>
                      <span className={PLAY_GROUP.gamePlay}>{PLAY_GROUP_COPY.joinTable}</span>
                    </AppLink>
                  </>
                ) : (
                  <p className={PLAY_CHAT_UI.text}>{message.body}</p>
                )}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      <form
        className={PLAY_BOX.compose}
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        {onPlay && (
          <Button
            variant="arcade"
            icon="add"
            aria-label={PLAY_GROUP_COPY.pickGame}
            className={PLAY_BOX.composeGame}
            onClick={onPlay}
          />
        )}
        <input
          value={draft}
          maxLength={PLAY_SETTINGS.group.messageMax}
          placeholder={PLAY_GROUP_COPY.chatPlaceholder}
          aria-label={PLAY_GROUP_COPY.chatPlaceholder}
          className={PLAY_BOX.input}
          onChange={(event) => setDraft(event.target.value)}
          disabled={actions.isSaving}
        />
      </form>
    </div>
  )
}
