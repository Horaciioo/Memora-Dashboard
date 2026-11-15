'use client'

import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { PlayHudKeys } from '@/composites/play/hud/PlayHudKeys'
import { PlayHudPanel } from '@/composites/play/hud/PlayHudPanel'
import type { PlayHudRow } from '@/composites/play/hud/PlayHudPanel'
import { PLAY_HUD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayHudBlock {
  key: string
  caption: string
  figure: ReactNode
}

export interface PlayHudProps {
  game: PlayGameName
  sessionId: string
  isSeated: boolean
  // Info card figures, left to right
  blocks: PlayHudBlock[]
  // Players, best first
  rows: PlayHudRow[]
  // Extra blocks over the table
  children?: ReactNode
}

/**
 * Screen HUD: players, info card, keys and score card, skinned by the game
 * @param {PlayHudProps} props - Game and figures
 * @return {JSX.Element}
 */

export const PlayHud = ({ game, sessionId, isSeated, blocks, rows, children }: PlayHudProps) => (
  <div className={PLAY_HUD.root} data-hud={game.toLowerCase()}>
    <div className={PLAY_HUD.top}>
      <ul className={PLAY_HUD.strip}>
        {rows.map((row) => (
          <li
            key={row.accountId}
            className={cn(PLAY_HUD.player, row.isGone && PLAY_HUD.playerGone)}
            title={row.name}
          >
            <span className={PLAY_HUD.playerFace}>
              <Avatar name={row.name} src={row.avatarUrl} size="sm" />
            </span>
            <span className={PLAY_HUD.playerValue}>{row.value}</span>
          </li>
        ))}
      </ul>
      <div className={PLAY_HUD.card}>
        {blocks.map((block, index) => (
          <div key={block.key} className="contents">
            {index > 0 && <span className={PLAY_HUD.divider} aria-hidden="true" />}
            <div className={PLAY_HUD.block}>
              <span className={PLAY_HUD.caption}>{block.caption}</span>
              <span className={PLAY_HUD.figure}>{block.figure}</span>
            </div>
          </div>
        ))}
      </div>
      <PlayHudKeys game={game} sessionId={sessionId} isSeated={isSeated} />
    </div>
    <PlayHudPanel rows={rows} />
    {children}
  </div>
)
