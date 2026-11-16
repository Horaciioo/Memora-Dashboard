'use client'

import type { ReactNode } from 'react'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PlayHudKeys } from '@/composites/play/hud/PlayHudKeys'
import { PlayHudPanel } from '@/composites/play/hud/PlayHudPanel'
import type { PlayHudRow } from '@/composites/play/hud/PlayHudPanel'
import { usePlayPref, usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { usePlayScoreStore } from '@/core/store/play/playScore'
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
  // Players strip on top, off when the table already shows them
  hasStrip?: boolean
  // Clock alone on top and no score card, the game folds the rest away
  isCompact?: boolean
  // Wider info card when the game has room for it
  isWide?: boolean
  // Block on the left, level with the table
  lead?: ReactNode
  // Extra blocks over the table
  children?: ReactNode
}

/**
 * Screen HUD: players, info card, keys and score card, skinned by the game
 * @param {PlayHudProps} props - Game and figures
 * @return {JSX.Element}
 */

export const PlayHud = ({
  game,
  sessionId,
  isSeated,
  blocks,
  rows,
  hasStrip = true,
  isCompact = false,
  isWide = false,
  lead,
  children,
}: PlayHudProps) => {
  const isHidden = usePlayPrefsStore((state) => state.isHudHidden)
  const hasClock = usePlayPref(game, 'clock')
  // Score card hidden by default, the trophy key beside the settings opens it
  const isScoreOpen = usePlayScoreStore((state) => state.isOpen)

  // Only the keys stay, to bring the HUD back
  if (isHidden) {
    return (
      <div className={PLAY_HUD.root} data-hud={game.toLowerCase()}>
        <div className={PLAY_HUD.top}>
          <PlayHudKeys game={game} sessionId={sessionId} isSeated={isSeated} />
        </div>
      </div>
    )
  }

  const shown = blocks.filter((block) => hasClock || block.key !== 'clock')

  return (
    <div className={PLAY_HUD.root} data-hud={game.toLowerCase()}>
      <div className={PLAY_HUD.top}>
        {hasStrip && (
          <ul className={PLAY_HUD.strip}>
            {rows.map((row) => (
              <li
                key={row.accountId}
                className={cn(PLAY_HUD.player, row.isGone && PLAY_HUD.playerGone)}
                title={row.name}
              >
                <span className={PLAY_HUD.playerFace}>
                  <PlayAvatar
                    accountId={row.accountId}
                    name={row.name}
                    src={row.avatarUrl}
                    size="sm"
                  />
                </span>
                <span className={PLAY_HUD.playerValue}>{row.value}</span>
              </li>
            ))}
          </ul>
        )}
        {shown.length > 0 && (
          <div
            className={
              isCompact
                ? PLAY_HUD.cardSlim
                : hasStrip
                  ? PLAY_HUD.card
                  : isWide
                    ? PLAY_HUD.cardWide
                    : PLAY_HUD.cardAlone
            }
          >
            {shown.map((block, index) => (
              <div key={block.key} className="contents">
                {index > 0 && <span className={PLAY_HUD.divider} aria-hidden="true" />}
                <div className={PLAY_HUD.block}>
                  <span className={PLAY_HUD.caption}>{block.caption}</span>
                  <span className={PLAY_HUD.figure}>{block.figure}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <PlayHudKeys game={game} sessionId={sessionId} isSeated={isSeated} />
      </div>
      {lead && <div className={PLAY_HUD.lead}>{lead}</div>}
      {!isCompact && isScoreOpen && (
        <div className={PLAY_HUD.corner}>
          <PlayHudPanel rows={rows} />
        </div>
      )}
      {children}
    </div>
  )
}
