'use client'

import type { CSSProperties } from 'react'

import { actionMenuItems } from '@/composites/modview/actions/actionMenu'
import type { GateCheck } from '@/composites/modview/types'
import { actionIntent, actionLabel } from '@/core/lib/modview/actions'
import type { ActionTarget } from '@/core/lib/modview/actions'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { MODVIEW_ACTION_KINDS, MODVIEW_ACTION_LIMITS } from '@/declarations/modview/actions'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_ACTION } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { ModActionConfig } from '@/types/modview'

export interface ModActionBarProps {
  actions: ModActionConfig[]
  target: ActionTarget
  gate: GateCheck
  run: (action: ModActionConfig) => void
  // Buttons stay inert, for the preview
  isStatic?: boolean
}

// Ink of one button: the chosen colour, else the tone of its kind
const styleOf = (action: ModActionConfig): CSSProperties => ({
  color: action.colour ?? MODVIEW_ACTION_KINDS[action.kind].tone,
})

/**
 * The moderator's own buttons, the same everywhere a viewer is sanctioned
 * @param {ModActionBarProps} props - Actions, target and runner
 * @return {JSX.Element | null}
 */

export const ModActionBar = ({ actions, target, gate, run, isStatic }: ModActionBarProps) => {
  const { openMenu } = useMenu()
  const shown = actions.filter((action) => action.isOn)
  const inline = shown.slice(0, MODVIEW_ACTION_LIMITS.maxInline)
  const overflow = shown.slice(MODVIEW_ACTION_LIMITS.maxInline)
  const MoreIcon = ICONS.more

  if (shown.length === 0) return null

  return (
    <span className={MODVIEW_ACTION.bar}>
      {inline.map((action) => {
        const intent = actionIntent(action, target)
        const check = intent ? gate(intent) : null
        const Icon = ICONS[action.icon as IconName]
        const label = actionLabel(action)

        return (
          <button
            key={action.id}
            type="button"
            className={MODVIEW_ACTION.button}
            style={styleOf(action)}
            disabled={isStatic ? false : !check?.allowed}
            tabIndex={isStatic ? -1 : undefined}
            title={check?.reason ?? label}
            aria-label={label}
            onClick={() => !isStatic && run(action)}
          >
            {action.look !== 'label' && <Icon className={MODVIEW_ACTION.icon} aria-hidden="true" />}
            {action.look !== 'icon' && <span>{label}</span>}
          </button>
        )
      })}
      {overflow.length > 0 && (
        <button
          type="button"
          className={MODVIEW_ACTION.button}
          title={MODVIEW_ACTION_COPY.overflow}
          aria-label={MODVIEW_ACTION_COPY.overflow}
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect()
            openMenu(actionMenuItems(overflow, target, gate, run), { x: box.left, y: box.bottom })
          }}
        >
          <MoreIcon className={MODVIEW_ACTION.icon} aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
