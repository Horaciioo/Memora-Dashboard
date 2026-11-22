import { GlitchDefs, GlitchFound, GlitchScene } from '@/composites/play/glitch/art/glitchTube'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { GLITCH_BANNER } from '@/declarations/play/glitch/banner'

/**
 * Game card of Glitch, the twin scenes on a still tube
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const GlitchCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const { width, height } = GAME_ART_FRAMES[frame]
  const id = `glitch-${frame}`
  const [first, second] = GLITCH_BANNER.frames[frame].scenes

  return (
    <>
      <defs>
        <GlitchDefs id={id} />
      </defs>
      <rect width={width} height={height} fill={`url(#${id}-bloom)`} />
      <g
        transform={`translate(${first.x - 3} ${first.y}) scale(${first.scale})`}
        filter={`url(#${id}-red)`}
        opacity="0.5"
      >
        <GlitchScene />
      </g>
      <g transform={`translate(${first.x} ${first.y}) scale(${first.scale})`}>
        <GlitchScene />
      </g>
      <g transform={`translate(${second.x} ${second.y}) scale(${second.scale})`}>
        <GlitchScene isTwin />
        <GlitchFound />
      </g>
      <rect width={width} height={height} fill={`url(#${id}-scan)`} />
      <rect width={width} height={height} fill={`url(#${id}-vignette)`} />
    </>
  )
}
