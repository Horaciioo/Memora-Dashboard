import { EchoGround, EchoLens } from '@/composites/play/echo/art/echoLens'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { ECHO_BANNER } from '@/declarations/play/echo/banner'

/**
 * Game card of Écho, the two lenses reframed
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const EchoCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const id = `echo-${frame}`

  return (
    <>
      <EchoGround id={id} {...GAME_ART_FRAMES[frame]} />
      {ECHO_BANNER.frames[frame].map((lens, index) => (
        <EchoLens key={index} lens={lens} index={index} id={id} />
      ))}
    </>
  )
}
