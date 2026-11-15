import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayGames } from '@/utils/constants/play'

/**
 * Glitch loading scene, its logo
 * @return {JSX.Element}
 */

export const GlitchLoadScene = () => (
  <PlayGameLogo game={PlayGames.Glitch} className="size-32 sm:size-40" />
)
