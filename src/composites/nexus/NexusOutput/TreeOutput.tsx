'use client'

import { useState } from 'react'

import { Cell } from '@/composites/nexus/NexusOutput/Cell'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { ICONS } from '@/declarations/ui/icons'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Branch that opens and closes
const Branch = ({ label, value }: { label: string; value: object }) => {
  const [isOpen, setOpen] = useState(true)
  const entries = Object.entries(value)

  return (
    <div>
      <button
        type="button"
        className={NEXUS_STYLES.treeToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? NEXUS_TERMINAL_COPY.collapse : NEXUS_TERMINAL_COPY.expand}
        onClick={() => setOpen(!isOpen)}
      >
        <ICONS.expand className={cn('size-3', isOpen ? 'rotate-180' : '-rotate-90')} aria-hidden="true" />
        {label}
      </button>
      {isOpen && (
        <div className={NEXUS_STYLES.treeChildren}>
          {entries.map(([key, entry]) => (
            <Node key={key} label={key} value={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

// Leaf or branch
const Node = ({ label, value }: { label: string; value: unknown }) =>
  value && typeof value === 'object' ? (
    <Branch label={label} value={value} />
  ) : (
    <p>
      <span className={NEXUS_STYLES.recordKey}>{label}</span> <Cell value={value} />
    </p>
  )

/**
 * Foldable relations
 * @param {Object} props - Props
 * @param {unknown} props.value - Nested value
 * @return {JSX.Element}
 */

export const TreeOutput = ({ value }: { value: unknown }) => (
  <div className={NEXUS_STYLES.tree}>
    {value && typeof value === 'object' ? (
      Object.entries(value).map(([key, entry]) => <Node key={key} label={key} value={entry} />)
    ) : (
      <Cell value={value} />
    )}
  </div>
)
