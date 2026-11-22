import {
  SuspensStage,
  SuspensTube,
  SuspensWall,
  SuspensWord,
} from '@/composites/play/suspens/art/suspensNeon'
import { SUSPENS_BANNER } from '@/declarations/play/suspens/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'suspens-hub'
const PLACE = SUSPENS_BANNER.frames.banner
const DUR = `${SUSPENS_BANNER.cycle}s`

/**
 * Buzzing switch-on of a tube: stutters, then holds until the show resets
 * @param {number} at - Cycle share where it starts
 * @return {JSX.Element}
 */

const SwitchOn = ({ at }: { at: number }) => {
  const t = (offset: number) => Math.min(0.95, at + offset).toFixed(3)

  return (
    <animate
      attributeName="opacity"
      dur={DUR}
      repeatCount="indefinite"
      calcMode="discrete"
      values="0.06;0.06;1;0.1;0.8;0.2;1;1;0.06"
      keyTimes={`0;${t(0)};${t(0.006)};${t(0.012)};${t(0.016)};${t(0.022)};${t(0.03)};0.95;0.97`}
    />
  )
}

/**
 * Hub ground of Suspens: a cabaret brick wall, the neon gallows buzzing on, the figure lighting limb by limb
 * @return {JSX.Element}
 */

export const SuspensHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <SuspensWall id={ID} width={1600} height={900} />
    <ellipse
      cx={PLACE.gallows.x}
      cy={PLACE.gallows.y - 250}
      rx="520"
      ry="420"
      fill={`url(#${ID}-spill)`}
    />
    <SuspensStage place={PLACE.gallows}>
      <SuspensTube d={SUSPENS_BANNER.gallows} token="--suspens-neon" width={10} id={ID}>
        <SwitchOn at={0.02} />
      </SuspensTube>
      {SUSPENS_BANNER.figure.map((part, index) => (
        <SuspensTube key={part} d={part} token="--suspens-neon-red" width={8} id={ID}>
          <SwitchOn at={0.2 + index * 0.16} />
        </SuspensTube>
      ))}
    </SuspensStage>
    <SuspensWord
      place={PLACE.word}
      id={ID}
      flicker={(index) => <SwitchOn at={0.06 + index * 0.02} />}
    />
  </svg>
)
