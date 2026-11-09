import { actionIntent, actionLabel } from '@/core/lib/modview/actions'
import type { ActionTarget } from '@/core/lib/modview/actions'
import { MODVIEW_ACTION_ICONS } from '@/declarations/modview/actions'
import type { MenuItem } from '@/managers/front-end'
import type { GateCheck } from '@/composites/modview/types'
import type { ModActionConfig } from '@/types/modview'

/**
 * Menu entries of some actions, the same list as the buttons
 * @param {ModActionConfig[]} actions - Actions to list
 * @param {ActionTarget} target - Viewer and line
 * @param {GateCheck} gate - Permission check
 * @param {(action: ModActionConfig) => void} run - Action runner
 * @return {MenuItem[]} - Entries
 */

export const actionMenuItems = (
  actions: ModActionConfig[],
  target: ActionTarget,
  gate: GateCheck,
  run: (action: ModActionConfig) => void
): MenuItem[] =>
  actions.map((action) => {
    const intent = actionIntent(action, target)
    const icon = action.icon as keyof typeof MODVIEW_ACTION_ICONS

    return {
      id: action.id,
      label: actionLabel(action),
      icon,
      disabled: !intent || !gate(intent).allowed,
      onSelect: () => run(action),
    }
  })
