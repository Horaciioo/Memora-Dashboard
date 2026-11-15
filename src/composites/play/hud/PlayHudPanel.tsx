'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { PLAY_HUD_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
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
 * Score card, foldable
 * @param {Object} props - Panel
 * @param {PlayHudRow[]} props.rows - Players, best first
 * @return {JSX.Element}
 */

export const PlayHudPanel = ({ rows }: { rows: PlayHudRow[] }) => {
  const [isOpen, setOpen] = useState(true)
  const ChevronIcon = ICONS.expand

  return (
    <aside className={PLAY_HUD.panel} aria-label={PLAY_HUD_COPY.scorecard}>
      <div className={cn(PLAY_HUD.fold, isOpen && PLAY_HUD.foldOpen)} inert={!isOpen}>
        <div className={PLAY_HUD.foldClip}>
          <ol className={PLAY_HUD.rows}>
            {rows.map((row, index) => (
              <li
                key={row.accountId}
                className={cn(
                  PLAY_HUD.row,
                  row.isMine && PLAY_HUD.rowMe,
                  row.isGone && 'opacity-50'
                )}
              >
                <span className={PLAY_HUD.rowRank}>{index + 1}</span>
                <Avatar name={row.name} src={row.avatarUrl} size="xs" />
                <span className={PLAY_HUD.rowName}>{row.name}</span>
                <span className={PLAY_HUD.rowValue}>{row.value}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className={PLAY_HUD.head}>
        <h2 className={PLAY_HUD.title}>{PLAY_HUD_COPY.scorecard}</h2>
        <button
          type="button"
          className={PLAY_HUD.key}
          aria-label={isOpen ? PLAY_HUD_COPY.collapse : PLAY_HUD_COPY.expand}
          aria-expanded={isOpen}
          onClick={() => setOpen(!isOpen)}
        >
          <ChevronIcon
            className={cn(PLAY_HUD.keyIcon, !isOpen && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </div>
    </aside>
  )
}
