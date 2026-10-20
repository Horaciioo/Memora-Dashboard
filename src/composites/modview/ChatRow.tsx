'use client'

import { memo, useState } from 'react'

import { ActSentence } from '@/composites/modview/ActSentence'
import { ChatText } from '@/composites/modview/ChatText'
import { WarnDialog } from '@/composites/modview/WarnDialog'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { tierOf } from '@/core/lib/modview/tier'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_DEFAULTS, TIER_BADGE_ICONS } from '@/declarations/modview/registries'
import type { ChatOptionName } from '@/declarations/modview/registries'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_CHAT, MODVIEW_TIER } from '@/declarations/ui/variants'
import type { ChatBadge, ChatMessage, Chatter, MemoraRank, ModViewIntent } from '@/types/modview'
import { cn } from '@/utils/classnames'
import { chatColour } from '@/utils/format/chatColour'
import { formatClock } from '@/utils/format/modview'

// Badge glyphs
const BADGE_ICONS: Record<ChatBadge, IconName> = {
  broadcaster: 'broadcaster',
  moderator: 'shield',
  vip: 'vip',
  bot: 'chatBot',
  subscriber: 'modeSubscribers',
}

export interface ChatRowProps {
  message: ChatMessage
  options: Record<ChatOptionName, boolean>
  toolsPosition: 'left' | 'hover'
  roster?: Record<string, MemoraRank>
  gate: GateCheck
  onAct: ActRunner
  onPick: (chatter: Chatter) => void
  onWatch: (chatter: Chatter) => void
  onReply: (message: ChatMessage) => void
}

/**
 * One chat line: its gestures at the start, always in sight
 * @param {ChatRowProps} props - Line props
 * @return {JSX.Element}
 */

const ChatLineBody = ({
  message,
  options,
  toolsPosition,
  roster,
  gate,
  onAct,
  onPick,
  onWatch,
  onReply,
}: ChatRowProps) => {
  const { contextMenu } = useMenu()
  const [isWarning, setWarning] = useState(false)
  const chatterId = message.author.id
  const isDeleted = Boolean(message.deletedBy)
  const isFirst = message.isFirst && options.firstMessages
  const nameColour = chatColour(message.author)

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

  // Quick gestures
  const tools: { icon: IconName; label: string; intent: ModViewIntent; run?: () => void }[] = [
    {
      icon: 'reply',
      label: MODVIEW_COPY.reply,
      intent: { kind: 'say', text: ' ' },
      run: () => onReply(message),
    },
    {
      icon: 'modWarn',
      label: MODVIEW_COPY.quickWarn,
      intent: { kind: 'warn', chatterId, reason: 'x' },
      run: () => setWarning(true),
    },
    {
      icon: 'modDelete',
      label: MODVIEW_COPY.quickDelete,
      intent: { kind: 'delete', messageId: message.id, chatterId },
    },
    {
      icon: 'modTimeout',
      label: MODVIEW_COPY.quickTimeout,
      intent: {
        kind: 'timeout',
        chatterId,
        seconds: MODVIEW_DEFAULTS.quickTimeout,
        reason: null,
      },
    },
    {
      icon: 'modBan',
      label: MODVIEW_COPY.quickBan,
      intent: { kind: 'ban', chatterId, reason: null },
    },
  ]

  const toolsNode = !isDeleted && (
    <span className={toolsPosition === 'left' ? MODVIEW_CHAT.tools : MODVIEW_CHAT.toolsHover}>
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
            onClick={() => (tool.run ? tool.run() : onAct(tool.intent))}
          >
            <Icon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
          </button>
        )
      })}
    </span>
  )

  // Right click on the line: answer, watch, pin
  const pin = gate({ kind: 'pin', messageId: message.id })
  const pinItem: MenuItem[] = pin.allowed
    ? [
        {
          id: 'pin',
          label: MODVIEW_COPY.pin,
          icon: 'modPin',
          onSelect: () => onAct({ kind: 'pin', messageId: message.id }),
        },
      ]
    : []
  const lineMenu: MenuItem[] = [
    ...(isDeleted
      ? []
      : [
          {
            id: 'reply',
            label: MODVIEW_COPY.reply,
            icon: 'reply' as const,
            onSelect: () => onReply(message),
          },
        ]),
    {
      id: 'watch',
      label: MODVIEW_WATCH_COPY.watch,
      icon: 'visible' as const,
      onSelect: () => onWatch(message.author),
    },
    ...(isDeleted ? [] : pinItem),
  ]

  return (
    <li
      onContextMenu={lineMenu.length > 0 ? contextMenu(lineMenu, message.author.name) : undefined}
      className={cn(
        MODVIEW_CHAT.line,
        isFirst && MODVIEW_CHAT.lineFirst,
        message.highlighted && MODVIEW_CHAT.lineLit
      )}
    >
      {isFirst && <span className={MODVIEW_CHAT.firstTag}>{MODVIEW_COPY.firstMessage}</span>}
      {message.reply && (
        <span className={MODVIEW_CHAT.replyLine}>
          {MODVIEW_COPY.replyingTo.replace('{name}', message.reply.authorName)}
          {`: ${message.reply.text}`}
        </span>
      )}
      {toolsPosition === 'left' && toolsNode}
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
        className={cn(
          MODVIEW_CHAT.name,
          options.colouredNames && (tier === 'viewer' ? undefined : MODVIEW_TIER[tier])
        )}
        style={options.colouredNames && tier === 'viewer' ? { color: nameColour } : undefined}
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
            ...(isDeleted ? [] : pinItem),
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
          <ChatText text={message.text} fragments={message.fragments} flagged={message.flagged} />
        </span>
      )}
      {isDeleted && options.deleted && (
        <span className={MODVIEW_CHAT.deletedNote}>{deletedSentence}</span>
      )}
      {toolsPosition === 'hover' && toolsNode}
      {isWarning && (
        <WarnDialog
          name={message.author.name}
          onConfirm={(reason) => onAct({ kind: 'warn', chatterId, reason })}
          onClose={() => setWarning(false)}
        />
      )}
    </li>
  )
}

// Only changed lines render
export const ChatRow = memo(ChatLineBody)
