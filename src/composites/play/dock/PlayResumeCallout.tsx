import AppLink from '@/components/elements/navigation/AppLink'
import { PlayCurrentGame } from '@/composites/play/brand/PlayCurrentGame'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { BUTTON_STYLES, PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Session row of the game the player sits in: logo, line, resume
 * @param {Object} props - Row
 * @param {PlayPresence} props.presence - Current game
 * @return {JSX.Element}
 */

export const PlayResumeCallout = ({ presence }: { presence: PlayPresence }) => (
  <div className={PLAY_DOCK.resume}>
    <PlayGameLogo game={presence.game} className={PLAY_DOCK.resumeLogo} />
    <span className={PLAY_DOCK.resumeText}>
      <PlayCurrentGame game={presence.game} />
    </span>
    <AppLink
      href={ROUTES.playSession(presence.sessionId)}
      className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeSmall)}
    >
      {PLAY_HUB_COPY.resume}
    </AppLink>
  </div>
)
