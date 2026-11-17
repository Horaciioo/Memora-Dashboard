'use client'

import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { useMenu } from '@/managers/front-end'
import type { PlayAdminRow } from '@/types/play'
import { cn } from '@/utils/classnames'

export interface PlayAdminCardProps {
  player: PlayAdminRow
  isOnline: boolean
  isChosen: boolean
  // The admin level may choose several players
  canChoose: boolean
  onOpen: () => void
  onChoose: () => void
}

/**
 * Moderator box of the Play admin: portrait, name, level and XP, role or functions
 * @param {PlayAdminCardProps} props - Member, Play figures and gestures
 * @return {JSX.Element}
 */

export const PlayAdminCard = ({
  player,
  isOnline,
  isChosen,
  canChoose,
  onOpen,
  onChoose,
}: PlayAdminCardProps) => {
  const { contextMenu } = useMenu()

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onOpen()
      }}
      onContextMenu={contextMenu([
        { id: 'open', label: ACTION_COPY.open, icon: 'forward', onSelect: onOpen },
        ...(canChoose
          ? [
              {
                id: 'choose',
                label: isChosen ? COPY.unchoose : COPY.choose,
                icon: 'success' as const,
                onSelect: onChoose,
              },
            ]
          : []),
        {
          id: 'copy',
          label: ACTION_COPY.copyId,
          icon: 'copy',
          onSelect: () => void navigator.clipboard.writeText(player.accountId),
        },
      ])}
      className={cn(PLAY_ADMIN.card, isChosen && PLAY_ADMIN.cardChosen)}
    >
      <PlayAvatar accountId={player.accountId} name={player.name} src={player.avatarUrl} />
      <span className={PLAY_ADMIN.cardName}>{player.name}</span>
      {isOnline && <span className={PLAY_ADMIN.online} />}
      {player.isBanned && <span className={PLAY_ADMIN.cardBanned}>{COPY.banned}</span>}
      <span className={PLAY_ADMIN.cardXp}>
        {fillPlayMessage(COPY.levelShort, { level: player.level })}
        {' · '}
        {fillPlayMessage(PLAY_MEMBER_COPY.xp, { xp: player.xp.toLocaleString('fr-FR') })}
      </span>
    </div>
  )
}
