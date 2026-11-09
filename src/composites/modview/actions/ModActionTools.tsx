'use client'

import { ModActionBar } from '@/composites/modview/actions/ModActionBar'
import { useActionRunner } from '@/composites/modview/actions/useActionRunner'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import type { ActionTarget } from '@/core/lib/modview/actions'

export interface ModActionToolsProps {
  target: ActionTarget
  name: string
  gate: GateCheck
  onAct: ActRunner
}

/**
 * Custom buttons wired to the runner
 * @param {ModActionToolsProps} props - Target and runner
 * @return {JSX.Element}
 */

export const ModActionTools = ({ target, name, gate, onAct }: ModActionToolsProps) => {
  const { preferences } = useModPreferences()
  const { run, dialog } = useActionRunner(onAct, preferences.confirmHarsh)

  return (
    <>
      <ModActionBar
        actions={preferences.actions}
        target={target}
        gate={gate}
        run={(action) => run(action, target, name)}
      />
      {dialog}
    </>
  )
}
