'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { useChatPause } from '@/core/hooks/interaction/state/useChatPause'
import { tierOf } from '@/core/lib/modview/tier'
import { ActSentence } from '@/composites/modview/ActSentence'
import { ChatModesMenu } from '@/composites/modview/ChatModesMenu'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { ModWindow } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { useMenu } from '@/managers/front-end'
import {
  CHAT_MODES,
  CHAT_OPTIONS,
  MODVIEW_DEFAULTS,
  TIER_BADGE_ICONS,
} from '@/declarations/modview/registries'
import type { ChatOptionName } from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_CHAT, MODVIEW_MODES, MODVIEW_TIER } from '@/declarations/ui/variants'
import type {
  ChatBadge,
  ChatMessage,
  Chatter,
  MemoraRank,
  ModViewState,
  ModViewTarget,
} from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/modview'

// Badge glyphs
const BADGE_ICONS: Record<ChatBadge, IconName> = {
  broadcaster: 'broadcaster',
  moderator: 'shield',
  vip: 'vip',
  bot: 'chatBot',
  subscriber: 'modeSubscribers',
}

export interface ChatWindowProps {
  state: ModViewState
  spotlight: ModViewTarget | null
  gate: GateCheck
  onAct: ActRunner
  onPick: (chatter: Chatter) => void
  onWatch: (chatter: Chatter) => void
  // Line being typed
  draft: string
  onDraft: (text: string) => void
  onSend: (text: string) => void
  // Why the last line was not sent
  hint: string | null
  // Terms drawers offered in the modes
  hasTerms?: boolean
}

/**
 * Live chat
 * @param {ModViewState} state - Mod View state
 * @param {ModViewTarget | null} spotlight - Part lit by a scene
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @param {(chatter: Chatter) => void} onPick - Open a viewer card
 * @param {(chatter: Chatter) => void} onWatch - Put a viewer under watch
 * @param {string} draft - Line being typed
 * @param {(text: string) => void} onDraft - Typing handler
 * @param {(text: string) => void} onSend - Sending handler, commands included
 * @param {string | null} hint - Why the last line was not sent
 * @param {boolean} [hasTerms] - Terms drawers offered
 * @return {JSX.Element}
 */

export const ChatWindow = ({
  state,
  spotlight,
  gate,
  onAct,
  onPick,
  onWatch,
  draft,
  onDraft,
  onSend,
  hint,
  hasTerms,
}: ChatWindowProps) => {
  const [menu, setMenu] = useState<'modes' | 'options' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [options, setOptions] = useState<Record<ChatOptionName, boolean>>({
    timestamps: true,
    badges: true,
    deleted: true,
    firstMessages: true,
    hoverPause: true,
    colouredNames: true,
  })

  // A scene drives the menu over the reader
  const script = state.chatScript
  const openMenu = script ? script.menu : menu
  const forced = script?.options
  const shown = useMemo(() => ({ ...options, ...forced }), [options, forced])
  const { listRef, lines, pause, resume, listHandlers } = useChatPause(
    state.messages,
    shown.hoverPause
  )

  // A command is gated as the gesture it carries
  const isCommand = draft.trim().startsWith('/')
  const sayGate = isCommand ? { allowed: true, reason: null } : gate({ kind: 'say', text: draft })
  // Commands stay open where talking is closed
  const canCommand = gate({ kind: 'ban', chatterId: '', reason: null }).allowed
  const activeModes = CHAT_MODES.keys.filter((mode) =>
    mode === 'slow' ? state.modes.slowSeconds !== null : state.modes[mode]
  ).length
  const ModesIcon = ICONS.modeSlow
  const OptionsIcon = ICONS.more

  const send = () => {
    if (!draft.trim() || !sayGate.allowed) return
    onSend(draft)
  }

  // A line written by the panel lands under the cursor
  useEffect(() => {
    if (draft.startsWith('/')) inputRef.current?.focus()
  }, [draft])

  return (
    <ModWindow
      title={MODVIEW_COPY.chat}
      isLit={spotlight === 'chat' || spotlight === 'modes' || spotlight === 'chatOptions'}
      grow
      flush
      className={MODVIEW_CHAT.root}
      actions={
        <>
          <button
            type="button"
            className={cn(MODVIEW_MODES.trigger, spotlight === 'modes' && MODVIEW_CHAT.triggerLit)}
            aria-expanded={openMenu === 'modes'}
            onClick={() => setMenu(menu === 'modes' ? null : 'modes')}
          >
            <ModesIcon className={MODVIEW_MODES.triggerIcon} aria-hidden="true" />
            {`${MODVIEW_COPY.modes} (${activeModes})`}
          </button>
          <button
            type="button"
            className={cn(
              MODVIEW_MODES.trigger,
              spotlight === 'chatOptions' && MODVIEW_CHAT.triggerLit
            )}
            aria-label={MODVIEW_COPY.chatOptions}
            aria-expanded={openMenu === 'options'}
            onClick={() => setMenu(menu === 'options' ? null : 'options')}
          >
            <OptionsIcon className={MODVIEW_MODES.triggerIcon} aria-hidden="true" />
          </button>
        </>
      }
    >
      {openMenu === 'modes' && (
        <ChatModesMenu state={state} gate={gate} onAct={onAct} hasTerms={hasTerms} />
      )}
      {openMenu === 'options' && (
        <div className={MODVIEW_MODES.panel} role="menu" aria-label={MODVIEW_COPY.chatOptions}>
          {CHAT_OPTIONS.keys.map((key) => (
            <div
              key={key}
              className={cn(MODVIEW_MODES.row, script?.lit === key && MODVIEW_MODES.rowLit)}
            >
              <span className={MODVIEW_MODES.rowLabel}>{CHAT_OPTIONS.label(key)}</span>
              <Toggle
                bare
                checked={shown[key]}
                label={CHAT_OPTIONS.label(key)}
                onChange={(checked) => setOptions((current) => ({ ...current, [key]: checked }))}
              />
            </div>
          ))}
        </div>
      )}

      <div className={MODVIEW_CHAT.scroller} ref={listRef} {...listHandlers}>
        <p className={MODVIEW_CHAT.welcome}>
          {MODVIEW_COPY.welcome.replace('{channel}', state.channel.name)}
        </p>
        <ul className={MODVIEW_CHAT.list}>
          {lines.map((message) => (
            <ChatLine
              key={message.id}
              message={message}
              options={shown}
              roster={state.roster}
              gate={gate}
              onAct={onAct}
              onPick={onPick}
              onWatch={onWatch}
            />
          ))}
        </ul>
      </div>

      {pause === 'scroll' && (
        <button type="button" className={MODVIEW_CHAT.resume} onClick={resume}>
          {MODVIEW_COPY.resume}
        </button>
      )}
      {pause === 'hover' && <p className={MODVIEW_CHAT.paused}>{MODVIEW_COPY.paused}</p>}

      <form
        className={MODVIEW_CHAT.composer}
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        {hint && <p className={MODVIEW_CHAT.hint}>{hint}</p>}
        <div className={MODVIEW_CHAT.composerRow}>
          <input
            ref={inputRef}
            className={MODVIEW_CHAT.input}
            placeholder={
              sayGate.allowed
                ? MODVIEW_COPY.placeholder
                : canCommand
                  ? MODVIEW_COPY.commandsOnly
                  : (sayGate.reason ?? '')
            }
            aria-label={MODVIEW_COPY.placeholder}
            disabled={!sayGate.allowed && !canCommand}
            value={draft}
            onChange={(event) => onDraft(event.target.value)}
          />
          <Button
            type="submit"
            variant="ghost"
            icon="chat"
            aria-label={MODVIEW_COPY.send}
            title={MODVIEW_COPY.send}
            disabled={!sayGate.allowed || !draft.trim()}
          />
        </div>
      </form>
    </ModWindow>
  )
}

interface ChatLineProps {
  message: ChatMessage
  options: Record<ChatOptionName, boolean>
  roster?: Record<string, MemoraRank>
  gate: GateCheck
  onAct: ActRunner
  onPick: (chatter: Chatter) => void
  onWatch: (chatter: Chatter) => void
}

/**
 * One chat line and its gestures
 * @param {ChatLineProps} props - Line props
 * @return {JSX.Element}
 */

const ChatRow = ({ message, options, roster, gate, onAct, onPick, onWatch }: ChatLineProps) => {
  const { contextMenu } = useMenu()
  const chatterId = message.author.id
  const isDeleted = Boolean(message.deletedBy)
  const isFirst = message.isFirst && options.firstMessages

  // The rank glyph stands in for the platform mod badge
  const tier = tierOf(message.author, roster)
  const rankIcon = TIER_BADGE_ICONS[tier]
  const badgeIcons = [
    ...(rankIcon ? [rankIcon] : []),
    ...message.author.badges
      .filter((badge) => !(rankIcon && badge === 'moderator'))
      .map((badge) => BADGE_ICONS[badge]),
  ]
  const deletedSentence = (
    <ActSentence
      text={MODVIEW_COPY.deletedBy.replace('{name}', message.deletedBy ?? '')}
      verb={MODVIEW_COPY.deletedVerb}
      tone="danger"
    />
  )

  // Three quick gestures
  const tools = [
    {
      icon: 'modDelete' as const,
      label: MODVIEW_COPY.quickDelete,
      intent: { kind: 'delete' as const, messageId: message.id, chatterId },
    },
    {
      icon: 'modTimeout' as const,
      label: MODVIEW_COPY.quickTimeout,
      intent: {
        kind: 'timeout' as const,
        chatterId,
        seconds: MODVIEW_DEFAULTS.quickTimeout,
        reason: null,
      },
    },
    {
      icon: 'modBan' as const,
      label: MODVIEW_COPY.quickBan,
      intent: { kind: 'ban' as const, chatterId, reason: null },
    },
  ]

  return (
    <li
      className={cn(
        MODVIEW_CHAT.line,
        isFirst && MODVIEW_CHAT.lineFirst,
        message.highlighted && MODVIEW_CHAT.lineLit
      )}
    >
      {isFirst && <span className={MODVIEW_CHAT.firstTag}>{MODVIEW_COPY.firstMessage}</span>}
      {options.timestamps && (
        <time className={MODVIEW_CHAT.time} dateTime={message.sentAt}>
          {formatClock(message.sentAt)}
        </time>
      )}
      {options.badges &&
        badgeIcons.map((icon) => {
          const Badge = ICONS[icon]
          return <Badge key={icon} className={MODVIEW_CHAT.badge} aria-hidden="true" />
        })}
      <button
        type="button"
        className={cn(MODVIEW_CHAT.name, options.colouredNames && MODVIEW_TIER[tier])}
        onClick={() => onPick(message.author)}
        onContextMenu={contextMenu(
          [
            {
              id: 'watch',
              label: MODVIEW_WATCH_COPY.start,
              icon: 'visible',
              onSelect: () => onWatch(message.author),
            },
            {
              id: 'dossier',
              label: MODVIEW_WATCH_COPY.dossier,
              icon: 'search',
              onSelect: () => onPick(message.author),
            },
          ],
          message.author.name
        )}
      >
        {message.author.name}
      </button>
      {': '}
      {isDeleted && !options.deleted ? (
        <span className={MODVIEW_CHAT.deleted}>{deletedSentence}</span>
      ) : (
        <span className={cn(isDeleted && MODVIEW_CHAT.deletedText)}>
          <FlaggedText text={message.text} flagged={message.flagged} />
        </span>
      )}
      {isDeleted && options.deleted && (
        <span className={MODVIEW_CHAT.deletedNote}>{deletedSentence}</span>
      )}

      {!isDeleted && (
        <span className={MODVIEW_CHAT.tools}>
          {tools.map((tool) => {
            const check = gate(tool.intent)
            const Icon = ICONS[tool.icon]

            return (
              <button
                key={tool.icon}
                type="button"
                className={MODVIEW_CHAT.tool}
                disabled={!check.allowed}
                title={check.reason ?? tool.label}
                aria-label={tool.label}
                onClick={() => onAct(tool.intent)}
              >
                <Icon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
              </button>
            )
          })}
        </span>
      )}
    </li>
  )
}

// Only changed lines render
const ChatLine = memo(ChatRow)
