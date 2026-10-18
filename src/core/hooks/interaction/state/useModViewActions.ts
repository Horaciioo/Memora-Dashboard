'use client'

import { useCallback, useMemo, useState } from 'react'

import { parseChatCommand, rememberRung, writeRungCommand } from '@/core/lib/modview/commands'
import type { PanelMemory } from '@/core/lib/modview/commands'
import { gateIntent } from '@/core/lib/modview/gate'
import { MODVIEW_COMMAND_COPY, MODVIEW_PANEL_COPY } from '@/declarations/modview/copy'
import type { ActContext, Chatter, ModViewDriver, ModViewIntent } from '@/types/modview'
import type { SanctionOffenseCard } from '@/types/sanctions'
import { SanctionKinds } from '@/utils/constants/moderation'
import type { PermissionName } from '@/utils/constants/permissions'

// Rung a prefilled line carries until it is sent
interface PendingRung {
  chatterId: string
  offenseId: string
  rung: number
}

/**
 * Gestures of a Mod View: permission gate, acting, the chat line and the sanctions panel
 * @param {Object} input - Sources
 * @param {ModViewDriver} input.driver - Data source
 * @param {PermissionName[]} input.permissions - Held on this live
 * @param {PanelMemory} input.initialMemory - Rungs already applied
 * @param {string | null} input.onBehalfOfId - Member the gestures are made for
 * @return {Object} - State and gestures
 */

export const useModViewActions = (input: {
  driver: ModViewDriver
  permissions: PermissionName[]
  initialMemory: PanelMemory
  onBehalfOfId: string | null
}) => {
  const { driver, permissions, initialMemory, onBehalfOfId } = input
  const { state } = driver
  const [picked, setPicked] = useState<Chatter | null>(null)
  const [draft, setDraft] = useState('')
  const [hint, setHint] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingRung | null>(null)
  const [memory, setMemory] = useState<PanelMemory>(initialMemory)

  // Every chatter on screen
  const chatters = useMemo(() => {
    const known = new Map<string, Chatter>()
    for (const message of state.messages) known.set(message.author.id, message.author)
    for (const held of state.held) known.set(held.author.id, held.author)
    for (const group of Object.values(state.community)) {
      for (const chatter of group) known.set(chatter.id, chatter)
    }

    return known
  }, [state.messages, state.held, state.community])

  const findChatter = useCallback(
    (name: string) =>
      [...chatters.values()].find(
        (chatter) =>
          chatter.login === name.toLowerCase() || chatter.name.toLowerCase() === name.toLowerCase()
      ) ?? null,
    [chatters]
  )

  const gate = useCallback(
    (intent: ModViewIntent) =>
      gateIntent(intent, {
        permissions,
        platform: state.platform,
        liveconLevel: state.liveconLevel,
        offline:
          state.connection === 'disconnected' ||
          state.connection === 'connecting' ||
          state.readOnly === true,
        offlineReason: state.notice,
      }),
    [
      permissions,
      state.platform,
      state.liveconLevel,
      state.connection,
      state.readOnly,
      state.notice,
    ]
  )

  // A refused gesture never reaches the driver
  const act = useCallback(
    (intent: ModViewIntent, context: ActContext = {}) => {
      if (!gate(intent).allowed) return

      const chatterId = 'chatterId' in intent ? intent.chatterId : null
      void driver.act(intent, {
        ...context,
        targetLogin:
          context.targetLogin ?? (chatterId ? chatters.get(chatterId)?.login : undefined),
        ...(onBehalfOfId ? { onBehalfOfId } : {}),
      })
    },
    [driver, gate, chatters, onBehalfOfId]
  )

  // The panel writes the line
  const prefill = (
    offense: SanctionOffenseCard,
    rung: number,
    chatter: Chatter | null = picked
  ) => {
    const step = offense.rungs[rung]
    if (!chatter || !step) return

    const text = writeRungCommand(step, chatter.login, offense.name)

    // A deletion has no command
    if (!text) {
      const lastLine = [...state.messages]
        .reverse()
        .find((message) => message.author.id === chatter.id && !message.deletedBy)
      const deletes = step.measures.some((measure) => measure.kind === SanctionKinds.Delete)

      if (deletes && lastLine) {
        act(
          { kind: 'delete', messageId: lastLine.id, chatterId: chatter.id },
          { offenseId: offense.id, rung, targetLogin: chatter.login }
        )
        setMemory((current) => rememberRung(current, chatter.id, offense.id, rung))
        setHint(null)
        return
      }

      setHint(MODVIEW_PANEL_COPY.noGesture)
      return
    }

    setPicked(chatter)
    setDraft(text)
    setHint(null)
    setPending({ chatterId: chatter.id, offenseId: offense.id, rung })
  }

  const send = (text: string) => {
    const parsed = parseChatCommand(text, findChatter)

    if (parsed.kind === 'error') {
      setHint(MODVIEW_COMMAND_COPY[parsed.reason])
      return
    }

    if (parsed.kind === 'say') {
      act({ kind: 'say', text: parsed.text })
    } else {
      const check = gate(parsed.intent)
      if (!check.allowed) {
        setHint(MODVIEW_COMMAND_COPY.refused.replace('{reason}', check.reason ?? ''))
        return
      }

      // The rung counts only for the viewer it was written for
      const fromPanel = pending?.chatterId === parsed.target.id ? pending : null
      act(parsed.intent, {
        targetLogin: parsed.target.login,
        ...(fromPanel ? { offenseId: fromPanel.offenseId, rung: fromPanel.rung } : {}),
      })
      if (fromPanel) {
        setMemory((current) =>
          rememberRung(current, fromPanel.chatterId, fromPanel.offenseId, fromPanel.rung)
        )
      }
    }

    setDraft('')
    setHint(null)
    setPending(null)
  }

  const writeDraft = (text: string) => {
    setDraft(text)
    setHint(null)
    // Rewritten by hand
    if (!text.startsWith('/')) setPending(null)
  }

  // A line a suggestion wrote, applied to the rung it stands for
  const useLine = (text: string, rung?: { chatterId: string; offenseId: string; rung: number }) => {
    setDraft(text)
    setHint(null)
    setPending(rung ?? null)
  }

  return {
    picked,
    setPicked,
    draft,
    hint,
    memory,
    chatters,
    findChatter,
    gate,
    act,
    prefill,
    send,
    writeDraft,
    useLine,
  }
}
