'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ICONS } from '@/declarations/ui/icons'
import { TOGGLE_STYLES } from '@/declarations/ui/variants'
import { TASK_COPY } from '@/declarations/work/copy'
import { cn } from '@/utils/classnames'

export interface TaskCheckProps {
  id: string
  isDone: boolean
  // Member may tick it
  enabled: boolean
}

/**
 * Check standing in for the emoji of a task, ticked once it is done
 * @param {string} id - Task identifier
 * @param {boolean} isDone - Stored outcome
 * @param {boolean} enabled - Member may tick it
 * @return {JSX.Element}
 */

export const TaskCheck = ({ id, isDone, enabled }: TaskCheckProps) => {
  const router = useRouter()
  const { run, isSaving } = useMutation()
  const [picked, setPicked] = useState<boolean | null>(null)
  const done = picked ?? isDone
  const CheckIcon = ICONS.picked

  const toggle = async () => {
    const next = !done
    setPicked(next)
    const saved = await run(() => apiPatch(API_ROUTES.taskDone(id), { done: next }))
    setPicked(null)
    if (saved) router.refresh()
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? TASK_COPY.markUndone : TASK_COPY.markDone}
      disabled={!enabled || isSaving}
      onClick={(event) => {
        event.stopPropagation()
        void toggle()
      }}
      className={cn(
        TOGGLE_STYLES.checkbox,
        'mr-2 inline-flex align-middle disabled:cursor-default',
        // Ticked, only the check is left
        done
          ? 'border-transparent bg-transparent text-[var(--color-success)]'
          : TOGGLE_STYLES.checkboxOff
      )}
    >
      {done && <CheckIcon className="h-4 w-4" aria-hidden="true" />}
    </button>
  )
}
