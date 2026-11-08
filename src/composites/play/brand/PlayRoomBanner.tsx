import { PLAY_SCENE_BANNER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Illustrated backdrop of the room, one picture per screen
 * @return {JSX.Element} - Background banner
 */

export const PlayRoomBanner = () => (
  <div className={PLAY_SCENE_BANNER.root} aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/play/banners/mobile.svg" alt="" className={cn(PLAY_SCENE_BANNER.art, 'md:hidden')} />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/play/banners/desktop.svg"
      alt=""
      className={cn(PLAY_SCENE_BANNER.art, 'hidden md:block')}
    />
  </div>
)
