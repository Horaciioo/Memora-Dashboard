import { EchoGround, EchoLens } from '@/composites/play/echo/art/echoLens'
import { EchoRipples } from '@/composites/play/echo/art/EchoRipples'
import { ECHO_BANNER } from '@/declarations/play/echo/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'echo-hub'

/**
 * Hub ground of Écho: two frosted lenses sharing a lit symbol, rings following the pointer
 * @return {JSX.Element}
 */

export const EchoHubBanner = () => (
  <>
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={PLAY_HUB.groundArt}
      aria-hidden="true"
    >
      <EchoGround id={ID} width={1600} height={900} />
      {ECHO_BANNER.frames.banner.map((lens, index) => (
        <EchoLens key={index} lens={lens} index={index} id={ID} />
      ))}
    </svg>
    <EchoRipples />
  </>
)
