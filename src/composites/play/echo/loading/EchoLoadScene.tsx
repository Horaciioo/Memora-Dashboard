import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayGames } from '@/utils/constants/play'

/**
 * Echo loading scene, stars appearing and fading
 * @return {JSX.Element}
 */

export const EchoLoadScene = () => (
  <PlayGameLogo game={PlayGames.Echo} className="size-32 sm:size-40" />
)
