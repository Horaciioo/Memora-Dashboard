'use client'

import { memo } from 'react'

import { ActSentence } from '@/composites/modview/ActSentence'
import { ModActionBar } from '@/composites/modview/actions/ModActionBar'
import { actionMenuItems } from '@/composites/modview/actions/actionMenu'
import { useActionRunner } from '@/composites/modview/actions/useActionRunner'
import { ChatText } from '@/composites/modview/ChatText'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { tierOf } from '@/core/lib/modview/tier'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { TIER_BADGE_ICONS } from '@/declarations/modview/registries'
import type { ChatOptionName } from '@/declarations/modview/registries'
import { MODVIEW_PERSONAL_COPY } from '@/declarations/modview/personal'
import { MODVIEW_WATCH_COPY } from '@/declarations/modview/watch'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_CHAT, MODVIEW_TIER } from '@/declarations/ui/variants'
import type {
  ChatBadge,
  ChatMessage,
  Chatter,
  MemoraRank,
  SeatEmblem,
  ModActionConfig,
  ModPreferences,
} from '@/types/modview'
import { cn } from '@/utils/classnames'
import { SeatGlyphs } from '@/composites/modview/SeatGlyphs'
import { chatColour } from '@/utils/format/chatColour'

// Badge glyphs
const BADGE_ICONS: Record<ChatBadge, IconName> = {
  broadcaster: 'broadcaster',
  moderator: 'shield',
  vip: 'vip',
  bot: 'chatBot',
  subscriber: 'modeSubscribers',
}

// Style of the gesture box per placement
const TOOLS_CLASS = {
  left: 'tools',
  hover: 'toolsHover',
  right: 'toolsRight',
  card: 'toolsHover',
} as const

export interface ChatRowProps {
  message: ChatMessage
  options: Record<ChatOptionName, boolean>
  toolsPosition: ModPreferences['toolsPosition']
  actions: ModActionConfig[]
  confirmHarsh: boolean
  // Times the line was said, when said again
  repeat?: number
  roster?: Record<string, MemoraRank>
  emblems?: Record<string, SeatEmblem>
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
  actions,
  confirmHarsh,
  repeat,
  roster,
  emblems,
  gate,
  onAct,
  onPick,
  onWatch,
  onReply,
}: ChatRowProps) => {
  const { contextMenu } = useMenu()
  const chatterId = message.author.id
  const isDeleted = Boolean(message.deletedBy)
  const isFirst = message.isFirst && options.firstMessages
  const nameColour = chatColour(message.author)

  // The rank glyph stands in for the platform mod badge
  const tier = tierOf(message.author, roster)
  const rankIcon = TIER_BADGE_ICONS[tier]
  const emblem = emblems?.[message.author.id]
  const badgeIcons = [
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

  // The moderator's own buttons, after the reply gesture
  const target = { chatterId, messageId: message.id }
  const { run, dialog } = useActionRunner(onAct, confirmHarsh)
  const runAction = (action: ModActionConfig) => run(action, target, message.author.name)
  const ReplyIcon = ICONS.reply
  const isInCard = toolsPosition === 'card'

  const toolsNode = !isDeleted && (
    <span className={MODVIEW_CHAT[TOOLS_CLASS[toolsPosition]]}>
      <button
        type="button"
        className={MODVIEW_CHAT.tool}
        title={MODVIEW_COPY.reply}
        aria-label={MODVIEW_COPY.reply}
        onClick={() => onReply(message)}
      >
        <ReplyIcon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
      </button>
      {!isInCard && <ModActionBar actions={actions} target={target} gate={gate} run={runAction} />}
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
      {(toolsPosition === 'left' || toolsPosition === 'right') && toolsNode}
      {options.badges && emblem && (
        <SeatGlyphs
          emblem={emblem}
          className={MODVIEW_CHAT.emblems}
          glyphClassName={MODVIEW_CHAT.emblem}
        />
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
            ...actionMenuItems(
              actions.filter((action) => action.isOn),
              target,
              gate,
              runAction
            ).map((item, index) => ({ ...item, separatorBefore: index === 0 })),
          ],
          message.author.name
        )}
      >
        {message.author.name}
      </button>
      {repeat && (
        <span
          className={MODVIEW_CHAT.repeat}
          title={MODVIEW_PERSONAL_COPY.repeatTitle.replace('{count}', String(repeat))}
        >
          {MODVIEW_PERSONAL_COPY.repeatBadge.replace('{count}', String(repeat))}
        </span>
      )}
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
      {(toolsPosition === 'hover' || isInCard) && toolsNode}
      {dialog}
    </li>
  )
}

// Only changed lines render
export const ChatRow = memo(ChatLineBody)
