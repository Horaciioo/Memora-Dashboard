'use client'

import { useEffect, useRef, useState } from 'react'

import { MultiSelect } from '@/components/elements/forms/selects/MultiSelect'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { accentPaint } from '@/declarations/ui/theme'
import { DETAIL_BLOCK } from '@/declarations/ui/blocks'
import { OFFENSE_SHEET } from '@/declarations/ui/variants'
import type { SanctionMeasureView } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

export interface RungMeasuresProps {
  measures: SanctionMeasureView[]
  choices: SanctionMeasureView[]
  // Locked read rendering
  disabled?: boolean
  // Opens on mount, for a rung just added
  startOpen?: boolean
  onCommit: (ids: string[]) => Promise<boolean>
  // Panel closed with nothing chosen
  onDismiss?: () => void
}

/**
 * Measures of one step, chips kept in place while their panel opens from the same box
 * @param {RungMeasuresProps} props - Measures, choices and handlers
 * @return {JSX.Element}
 */

export const RungMeasures = ({
  measures,
  choices,
  disabled,
  startOpen,
  onCommit,
  onDismiss,
}: RungMeasuresProps) => {
  const [editing, setEditing] = useState(Boolean(startOpen))
  const [draft, setDraft] = useState<string[]>(measures.map((measure) => measure.id))
  const cellRef = useRef<HTMLSpanElement>(null)

  const options = choices.map((measure) => ({
    value: measure.id,
    label: measure.name,
    accent: measure.accent ?? undefined,
  }))

  // The panel shows its choices straight away
  useEffect(() => {
    if (!editing) return

    cellRef.current?.querySelector('button')?.click()

    const onPress = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (cellRef.current?.contains(target)) return
      if (target?.closest('[role="listbox"], [role="dialog"]')) return

      setEditing(false)
      if (draft.length === 0) onDismiss?.()
    }

    document.addEventListener('pointerdown', onPress)

    return () => document.removeEventListener('pointerdown', onPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, draft])

  const start = () => {
    if (disabled) return
    setDraft(measures.map((measure) => measure.id))
    setEditing(true)
  }

  const change = (next: string[]) => {
    setDraft(next)
    if (next.length > 0) void onCommit(next)
  }

  return (
    <span
      ref={cellRef}
      role={disabled || editing ? undefined : 'button'}
      tabIndex={disabled || editing ? undefined : 0}
      onClick={editing ? undefined : start}
      onKeyDown={(event) => {
        if (!editing && event.key === 'Enter') start()
      }}
      className={cn(
        OFFENSE_SHEET.measures,
        !disabled && DETAIL_BLOCK.editable,
        editing && DETAIL_BLOCK.editing
      )}
    >
      {measures.length === 0 && (
        <span className={OFFENSE_SHEET.placeholder}>{SANCTION_COPY.measures}</span>
      )}
      {measures.map((measure) => (
        <span
          key={measure.id}
          className={cn(OFFENSE_SHEET.measure, accentPaint(measure.accent).soft)}
          style={accentPaint(measure.accent).style}
        >
          {measure.name}
        </span>
      ))}
      {editing && (
        <div className="inline-ghost">
          <MultiSelect
            id={`rung-${measures.map((measure) => measure.id).join('-') || 'new'}`}
            label={SANCTION_COPY.measures}
            emptyLabel={SANCTION_COPY.measures}
            options={options}
            value={draft}
            mark="dot"
            onChange={change}
          />
        </div>
      )}
    </span>
  )
}
