'use client'

import { useMemo } from 'react'

import { NexusTerminal } from '@/composites/nexus/NexusTerminal'
import { FloatingWindow } from '@/components/structures/overlays/FloatingWindow'
import { useNexusConsole } from '@/core/hooks/data/nexus/useNexusConsole'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { NEXUS_WINDOW } from '@/declarations/nexus/window'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import type { NexusPreset, NexusStage } from '@/types/nexus'
import { cn } from '@/utils/classnames'

export interface NexusWindowProps {
  isOpen: boolean
  isFolded: boolean
  preset: NexusPreset
  onFold: () => void
  onClose: () => void
}

// Label and colour of a stage
const STAGES: Record<NexusStage, { label: string; style: string }> = {
  loading: { label: '', style: NEXUS_STYLES.state },
  locked: { label: NEXUS_TERMINAL_COPY.stateLocked, style: NEXUS_STYLES.state },
  read: { label: NEXUS_TERMINAL_COPY.stateRead, style: NEXUS_STYLES.state },
  write: { label: NEXUS_TERMINAL_COPY.stateWrite, style: NEXUS_STYLES.stateWrite },
  danger: { label: NEXUS_TERMINAL_COPY.stateDanger, style: NEXUS_STYLES.stateDanger },
}

/**
 * Console window, loaded on first use
 * @param {NexusWindowProps} props - Window props
 * @return {JSX.Element | null}
 */

const NexusWindow = ({ isOpen, isFolded, preset, onFold, onClose }: NexusWindowProps) => {
  // State survives a close, polling does not
  const nexus = useNexusConsole(isOpen)
  const bounds = useMemo(
    () => ({
      minWidth: NEXUS_WINDOW.minWidth,
      minHeight: NEXUS_WINDOW.minHeight,
      maxWidth: NEXUS_WINDOW.maxWidth,
      maxHeight: NEXUS_WINDOW.maxHeight,
      margin: NEXUS_WINDOW.edgeMargin,
    }),
    []
  )
  const initial = useMemo(
    () => ({
      x: Math.max(NEXUS_WINDOW.edgeMargin, window.innerWidth - NEXUS_WINDOW.defaultWidth - 24),
      y: Math.max(NEXUS_WINDOW.edgeMargin, window.innerHeight - NEXUS_WINDOW.defaultHeight - 24),
      width: NEXUS_WINDOW.defaultWidth,
      height: NEXUS_WINDOW.defaultHeight,
    }),
    []
  )

  if (!isOpen) return null
  const stage = STAGES[nexus.stage]

  return (
    <FloatingWindow
      title={NEXUS_TERMINAL_COPY.title}
      status={<span className={cn(stage.style)}>{stage.label}</span>}
      storageKey="nexus.window"
      initial={initial}
      bounds={bounds}
      isFolded={isFolded}
      foldLabel={isFolded ? NEXUS_TERMINAL_COPY.unfold : NEXUS_TERMINAL_COPY.fold}
      closeLabel={NEXUS_TERMINAL_COPY.close}
      onFold={onFold}
      onClose={onClose}
      onEscape={() => (document.activeElement as HTMLElement | null)?.blur()}
    >
      <NexusTerminal console={nexus} preset={preset} />
    </FloatingWindow>
  )
}

export default NexusWindow
