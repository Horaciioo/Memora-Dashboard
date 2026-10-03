'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ChatModesMenu } from '@/composites/modview/ChatModesMenu'
import { FlaggedText } from '@/composites/modview/FlaggedText'
import { ModWindow } from '@/composites/modview/ModWindow'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { CHAT_MODES, CHAT_OPTIONS, MODVIEW_DEFAULTS } from '@/declarations/modview/registries'
import type { ChatOptionName } from '@/declarations/modview/registries'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_CHAT, MODVIEW_MODES } from '@/declarations/ui/variants'
import type { ChatBadge, ChatMessage, Chatter, ModViewState, ModViewTarget } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/modview'

// Badge glyphs, drawn before the name
const BADGE_ICONS: Record<ChatBadge, IconName> = {
  broadcaster: 'broadcaster',
  moderator: 'shield',
  vip: 'vip',
  bot: 'chatBot',
  subscriber: 'modeSubscribers',
}

// Pixels from the bottom still read as following
const FOLLOW_SLACK = 48

export interface ChatWindowProps {
  state: ModViewState
  spotlight: ModViewTarget | null
  gate: GateCheck
  onAct: ActRunner
  onPick: (chatter: Chatter) => void
}

/**
 * Live chat, its modes and its gestures
 * @param {ModViewState} state - Mod View state
 * @param {ModViewTarget | null} spotlight - Part lit by a scene
 * @param {GateCheck} gate - Permission check
 * @param {ActRunner} onAct - Gesture runner
 * @param {(chatter: Chatter) => void} onPick - Open a viewer card
 * @return {JSX.Element}
 */

export const ChatWindow = ({ state, spotlight, gate, onAct, onPick }: ChatWindowProps) => {
  const [menu, setMenu] = useState<'modes' | 'options' | null>(null)
  const [draft, setDraft] = useState('')
  const [isFollowing, setFollowing] = useState(true)
  const [options, setOptions] = useState<Record<ChatOptionName, boolean>>({
    timestamps: true,
    badges: true,
    deleted: true,
    firstMessages: true,
  })
  const listRef = useRef<HTMLDivElement>(null)

  // A scene drives the menu over the reader
  const script = state.chatScript
  const openMenu = script ? script.menu : menu
  const shown = { ...options, ...script?.options }

  // Follow the newest line unless the reader went up
  useEffect(() => {
    const list = listRef.current
    if (list && isFollowing) list.scrollTop = list.scrollHeight
  }, [state.messages, isFollowing])

  const onScroll = () => {
    const list = listRef.current
    if (!list) return
    setFollowing(list.scrollHeight - list.scrollTop - list.clientHeight < FOLLOW_SLACK)
  }

  const sayGate = gate({ kind: 'say', text: draft })
  const activeModes = CHAT_MODES.keys.filter((mode) =>
    mode === 'slow' ? state.modes.slowSeconds !== null : state.modes[mode]
  ).length
  const ModesIcon = ICONS.modeSlow
  const OptionsIcon = ICONS.more

  const send = () => {
    if (!draft.trim() || !sayGate.allowed) return
    onAct({ kind: 'say', text: draft.trim() })
    setDraft('')
  }

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
      {openMenu === 'modes' && <ChatModesMenu state={state} gate={gate} onAct={onAct} />}
      {openMenu === 'options' && (
        <div className={MODVIEW_MODES.panel} role="menu" aria-label={MODVIEW_COPY.chatOptions}>
          {CHAT_OPTIONS.keys.map((key) => (
            <button
              key={key}
              type="button"
              role="menuitemcheckbox"
              aria-checked={shown[key]}
              className={cn(MODVIEW_MODES.row, script?.lit === key && MODVIEW_MODES.rowLit)}
              onClick={() => setOptions((current) => ({ ...current, [key]: !current[key] }))}
            >
              <span className={MODVIEW_MODES.rowLabel}>{CHAT_OPTIONS.label(key)}</span>
              <span
                className={cn(
                  MODVIEW_MODES.rowState,
                  shown[key] ? MODVIEW_MODES.on : MODVIEW_MODES.off
                )}
              >
                {shown[key] ? MODVIEW_COPY.modeOn : MODVIEW_COPY.modeOff}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className={MODVIEW_CHAT.scroller} ref={listRef} onScroll={onScroll}>
        <p className={MODVIEW_CHAT.welcome}>
          {MODVIEW_COPY.welcome.replace('{channel}', state.channel.name)}
        </p>
        <ul className={MODVIEW_CHAT.list}>
          {state.messages.map((message) => (
            <ChatLine
              key={message.id}
              message={message}
              options={shown}
              gate={gate}
              onAct={onAct}
              onPick={onPick}
            />
          ))}
        </ul>
      </div>

      {!isFollowing && (
        <button type="button" className={MODVIEW_CHAT.resume} onClick={() => setFollowing(true)}>
          {MODVIEW_COPY.resume}
        </button>
      )}

      <form
        className={MODVIEW_CHAT.composer}
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <input
          className={MODVIEW_CHAT.input}
          placeholder={sayGate.allowed ? MODVIEW_COPY.placeholder : (sayGate.reason ?? '')}
          aria-label={MODVIEW_COPY.placeholder}
          disabled={!sayGate.allowed}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className={MODVIEW_CHAT.composerRow}>
          <Button type="submit" variant="primary" disabled={!sayGate.allowed || !draft.trim()}>
            {MODVIEW_COPY.send}
          </Button>
        </div>
      </form>
    </ModWindow>
  )
}

interface ChatLineProps {
  message: ChatMessage
  options: Record<ChatOptionName, boolean>
  gate: GateCheck
  onAct: ActRunner
  onPick: (chatter: Chatter) => void
}

/**
 * One chat line and its gestures
 * @param {ChatLineProps} props - Line props
 * @return {JSX.Element}
 */

const ChatLine = ({ message, options, gate, onAct, onPick }: ChatLineProps) => {
  const chatterId = message.author.id
  const isDeleted = Boolean(message.deletedBy)
  const isFirst = message.isFirst && options.firstMessages

  // Three quick gestures, each behind its own gate
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
        message.author.badges.map((badge) => {
          const Badge = ICONS[BADGE_ICONS[badge]]
          return <Badge key={badge} className={MODVIEW_CHAT.badge} aria-hidden="true" />
        })}
      <button
        type="button"
        className={MODVIEW_CHAT.name}
        style={message.author.colour ? { color: message.author.colour } : undefined}
        onClick={() => onPick(message.author)}
      >
        {message.author.name}
      </button>
      {': '}
      {isDeleted && !options.deleted ? (
        <span className={MODVIEW_CHAT.deleted}>{MODVIEW_COPY.deletedBy}</span>
      ) : (
        <span className={cn(isDeleted && MODVIEW_CHAT.deletedText)}>
          <FlaggedText text={message.text} flagged={message.flagged} />
        </span>
      )}
      {isDeleted && options.deleted && (
        <span className={MODVIEW_CHAT.deletedNote}>{MODVIEW_COPY.deletedBy}</span>
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
