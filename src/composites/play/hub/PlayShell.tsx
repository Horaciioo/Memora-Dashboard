'use client'

import type { ReactNode } from 'react'

import { PlayDock } from '@/composites/play/dock/PlayDock'
import type { PlayDockProps } from '@/composites/play/dock/PlayDock'

import { PlayReward } from '@/composites/play/hub/PlayReward'
import { usePlayReward } from '@/core/hooks/data/play/usePlayReward'
import { useBareShell } from '@/core/hooks/interaction/layout/useBareShell'
import { PLAY_SHELL } from '@/declarations/ui/variants'

/**
 * Memora Play room, no rail, the base theme
 * @param {Object} props - Room
 * @param {ReactNode} props.children - Play page
 * @param {PlayDockProps} props.dock - Bottom dock data
 * @return {JSX.Element}
 */

export const PlayShell = ({ children, dock }: { children: ReactNode; dock: PlayDockProps }) => {
  useBareShell(true)
  const reward = usePlayReward(dock.profile)

  return (
    <div className={PLAY_SHELL.room}>
      <div className={PLAY_SHELL.floor} aria-hidden="true" />
      <header className={PLAY_SHELL.bar} />
      <div className={PLAY_SHELL.content}>{children}</div>
      <PlayDock {...dock} />
      <PlayReward reward={reward} />
    </div>
  )
}
