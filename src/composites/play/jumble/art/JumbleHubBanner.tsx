import { JumbleCase, JumbleDefs, JumbleSort } from '@/composites/play/jumble/art/jumbleCase'
import { JUMBLE_BANNER } from '@/declarations/play/jumble/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'jumble-hub'
const { stick, sortSize } = JUMBLE_BANNER.frames.banner
const { orders, beat, word } = JUMBLE_BANNER
const STEP = stick.size * 1.08
const DUR = `${beat * orders.length}s`
// Lift height while a sort changes slot
const LIFT = stick.size * 0.9

/**
 * Translate keyframes of one sort: rest, lift, slide, drop, for every beat
 * @param {number} index - Letter index
 * @return {{ values: string; keyTimes: string }} - SMIL values
 */

const sortPath = (index: number) => {
  const values: string[] = []
  const times: number[] = []
  orders.forEach((order, beatIndex) => {
    const from = STEP * (order[index] + 0.5)
    const to = STEP * (orders[(beatIndex + 1) % orders.length][index] + 0.5)
    const start = beatIndex / orders.length
    const span = 1 / orders.length
    const lift = index % 2 ? -LIFT : LIFT
    values.push(`${from} 0`, `${from} 0`, `${from} ${lift}`, `${to} ${lift}`, `${to} 0`)
    times.push(
      start,
      start + span * 0.6,
      start + span * 0.7,
      start + span * 0.88,
      start + span * 0.97
    )
  })
  values.push(values[0])
  times.push(1)

  return { values: values.join(';'), keyTimes: times.map((time) => time.toFixed(4)).join(';') }
}

/**
 * Hub ground of Jumble: a printer's case, lead sorts hopping over each other until the word is set
 * @return {JSX.Element}
 */

export const JumbleHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <defs>
      <JumbleDefs id={ID} />
    </defs>
    <JumbleCase id={ID} width={1600} height={900} sortSize={sortSize} />
    <rect width="1600" height="900" fill="black" opacity="0.28" />

    {/* Composing stick holding the word */}
    <g transform={`translate(${stick.x} ${stick.y})`}>
      <rect
        x={-STEP * 0.3}
        y={-stick.size * 0.8}
        width={STEP * 6.6}
        height={stick.size * 1.7}
        rx="10"
        style={{ fill: 'var(--jumble-metal-deep)' }}
      />
      <rect
        x={-STEP * 0.3}
        y={stick.size * 0.62}
        width={STEP * 6.6}
        height={stick.size * 0.28}
        rx="6"
        style={{ fill: 'var(--jumble-metal)' }}
      />
      {word.split('').map((letter, index) => {
        const { values, keyTimes } = sortPath(index)

        return (
          <g key={letter}>
            <animateTransform
              attributeName="transform"
              type="translate"
              dur={DUR}
              repeatCount="indefinite"
              values={values}
              keyTimes={keyTimes}
            />
            <JumbleSort id={ID} letter={letter} size={stick.size} />
          </g>
        )
      })}
    </g>
  </svg>
)
