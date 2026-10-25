'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { EmotePicker } from '@/composites/modview/EmotePicker'
import type { GateCheck } from '@/composites/modview/types'
import {
  commandsTyped,
  insertName,
  matchChatters,
  nameBeingTyped,
} from '@/core/lib/modview/compose'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter, LiveEmotes } from '@/types/modview'
import { cn } from '@/utils/classnames'

// One row of the menu above the box
interface MenuEntry {
  key: string
  label: string
  hint: string
  locked: string | null
  // Line once picked
  apply: (draft: string) => string
}

export interface ChatComposerProps {
  draft: string
  onDraft: (text: string) => void
  onSend: (text: string, replyToId?: string) => void
  hint: string | null
  gate: GateCheck
  // Chatters, the latest speakers first
  chatters: Chatter[]
  replyTo: ChatMessage | null
  onCancelReply: () => void
  // Twitch emotes, null while loading or off a real live
  emotes: LiveEmotes | null
}

/**
 * Chat box: the line, the commands and the names offered as it is typed, the reply it answers
 * @param {ChatComposerProps} props - Composer props
 * @return {JSX.Element}
 */

export const ChatComposer = ({
  draft,
  onDraft,
  onSend,
  hint,
  gate,
  chatters,
  replyTo,
  onCancelReply,
  emotes,
}: ChatComposerProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cursor, setCursor] = useState(0)
  // Line the menu was closed on
  const [closedOn, setClosedOn] = useState<string | null>(null)
  const CloseIcon = ICONS.close
  const EmojiIcon = ICONS.emoji
  const [isPickerOpen, setPickerOpen] = useState(false)

  // A command is gated as the gesture it carries
  const isCommand = draft.trim().startsWith('/')
  const sayGate = isCommand ? { allowed: true, reason: null } : gate({ kind: 'say', text: draft })
  // Commands stay open where talking is closed
  const canCommand = gate({ kind: 'ban', chatterId: '', reason: null }).allowed

  // A line written by the panel lands under the cursor
  useEffect(() => {
    if (draft.startsWith('/')) inputRef.current?.focus()
  }, [draft])

  // A reply puts the cursor in the box
  useEffect(() => {
    if (replyTo) inputRef.current?.focus()
  }, [replyTo])

  const menu = useMemo(() => {
    const commands = commandsTyped(draft)
    if (commands) {
      return {
        title: MODVIEW_COPY.commandsTitle,
        entries: commands.map<MenuEntry>((option) => ({
          key: option.name,
          label: `/${option.name}`,
          hint: [option.usage, option.description].filter(Boolean).join(' - '),
          locked: gate(option.probe).allowed ? null : (gate(option.probe).reason ?? ''),
          apply: () => `/${option.name} `,
        })),
      }
    }

    const word = nameBeingTyped(draft)
    if (!word) return null

    return {
      title: MODVIEW_COPY.mentionsTitle,
      entries: matchChatters(chatters, word.query).map<MenuEntry>((chatter) => ({
        key: chatter.id,
        label: chatter.name,
        hint: '',
        locked: null,
        apply: (current) => insertName(current, word, chatter),
      })),
    }
  }, [draft, chatters, gate])

  const isOpen = menu !== null && menu.entries.length > 0 && closedOn !== draft
  const selected = Math.min(cursor, (menu?.entries.length ?? 1) - 1)

  const pick = (entry: MenuEntry | undefined) => {
    if (!entry || entry.locked !== null) return
    onDraft(entry.apply(draft))
    setCursor(0)
    inputRef.current?.focus()
  }

  // The word lands where the cursor stands
  const insert = (text: string) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? draft.length
    const end = input?.selectionEnd ?? draft.length
    onDraft(`${draft.slice(0, start)}${text}${draft.slice(end)}`)

    // The caret follows the new word
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const send = () => {
    if (!draft.trim() || !sayGate.allowed) return
    onSend(draft, isCommand ? undefined : replyTo?.id)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !menu) return
    const count = menu.entries.length

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((selected + (event.key === 'ArrowDown' ? 1 : count - 1)) % count)
    } else if (event.key === 'Tab' || event.key === 'Enter') {
      event.preventDefault()
      pick(menu.entries[selected])
    } else if (event.key === 'Escape') {
      setClosedOn(draft)
    }
  }

  return (
    <form
      className={MODVIEW_CHAT.composer}
      onSubmit={(event) => {
        event.preventDefault()
        send()
      }}
    >
      {hint && <p className={MODVIEW_CHAT.hint}>{hint}</p>}

      {isOpen && menu && (
        <div className={MODVIEW_CHAT.menu} role="listbox" aria-label={menu.title}>
          <p className={MODVIEW_CHAT.menuTitle}>{menu.title}</p>
          {menu.entries.map((entry, index) => (
            <button
              key={entry.key}
              type="button"
              role="option"
              aria-selected={index === selected}
              disabled={entry.locked !== null}
              title={entry.locked ?? undefined}
              className={cn(MODVIEW_CHAT.menuItem, index === selected && MODVIEW_CHAT.menuItemOn)}
              // The box keeps focus
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(entry)}
            >
              <span className={MODVIEW_CHAT.menuName}>{entry.label}</span>
              {entry.hint && <span className={MODVIEW_CHAT.menuHint}>{entry.hint}</span>}
            </button>
          ))}
        </div>
      )}

      {isPickerOpen && <EmotePicker emotes={emotes} onPick={insert} />}

      {replyTo && !isCommand && (
        <div className={MODVIEW_CHAT.replyBanner}>
          <span className={MODVIEW_CHAT.replyText}>
            {MODVIEW_COPY.replyTo.replace('{name}', replyTo.author.name)}
            {`: ${replyTo.text}`}
          </span>
          <button
            type="button"
            className={MODVIEW_CHAT.replyClose}
            aria-label={MODVIEW_COPY.replyCancel}
            title={MODVIEW_COPY.replyCancel}
            onClick={onCancelReply}
          >
            <CloseIcon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
          </button>
        </div>
      )}

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
          autoComplete="off"
          onChange={(event) => {
            onDraft(event.target.value)
            setCursor(0)
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          className={MODVIEW_CHAT.emoteToggle}
          aria-label={MODVIEW_COPY.emotesOpen}
          aria-expanded={isPickerOpen}
          title={MODVIEW_COPY.emotesOpen}
          disabled={!sayGate.allowed}
          onClick={() => setPickerOpen(!isPickerOpen)}
        >
          <EmojiIcon className={MODVIEW_CHAT.toolIcon} aria-hidden="true" />
        </button>
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
  )
}
