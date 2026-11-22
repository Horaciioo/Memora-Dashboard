'use client'

import type { ReactNode } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PLAY_HUD_COPY } from '@/declarations/play'
import { PLAY_HUD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PlayHudRow {
  accountId: string
  name: string
  avatarUrl: string | null
  value: ReactNode
  isMine: boolean
  isGone: boolean
}

/**
 * Score card, always open
 * @param {Object} props - Panel
 * @param {PlayHudRow[]} props.rows - Players, best first
 * @return {JSX.Element}
 */

export const PlayHudPanel = ({ rows }: { rows: PlayHudRow[] }) => (
  <aside className={PLAY_HUD.panel} aria-label={PLAY_HUD_COPY.scorecard}>
    <h2 className={PLAY_HUD.title}>{PLAY_HUD_COPY.scorecard}</h2>
    <ol className={PLAY_HUD.rows}>
      {rows.map((row, index) => (
        <li
          key={row.accountId}
          className={cn(PLAY_HUD.row, row.isMine && PLAY_HUD.rowMe, row.isGone && 'opacity-50')}
        >
          <span className={PLAY_HUD.rowRank}>{index + 1}</span>
          <PlayAvatar accountId={row.accountId} name={row.name} src={row.avatarUrl} size="xs" />
          <span className={PLAY_HUD.rowName}>{row.name}</span>
          <span className={PLAY_HUD.rowValue}>{row.value}</span>
        </li>
      ))}
    </ol>
  </aside>
)
