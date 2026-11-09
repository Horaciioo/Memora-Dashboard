'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
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
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatHourMark } from '@/utils/format/time/dates'

const SendIcon = ICONS.moveUp

// Lines from one author within this gap share a header
const GROUP_GAP_MS = 5 * MINUTE_MS

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
  const [pick, setPick] = useState(0)
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
    (kind) => kind !== 'coordinator' && (kind !== 'designated' || seats.designatedId !== '')
  )

  // Kinds matching the @ being typed
  const typing = /(?:^|\s)@(\S*)$/.exec(draft)
  const suggestions = typing
    ? offered.filter((kind) =>
        labels[kind].toLocaleLowerCase().startsWith(typing[1].toLocaleLowerCase())
      )
    : []
  const choose = (kind: TeamMentionKind) => {
    setDraft((text) => text.replace(/@\S*$/, `@${labels[kind]} `))
    setPick(0)
  }

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
    if (suggestions.length) {
      const step = { ArrowDown: 1, ArrowUp: -1 }[event.key]
      if (step) {
        event.preventDefault()
        setPick((at) => (at + step + suggestions.length) % suggestions.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        choose(suggestions[pick % suggestions.length])
        return
      }
    }
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    void submit()
  }

  return (
    <div className={STYLES.box}>
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
        {messages.map((message, index) => {
          const before = messages[index - 1]
          const follows =
            before?.authorId === message.authorId &&
            Date.parse(message.createdAt) - Date.parse(before.createdAt) < GROUP_GAP_MS
          const author = seats.members.find((member) => member.id === message.authorId)
          const role = author ? roleOf(author.rank, seats.coordinatorIds.includes(author.id)) : null
          const isMine = message.authorId === viewerId

          const called = !isMine && isCalled(message.mentions, viewerId, seats)
          const text = mentionSegments(message.body, Object.values(labels)).map((segment, at) => (
            <span key={at} className={cn(segment.isMention && STYLES.mention)}>
              {segment.text}
            </span>
          ))

          return follows ? (
            <p key={message.id} className={cn(STYLES.follow, called && STYLES.rowMentioned)}>
              {text}
            </p>
          ) : (
            <div key={message.id} className={cn(STYLES.row, called && STYLES.rowMentioned)}>
              <Avatar name={author?.name ?? COPY.unknown} src={author?.avatar ?? null} size="xs" />
              <div className={STYLES.body}>
                <span className={STYLES.meta}>
                  <span className={cn(STYLES.author, role && TEAM_ROLES[role].tone)}>
                    {isMine ? COPY.you : (author?.name ?? COPY.unknown)}
                  </span>
                  <span className={STYLES.time}>{formatHourMark(message.createdAt)}</span>
                </span>
                <span>{text}</span>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className={STYLES.composer}>
        {suggestions.length > 0 && (
          <div className={STYLES.suggest} role="listbox" aria-label={COPY.mention}>
            {suggestions.map((kind, at) => (
              <button
                key={kind}
                type="button"
                role="option"
                aria-selected={at === pick % suggestions.length}
                className={cn(
                  STYLES.suggestItem,
                  at === pick % suggestions.length && STYLES.suggestOn
                )}
                onMouseDown={(event) => {
                  event.preventDefault()
                  choose(kind)
                }}
              >
                @{labels[kind]}
              </button>
            ))}
          </div>
        )}
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
        <div className={STYLES.inputBar}>
          <textarea
            className={STYLES.field}
            rows={1}
            value={draft}
            maxLength={LIVE_SETTINGS.teamChatMaxLength}
            placeholder={COPY.placeholder}
            aria-label={COPY.placeholder}
            onChange={(event) => {
              setDraft(event.target.value)
              setPick(0)
            }}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className={STYLES.send}
            aria-label={COPY.send}
            disabled={!draft.trim() || chat.isSending}
            onClick={() => void submit()}
          >
            <SendIcon className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
