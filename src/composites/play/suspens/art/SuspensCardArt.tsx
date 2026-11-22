import {
  SuspensStage,
  SuspensTube,
  SuspensWall,
  SuspensWord,
} from '@/composites/play/suspens/art/suspensNeon'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { SUSPENS_BANNER } from '@/declarations/play/suspens/banner'

/**
 * Game card of Suspens, the neon gallows half lit
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const SuspensCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const id = `suspens-${frame}`
  const place = SUSPENS_BANNER.frames[frame]

  return (
    <>
      <SuspensWall id={id} {...GAME_ART_FRAMES[frame]} scale={0.5} />
      <SuspensStage place={place.gallows}>
        <SuspensTube d={SUSPENS_BANNER.gallows} token="--suspens-neon" width={10} id={id} />
        {SUSPENS_BANNER.figure.slice(0, 2).map((part) => (
          <SuspensTube key={part} d={part} token="--suspens-neon-red" width={8} id={id} />
        ))}
      </SuspensStage>
      <SuspensWord place={place.word} id={id} />
    </>
  )
}
