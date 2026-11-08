import { Avatar } from '@/components/elements/display/Avatar'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_ROOM } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Strip telling a spectator who plays
 * @param {Object} props - Players
 * @param {PlayFace[]} props.players - Seated
 * @return {JSX.Element}
 */

export const PlaySpectatorBar = ({ players }: { players: PlayFace[] }) => (
  <div className={PLAY_ROOM.watch} role="status">
    <span className={PLAY_ROOM.watchLabel}>{PLAY_HUB_COPY.watching}</span>
    <ul className={PLAY_ROOM.watchFaces}>
      {players.map((player) => (
        <li key={player.id} className={cn(player.isAway && PLAY_ROOM.watchAway)}>
          <Avatar name={player.name} src={player.avatarUrl} size="sm" />
        </li>
      ))}
    </ul>
  </div>
)
