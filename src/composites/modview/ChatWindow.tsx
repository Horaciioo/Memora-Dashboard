'use client'

import { useMemo, useState } from 'react'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { ChatComposer } from '@/composites/modview/ChatComposer'
import { ChatModesMenu } from '@/composites/modview/ChatModesMenu'
import { ChatRow } from '@/composites/modview/ChatRow'
import { ModWindow } from '@/composites/modview/ModWindow'
import { PinnedBar } from '@/composites/modview/PinnedBar'
import { PreferenceChoices } from '@/composites/modview/PreferenceChoices'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useLiveEmotes } from '@/core/hooks/data/lives/useLiveEmotes'
import { useChatPause } from '@/core/hooks/interaction/state/useChatPause'
import { useHoldKey } from '@/core/hooks/interaction/state/useHoldKey'
import { useModPreferences } from '@/core/hooks/interaction/state/useModPreferences'
import { recentChatters } from '@/core/lib/modview/compose'
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
}: ChatWindowProps) => {
  const [menu, setMenu] = useState<'modes' | 'options' | null>(null)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const { preferences, update } = useModPreferences()
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
  const chatters = useMemo(() => recentChatters(state.messages), [state.messages])

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
            type="button"
            className={cn(MODVIEW_MODES.trigger, spotlight === 'modes' && MODVIEW_CHAT.triggerLit)}
            aria-expanded={openMenu === 'modes'}
            onClick={() => setMenu(menu === 'modes' ? null : 'modes')}
          >
            {`${MODVIEW_COPY.modes} (${activeModes})`}
          </button>
          <button
            type="button"
            className={cn(
              MODVIEW_MODES.trigger,
              spotlight === 'chatOptions' && MODVIEW_CHAT.triggerLit
            )}
            aria-expanded={openMenu === 'options'}
            onClick={() => setMenu(menu === 'options' ? null : 'options')}
          >
            {MODVIEW_COPY.preferences}
          </button>
        </>
      }
    >
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

      {state.pinned && <PinnedBar pin={state.pinned} gate={gate} onAct={onAct} />}

      <div className={MODVIEW_CHAT.scroller} ref={listRef} data-keep-menu {...listHandlers}>
        <p className={MODVIEW_CHAT.welcome}>
          {MODVIEW_COPY.welcome.replace('{channel}', state.channel.name)}
        </p>
        <ul className={MODVIEW_CHAT.list}>
          {lines.map((message) => (
            <ChatRow
              key={message.id}
              message={message}
              options={shown}
              toolsPosition={preferences.toolsPosition}
              roster={state.roster}
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
