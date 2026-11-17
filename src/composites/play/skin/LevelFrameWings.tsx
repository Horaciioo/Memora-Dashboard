import { FRAME_GEOMETRY as G } from '@/declarations/play/skinGeometry'
import type { FrameStep } from '@/declarations/play/skins'

const RIBS = [0.3, 0.48, 0.66]

interface FeatherProps {
  length: number
  fill: string
}

/**
 * One feather along +x with barbs and a rib
 * @param {FeatherProps} props - Length and fill
 * @return {JSX.Element}
 */

const Feather = ({ length: L, fill }: FeatherProps) => {
  const w = L * 0.27
  const barbs = RIBS.map((k) => {
    const h = w * (0.95 - Math.abs(k - 0.45) * 0.9)

    return `M${L * k} 0 l${L * 0.13} ${-h * 0.8} M${L * k} 0 l${L * 0.13} ${h * 0.7}`
  }).join(' ')

  return (
    <>
      <path
        d={`M0 0 C${L * 0.25} ${-w} ${L * 0.75} ${-w * 0.9} ${L} 0 C${L * 0.75} ${w * 0.7} ${L * 0.25} ${w} 0 0z`}
        fill={fill}
        stroke="var(--skin-c)"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
      <path
        d={barbs}
        fill="none"
        stroke="var(--skin-c)"
        strokeOpacity={0.45}
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <path
        d={`M${L * 0.08} 0 L${L * 0.9} 0`}
        stroke="var(--skin-hi)"
        strokeOpacity={0.7}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </>
  )
}

/**
 * Wings and crest, right half mirrored for the left
 * @param {{ step: FrameStep, fill: string }} props - Ornaments and metal gradient
 * @return {JSX.Element | null}
 */

export const LevelFrameWings = ({ step, fill }: { step: FrameStep; fill: string }) => {
  const { wing, crest } = step
  const { centre, wingRoot, crestRoot } = G
  const top = 14 + wing * wing * 1.25
  const last = -20 + wing * 14

  if (!wing && !crest) return null

  const half = (
    <>
      {Array.from({ length: wing }, (_, at) => {
        const i = wing - 1 - at
        const k = wing === 1 ? 0 : i / (wing - 1)

        return (
          <g
            key={`w${i}`}
            transform={`translate(${centre + wingRoot.x} ${centre + wingRoot.y}) rotate(${40 - (last + 40) * k})`}
          >
            <Feather length={top * (0.45 + 0.55 * k) + 6} fill={fill} />
          </g>
        )
      })}
      {Array.from({ length: crest }, (_, at) => {
        const i = crest - 1 - at

        return (
          <g
            key={`c${i}`}
            transform={`translate(${centre + crestRoot.x} ${centre + crestRoot.y}) rotate(${-(48 + 26 * i)})`}
          >
            <Feather length={30 - i * 6} fill={fill} />
          </g>
        )
      })}
    </>
  )

  return (
    <>
      <g>{half}</g>
      <g transform={`translate(${G.size} 0) scale(-1 1)`}>{half}</g>
    </>
  )
}
