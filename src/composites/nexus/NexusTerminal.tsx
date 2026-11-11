'use client'

import { useEffect, useRef } from 'react'

import { NexusBlockView } from '@/composites/nexus/NexusBlockView'
import { NexusPrompt } from '@/composites/nexus/NexusPrompt'
import type { useNexusConsole } from '@/core/hooks/data/nexus/useNexusConsole'
import type { NexusPreset } from '@/types/nexus'
import { NEXUS_STYLES } from '@/declarations/ui/variants'

export interface NexusTerminalProps {
  console: ReturnType<typeof useNexusConsole>
  preset: NexusPreset
}

/**
 * Scrollback and prompt
 * @param {NexusTerminalProps} props - Terminal props
 * @return {JSX.Element}
 */

export const NexusTerminal = ({ console: nexus, preset }: NexusTerminalProps) => {
  const end = useRef<HTMLDivElement>(null)

  // Follow the newest block
  useEffect(() => end.current?.scrollIntoView({ block: 'end' }), [nexus.blocks.length])

  return (
    <>
      <div className={NEXUS_STYLES.scroll} aria-live="polite">
        {nexus.blocks.map((block) => (
          <NexusBlockView
            key={block.id}
            block={block}
            needsRetype={block.reply?.confirmKind === 'double'}
            onConfirm={nexus.confirm}
            onCancel={nexus.cancel}
          />
        ))}
        <div ref={end} />
      </div>
      <NexusPrompt
        mode={nexus.mode}
        isBusy={nexus.isBusy}
        history={nexus.history}
        registry={nexus.registry}
        key={preset.id}
        preset={preset.text}
        onSubmit={nexus.submit}
        onClear={() => nexus.forget()}
      />
    </>
  )
}
