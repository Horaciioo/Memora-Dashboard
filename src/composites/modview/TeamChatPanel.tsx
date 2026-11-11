'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { TeamChatReactBar, TeamChatReactions } from '@/composites/modview/TeamChatReactions'
import { TeamChatTyping } from '@/composites/modview/TeamChatTyping'
import type { TeamChatState } from '@/core/hooks/data/lives/useTeamChat'
import { isCalled, mentionSegments, mentionsIn } from '@/core/lib/lives/teamChat'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { GLYPH_TINTS } from '@/declarations/members/tints'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import {
  TEAM_CHAT_COPY as COPY,
  TEAM_CHAT_SCOPE_MENTIONS,
  TEAM_CHAT_EMPTY,
  TEAM_CHAT_SCOPE_ICONS,
  TEAM_CHAT_SCOPE_TINTS,
  TEAM_CHAT_SCOPE_LABELS,
  TEAM_MENTIONS,
  TEAM_MENTION_KINDS,
} from '@/declarations/lives/teamChat'
import type { TeamChatScope, TeamMentionKind } from '@/declarations/lives/teamChat'
import { roleOf, TEAM_ROLES } from '@/declarations/modview/roles'
import type { TeamRole } from '@/declarations/modview/roles'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatHourMark } from '@/utils/format/time/dates'

const SendIcon = ICONS.moveUp

const RoleGlyph = ({ role }: { role: TeamRole }) => {
  const Glyph = ICONS[TEAM_ROLES[role].icon]

  return <Glyph className={cn('size-3.5 shrink-0', TEAM_ROLES[role].glyph)} aria-hidden="true" />
}

// Lines from one author within this gap share a header
const GROUP_GAP_MS = 5 * MINUTE_MS

export interface TeamChatPanelProps {
  chat: TeamChatState
  viewerId: string
  seats: MentionSeats
  scopes: TeamChatScope[]
  // Written but never sent
  isLocked?: boolean
  // Fills its parent height
  isFilling?: boolean
}

/**
 * Internal chat of the team of a live
 * @param {TeamChatPanelProps} props - Panel props
 * @return {JSX.Element}
 */

export const TeamChatPanel = ({
  chat,
  viewerId,
  seats,
  scopes,
  isLocked = false,
  isFilling = false,
}: TeamChatPanelProps) => {
  const [draft, setDraft] = useState('')
  const [scope, setScope] = useState<TeamChatScope>('all')
  const [pick, setPick] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const messages = useMemo(
    () => chat.messages.filter((message) => message.scope === scope),
    [chat.messages, scope]
  )
  const names = useMemo(
    () => Object.fromEntries(seats.members.map((member) => [member.id, member.name])),
    [seats.members]
  )
  const writers = chat.typing[scope].map((id) => names[id] ?? COPY.unknown)

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
    (kind) =>
      TEAM_CHAT_SCOPE_MENTIONS[scope].includes(kind) &&
      (kind !== 'designated' || seats.designatedId !== '')
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
    const list = endRef.current?.parentElement
    if (list) list.scrollTop = list.scrollHeight
  }, [messages.length, scope])

  const submit = async () => {
    const body = draft.trim()
    if (!body || chat.isSending || isLocked) return
    if (await chat.send(body, mentionsIn(body, labels, scope), scope)) setDraft('')
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
    <div
      className={cn(STYLES.box, isFilling && STYLES.boxFill)}
      style={{ '--room': GLYPH_TINTS[TEAM_CHAT_SCOPE_TINTS[scope]].fillFrom } as CSSProperties}
    >
      {scopes.length > 1 && (
        <div className={STYLES.tabs} role="tablist" aria-label={COPY.scopes}>
          {scopes.map((key) => {
            const Glyph = TEAM_CHAT_SCOPE_ICONS[key]

            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={scope === key}
                aria-label={TEAM_CHAT_SCOPE_LABELS[key]}
                title={TEAM_CHAT_SCOPE_LABELS[key]}
                className={cn(STYLES.tab, scope === key && STYLES.tabOn)}
                onClick={() => setScope(key)}
              >
                <Glyph className="size-4" />
              </button>
            )
          })}
        </div>
      )}
      <div className={STYLES.list}>
        {chat.hasOlder(scope) && (
          <button type="button" className={STYLES.older} onClick={() => void chat.loadOlder(scope)}>
            {COPY.older}
          </button>
        )}
        {!messages.length && (
          <EmptyState
            compact
            className={STYLES.emptyBox}
            figure="chat"
            title={TEAM_CHAT_EMPTY[scope].title}
            description={TEAM_CHAT_EMPTY[scope].body}
          />
        )}
        {messages.map((message, index) => {
          const before = messages[index - 1]
          const follows =
            before?.authorId === message.authorId &&
            Date.parse(message.createdAt) - Date.parse(before.createdAt) < GROUP_GAP_MS
          const author = seats.members.find((member) => member.id === message.authorId)
          const role = author ? roleOf(author.rank, seats.coordinatorIds.includes(author.id)) : null
          const isMine = message.authorId === viewerId

          const called = !isMine && isCalled(message.mentions, viewerId, seats, scope)
          const text = mentionSegments(
            message.body,
            TEAM_CHAT_SCOPE_MENTIONS[scope].map((kind) => labels[kind])
          ).map((segment, at) => (
            <span key={at} className={cn(segment.isMention && STYLES.mention)}>
              {segment.text}
            </span>
          ))

          const reactions = (
            <TeamChatReactions
              message={message}
              viewerId={viewerId}
              names={names}
              onReact={(id, emoji) => void chat.react(id, emoji)}
            />
          )

          return (
            <div key={message.id} className={STYLES.line}>
              {follows ? (
                <p className={cn(STYLES.follow, called && STYLES.rowMentioned)}>{text}</p>
              ) : (
                <div className={cn(STYLES.row, called && STYLES.rowMentioned)}>
                  <Avatar
                    name={author?.name ?? COPY.unknown}
                    src={author?.avatar ?? null}
                    size="xs"
                  />
                  <div className={STYLES.body}>
                    <span className={STYLES.meta}>
                      {role && <RoleGlyph role={role} />}
                      <span className={cn(STYLES.author, role && TEAM_ROLES[role].tone)}>
                        {author?.name ?? COPY.unknown}
                      </span>
                      <span className={STYLES.time}>{formatHourMark(message.createdAt)}</span>
                    </span>
                    <span>{text}</span>
                  </div>
                </div>
              )}
              {reactions}
              <TeamChatReactBar
                messageId={message.id}
                onReact={(id, emoji) => void chat.react(id, emoji)}
              />
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <TeamChatTyping names={writers} />
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
              if (event.target.value.trim()) chat.notifyTyping(scope)
            }}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className={STYLES.send}
            aria-label={COPY.send}
            disabled={!draft.trim() || chat.isSending || isLocked}
            title={isLocked ? COPY.locked : undefined}
            onClick={() => void submit()}
          >
            <SendIcon className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
