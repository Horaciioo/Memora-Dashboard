'use client'

import { useState } from 'react'

import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import {
  MODVIEW_ACTION_KINDS,
  MODVIEW_ACTION_LIMITS,
  MODVIEW_DEFAULT_ACTIONS,
} from '@/declarations/modview/actions'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { ModActionConfig, ModActionKind } from '@/types/modview'

// Fresh action of a kind
const newAction = (kind: ModActionKind): ModActionConfig => ({
  id: `a-${crypto.randomUUID().slice(0, 8)}`,
  kind,
  seconds: kind === 'timeout' ? MODVIEW_ACTION_LIMITS.newSeconds : null,
  reason: null,
  icon: MODVIEW_ACTION_KINDS[kind].icon,
  look: 'icon',
  colour: null,
  isOn: true,
})

/**
 * Draft of the custom actions, every edit shown live in the chat until saved
 * @return {Object} - Draft and the gestures that change it
 */

export const useActionsDraft = () => {
  const { preferences, preview } = useModPreferences()
  const { notify } = useNotifications()
  const [draft, setDraft] = useState(preferences.actions)

  const change = (next: ModActionConfig[]) => {
    setDraft(next)
    preview({ actions: next })
  }

  return {
    draft,
    isFull: draft.length >= MODVIEW_ACTION_LIMITS.maxTotal,
    change,
    patch: (id: string, values: Partial<ModActionConfig>) =>
      change(draft.map((entry) => (entry.id === id ? { ...entry, ...values } : entry))),
    move: (from: string, to: string) => {
      const fromIndex = draft.findIndex((entry) => entry.id === from)
      const toIndex = draft.findIndex((entry) => entry.id === to)
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
      const next = [...draft]
      next.splice(toIndex, 0, next.splice(fromIndex, 1)[0]!)
      change(next)
    },
    // Returns the fresh action so it can open at once
    add: (kind: ModActionKind): ModActionConfig => {
      const fresh = newAction(kind)
      change([...draft, fresh])
      notify({ tone: 'success', title: MODVIEW_ACTION_COPY.noticeAdded })

      return fresh
    },
    remove: (id: string) => {
      change(draft.filter((entry) => entry.id !== id))
      notify({ tone: 'success', title: MODVIEW_ACTION_COPY.noticeRemoved })
    },
    restore: () => {
      change([...MODVIEW_DEFAULT_ACTIONS])
      notify({ tone: 'success', title: MODVIEW_ACTION_COPY.noticeRestored })
    },
    clear: () => {
      change([])
      notify({ tone: 'success', title: MODVIEW_ACTION_COPY.noticeCleared })
    },
  }
}
