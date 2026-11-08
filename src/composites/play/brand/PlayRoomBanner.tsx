import { PLAY_SCENE_BANNER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

const SCENES = [
  { name: 'mobile', show: 'md:hidden' },
  { name: 'desktop', show: 'hidden md:block' },
] as const

/**
 * Painted backdrop of the room, one plate per screen with two drifting mists
 * @return {JSX.Element} - Background banner
 */

export const PlayRoomBanner = () => (
  <div className={PLAY_SCENE_BANNER.root} aria-hidden="true">
    {SCENES.map(({ name, show }) => (
      <div key={name} className={cn(PLAY_SCENE_BANNER.plate, show)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/play/scene/${name}.webp`} alt="" className={PLAY_SCENE_BANNER.art} />
        <div className={PLAY_SCENE_BANNER.mists}>
          {(['Far', 'Near'] as const).map((depth) => (
            <div
              key={depth}
              className={cn(PLAY_SCENE_BANNER.mist, PLAY_SCENE_BANNER[`mist${depth}`])}
              style={{
                backgroundImage: `url(/play/scene/${name}-fog-${depth.toLowerCase()}.webp)`,
              }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)
