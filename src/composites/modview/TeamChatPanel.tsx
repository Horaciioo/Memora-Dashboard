'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import type { TeamChatState } from '@/core/hooks/data/lives/useTeamChat'
import { isCalled, mentionSegments, mentionsIn } from '@/core/lib/lives/teamChat'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import {
  TEAM_CHAT_COPY as COPY,
  TEAM_MENTIONS,
  TEAM_MENTION_KINDS,
} from '@/declarations/lives/teamChat'
import type { TeamMentionKind } from '@/declarations/lives/teamChat'
import { roleOf, TEAM_ROLES } from '@/declarations/modview/roles'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatHourMark } from '@/utils/format/dates'

export interface TeamChatPanelProps {
  chat: TeamChatState
  viewerId: string
  seats: MentionSeats
}

/**
 * Internal chat of the team of a live
 * @param {TeamChatPanelProps} props - Panel props
 * @return {JSX.Element}
 */

export const TeamChatPanel = ({ chat, viewerId, seats }: TeamChatPanelProps) => {
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const { messages } = chat

  // Mention labels, the designated one named after the member
  const labels = useMemo(() => {
    const designated = seats.members.find((member) => member.id === seats.designatedId)?.name
    const names = Object.fromEntries(
      TEAM_MENTION_KINDS.map((kind) => [kind, TEAM_MENTIONS[kind].label])
    ) as Record<TeamMentionKind, string>
    if (designated) names.designated = designated

    return names
  }, [seats])
  const offered = TEAM_MENTION_KINDS.filter(
    (kind) => kind !== 'designated' || seats.designatedId !== ''
  )

  // Newest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length])

  const submit = async () => {
    const body = draft.trim()
    if (!body || chat.isSending) return
    if (await chat.send(body, mentionsIn(body, labels))) setDraft('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    void submit()
  }

  return (
    <>
      <div className={STYLES.list}>
        {chat.hasOlder && (
          <button type="button" className={STYLES.older} onClick={() => void chat.loadOlder()}>
            {COPY.older}
          </button>
        )}
        {!messages.length && (
          <p className={STYLES.empty}>
            {COPY.empty}
            <br />
            {COPY.emptyBody}
          </p>
        )}
        {messages.map((message) => {
          const author = seats.members.find((member) => member.id === message.authorId)
          const role = author ? roleOf(author.rank, seats.coordinatorIds.includes(author.id)) : null
          const isMine = message.authorId === viewerId

          return (
            <div
              key={message.id}
              className={cn(
                STYLES.row,
                !isMine && isCalled(message.mentions, viewerId, seats) && STYLES.rowMentioned
              )}
            >
              <Avatar name={author?.name ?? COPY.unknown} src={author?.avatar ?? null} size="sm" />
              <div className={STYLES.body}>
                <p className={cn(STYLES.author, role && TEAM_ROLES[role].tone)}>
                  {isMine ? COPY.you : (author?.name ?? COPY.unknown)}
                  <span className={STYLES.time}>{formatHourMark(message.createdAt)}</span>
                </p>
                {mentionSegments(message.body, Object.values(labels)).map((segment, index) => (
                  <span key={index} className={cn(segment.isMention && STYLES.mention)}>
                    {segment.text}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className={STYLES.composer}>
        <div className={STYLES.mentions} aria-label={COPY.mention}>
          {offered.map((kind) => (
            <button
              key={kind}
              type="button"
              className={STYLES.mentionButton}
              onClick={() =>
                setDraft(
                  (text) => `${text}${text && !text.endsWith(' ') ? ' ' : ''}@${labels[kind]} `
                )
              }
            >
              @{labels[kind]}
            </button>
          ))}
        </div>
        <textarea
          className={STYLES.field}
          rows={2}
          value={draft}
          maxLength={LIVE_SETTINGS.teamChatMaxLength}
          placeholder={COPY.placeholder}
          aria-label={COPY.placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <Button variant="primary" isLoading={chat.isSending} onClick={() => void submit()}>
          {COPY.send}
        </Button>
      </div>
    </>
  )
}
