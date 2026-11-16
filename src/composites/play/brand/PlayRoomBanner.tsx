import { PLAY_SCENE_BANNER } from '@/declarations/ui/variants'

/**
 * Plain gradient backdrop of the room
 * @return {JSX.Element} - Background banner
 */

export const PlayRoomBanner = () => (
  <div className={PLAY_SCENE_BANNER.root} aria-hidden="true">
    <div className={PLAY_SCENE_BANNER.art} />
  </div>
)
