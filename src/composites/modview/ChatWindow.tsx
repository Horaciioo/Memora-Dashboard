'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { ChatComposer } from '@/composites/modview/ChatComposer'
import { ChatModesMenu } from '@/composites/modview/ChatModesMenu'
import { ChatRow } from '@/composites/modview/ChatRow'
import { ModWindow } from '@/composites/modview/ModWindow'
import { PinnedBar } from '@/composites/modview/PinnedBar'
import { PollBar } from '@/composites/modview/PollBar'
import { PreferenceChoices } from '@/composites/modview/PreferenceChoices'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useLiveEmotes } from '@/core/hooks/data/lives/useLiveEmotes'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { useChatPause } from '@/core/hooks/interaction/state/moderation/useChatPause'
import { useHoldKey } from '@/core/hooks/interaction/state/useHoldKey'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { recentChatters } from '@/core/lib/modview/compose'
import { repeatCounts } from '@/core/lib/modview/duplicates'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import {
  CHAT_MODES,
  CHAT_OPTIONS,
  PAUSE_MODES,
  TOOLS_POSITIONS,
} from '@/declarations/modview/registries'
import { MODVIEW_CHAT, MODVIEW_MODES } from '@/declarations/ui/variants'
import type { ChatMessage, Chatter, ModViewState, ModViewTarget } from '@/types/modview'
import { cn } from '@/utils/classnames'

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
  onSend: (text: string, replyToId?: string) => void
  // Why the last line was not sent
  hint: string | null
  // Terms drawers offered in the modes
  hasTerms?: boolean
  // Real live whose Twitch emotes the box offers
  liveId?: string | null
  // Opens the settings box
  onSettings?: () => void
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
 * @param {(text: string, replyToId?: string) => void} onSend - Sending handler, commands included
 * @param {string | null} hint - Why the last line was not sent
 * @param {boolean} [hasTerms] - Terms drawers offered
 * @param {string | null} [liveId] - Real live whose emotes the box offers
 * @param {() => void} [onSettings] - Opens the settings box
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
  liveId = null,
  onSettings,
}: ChatWindowProps) => {
  const [menu, setMenu] = useState<'modes' | 'options' | null>(null)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const menusRef = useRef<HTMLDivElement>(null)
  const modesRef = useRef<HTMLButtonElement>(null)
  const optionsRef = useRef<HTMLButtonElement>(null)
  const { preferences, update } = useModPreferences()
  // A pointer elsewhere folds the menu, its drawers and dialogs excepted
  const menuBounds = useMemo(() => [menusRef, modesRef, optionsRef], [])
  const foldMenu = useCallback(() => setMenu(null), [])
  useOutsideDismiss(menu !== null, menuBounds, foldMenu, '[role="dialog"], [aria-modal="true"]')
  const { emotes } = useLiveEmotes(liveId)

  // A scene drives the menu over the reader
  const script = state.chatScript
  const openMenu = script ? script.menu : menu
  const forced = script?.options
  const shown = useMemo(() => ({ ...preferences, ...forced }), [preferences, forced])
  const { listRef, lines, pause, resume, hold, listHandlers } = useChatPause(
    state.messages,
    preferences.pauseMode === 'hover'
  )
  // Alt held freezes the chat
  useHoldKey('Alt', hold, preferences.pauseMode === 'alt')
  // Bots stay out when asked
  const visible = useMemo(
    () => (shown.hideBots ? lines.filter((line) => !line.author.badges.includes('bot')) : lines),
    [lines, shown.hideBots]
  )
  const chatters = useMemo(() => recentChatters(state.messages), [state.messages])
  const repeats = useMemo(
    () => repeatCounts(state.messages, preferences.repeatWords),
    [state.messages, preferences.repeatWords]
  )

  // Caret of the open menu points at its own title
  useLayoutEffect(() => {
    const menuEl = menusRef.current?.firstElementChild as HTMLElement | null
    const trigger = openMenu === 'modes' ? modesRef.current : optionsRef.current
    if (!menuEl || !trigger) return
    const box = trigger.getBoundingClientRect()
    const x = box.left + box.width / 2 - menuEl.getBoundingClientRect().left
    menuEl.style.setProperty('--arrow-x', `${Math.max(16, x)}px`)
  }, [openMenu])

  const activeModes = CHAT_MODES.keys.filter((mode) =>
    mode === 'slow' ? state.modes.slowSeconds !== null : state.modes[mode]
  ).length

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
            ref={modesRef}
            type="button"
            className={cn(MODVIEW_MODES.trigger, spotlight === 'modes' && MODVIEW_CHAT.triggerLit)}
            aria-expanded={openMenu === 'modes'}
            onClick={() => setMenu(menu === 'modes' ? null : 'modes')}
          >
            {`${MODVIEW_COPY.modes} (${activeModes})`}
          </button>
        </>
      }
    >
      <div ref={menusRef} className="contents">
        {openMenu === 'modes' && (
          <ChatModesMenu state={state} gate={gate} onAct={onAct} hasTerms={hasTerms} />
        )}
        {openMenu === 'options' && (
          <div className={MODVIEW_MODES.panel} role="menu" aria-label={MODVIEW_COPY.preferences}>
            <p className={MODVIEW_MODES.section}>{MODVIEW_COPY.preferencesDisplay}</p>
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
                  onChange={(checked) => update({ [key]: checked })}
                />
              </div>
            ))}

            <PreferenceChoices
              title={MODVIEW_COPY.preferencesPause}
              keys={PAUSE_MODES.keys}
              value={preferences.pauseMode}
              label={PAUSE_MODES.label}
              onPick={(mode) => update({ pauseMode: mode })}
            />
            <PreferenceChoices
              title={MODVIEW_COPY.preferencesTools}
              keys={TOOLS_POSITIONS.keys}
              value={preferences.toolsPosition}
              label={TOOLS_POSITIONS.label}
              onPick={(position) => update({ toolsPosition: position })}
            />
          </div>
        )}
      </div>

      {state.poll && <PollBar key={state.poll.id} poll={state.poll} gate={gate} onAct={onAct} />}
      {state.pinned && (
        <PinnedBar key={state.pinned.messageId} pin={state.pinned} gate={gate} onAct={onAct} />
      )}

      <div className={MODVIEW_CHAT.scroller} ref={listRef} data-keep-menu {...listHandlers}>
        <p className={MODVIEW_CHAT.welcome}>
          {MODVIEW_COPY.welcome.replace('{channel}', state.channel.name)}
        </p>
        <ul
          className={cn(
            MODVIEW_CHAT.list,
            MODVIEW_CHAT.size[preferences.textSize],
            MODVIEW_CHAT.gap[preferences.density]
          )}
        >
          {visible.map((message) => (
            <ChatRow
              key={message.id}
              message={message}
              options={shown}
              toolsPosition={preferences.toolsPosition}
              actions={preferences.actions}
              confirmHarsh={preferences.confirmHarsh}
              repeat={repeats.get(message.id)}
              roster={state.roster}
              emblems={state.emblems}
              gate={gate}
              onAct={onAct}
              onPick={onPick}
              onWatch={onWatch}
              onReply={setReplyTo}
            />
          ))}
        </ul>
      </div>

      {(pause === 'scroll' || pause === 'manual') && (
        <button type="button" className={MODVIEW_CHAT.resume} onClick={resume}>
          {pause === 'manual' ? MODVIEW_COPY.frozen : MODVIEW_COPY.resume}
        </button>
      )}
      {pause === 'hover' && <p className={MODVIEW_CHAT.paused}>{MODVIEW_COPY.paused}</p>}

      <ChatComposer
        draft={draft}
        onDraft={onDraft}
        onSend={(text, replyToId) => {
          onSend(text, replyToId)
          setReplyTo(null)
        }}
        hint={hint}
        gate={gate}
        chatters={chatters}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        emotes={emotes}
      />
    </ModWindow>
  )
}
