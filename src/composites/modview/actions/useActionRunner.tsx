'use client'

import { useCallback, useState } from 'react'

import { ReasonDialog } from '@/composites/modview/ReasonDialog'
import type { ActRunner } from '@/composites/modview/types'
import { actionIntent, actionLabel, isHarsh, needsReason } from '@/core/lib/modview/actions'
import type { ActionTarget } from '@/core/lib/modview/actions'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { MODVIEW_COPY, MODVIEW_USER_COPY } from '@/declarations/modview/copy'
import type { ModActionConfig } from '@/types/modview'

// Action waiting for its confirmation or its reason
interface Asked {
  action: ModActionConfig
  target: ActionTarget
  name: string
}

/**
 * Run custom actions, asking first when a reason is missing or the action is harsh
 * @param {ActRunner} onAct - Gesture runner
 * @param {boolean} confirmHarsh - Harsh actions ask first
 * @return {Object} - Runner and the dialog to render
 */

export const useActionRunner = (onAct: ActRunner, confirmHarsh: boolean) => {
  const [asked, setAsked] = useState<Asked | null>(null)

  const run = useCallback(
    (action: ModActionConfig, target: ActionTarget, name: string) => {
      const intent = actionIntent(action, target)
      if (!intent) return
      if (needsReason(action) || (confirmHarsh && isHarsh(action)))
        setAsked({ action, target, name })
      else onAct(intent)
    },
    [onAct, confirmHarsh]
  )

  const dialog = asked && (
    <ReasonDialog
      description={
        asked.action.kind === 'warn'
          ? MODVIEW_COPY.warnLead.replace('{name}', asked.name)
          : MODVIEW_ACTION_COPY.confirmLead
              .replace('{action}', actionLabel(asked.action))
              .replace('{name}', asked.name)
      }
      placeholder={
        asked.action.kind === 'warn'
          ? MODVIEW_COPY.warnPlaceholder
          : MODVIEW_USER_COPY.optionalPlaceholder
      }
      confirmLabel={
        asked.action.kind === 'warn' ? MODVIEW_COPY.warnConfirm : MODVIEW_ACTION_COPY.confirmOk
      }
      isRequired={needsReason(asked.action)}
      onConfirm={(reason) => {
        const intent = actionIntent(
          { ...asked.action, reason: reason || asked.action.reason },
          asked.target
        )
        if (intent) onAct(intent)
      }}
      onClose={() => setAsked(null)}
    />
  )

  return { run, dialog }
}
