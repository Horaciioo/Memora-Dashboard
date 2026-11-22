import { GlitchDefs, GlitchFound, GlitchScene } from '@/composites/play/glitch/art/glitchTube'
import { GLITCH_BANNER } from '@/declarations/play/glitch/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'glitch-hub'
const DUR = `${GLITCH_BANNER.cycle}s`
const [FIRST, SECOND] = GLITCH_BANNER.frames.banner.scenes
// Jolt moments across one loop, short and uneven
const JOLT_TIMES = '0;0.31;0.32;0.335;0.35;0.62;0.64;1'

/**
 * Tube content, drawn once and reused by every torn band
 * @return {JSX.Element}
 */

const Picture = () => (
  <>
    <rect width="1600" height="900" fill={`url(#${ID}-bloom)`} />
    <g transform={`translate(${FIRST.x} ${FIRST.y}) scale(${FIRST.scale})`}>
      <GlitchScene />
    </g>
    <g transform={`translate(${SECOND.x} ${SECOND.y}) scale(${SECOND.scale})`}>
      <GlitchScene isTwin />
      <GlitchFound />
    </g>
    <text
      x="70"
      y="96"
      fontSize="34"
      fontWeight="800"
      letterSpacing="4"
      style={{ fill: 'var(--glitch-paper)', fontFamily: 'var(--font-mono)' }}
      opacity="0.85"
    >
      {GLITCH_BANNER.timecode}
    </text>
  </>
)

/**
 * Hub ground of Glitch: a VHS tube showing twin scenes, bands tearing sideways and the colours splitting
 * @return {JSX.Element}
 */

export const GlitchHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <defs>
      <GlitchDefs id={ID} />
      <g id={`${ID}-picture`}>
        <Picture />
      </g>
      {GLITCH_BANNER.tears.map((tear) => (
        <clipPath key={tear.y} id={`${ID}-band-${tear.y}`}>
          <rect y={tear.y} width="1600" height={tear.height} />
        </clipPath>
      ))}
    </defs>

    {/* Colour plates slipping off the picture */}
    <use href={`#${ID}-picture`} filter={`url(#${ID}-red)`} opacity="0.45">
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={DUR}
        repeatCount="indefinite"
        calcMode="discrete"
        values="-4 0;-4 0;-14 0;6 0;-4 0;-18 0;-4 0;-4 0"
        keyTimes={JOLT_TIMES}
      />
    </use>
    <use href={`#${ID}-picture`} filter={`url(#${ID}-cyan)`} opacity="0.45">
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={DUR}
        repeatCount="indefinite"
        calcMode="discrete"
        values="4 0;4 0;12 0;-8 0;4 0;16 0;4 0;4 0"
        keyTimes={JOLT_TIMES}
      />
    </use>
    <use href={`#${ID}-picture`} />

    {/* Bands torn sideways by the tape */}
    {GLITCH_BANNER.tears.map((tear) => (
      <g key={tear.y} clipPath={`url(#${ID}-band-${tear.y})`}>
        <rect
          y={tear.y}
          width="1600"
          height={tear.height}
          style={{ fill: 'var(--glitch-screen)' }}
        />
        <use href={`#${ID}-picture`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur={DUR}
            repeatCount="indefinite"
            calcMode="discrete"
            values={tear.jolts.map((jolt) => `${jolt} 0`).join(';')}
            keyTimes={JOLT_TIMES}
          />
        </use>
      </g>
    ))}

    <rect width="1600" height="900" fill={`url(#${ID}-scan)`} />
    <rect width="1600" height="900" fill={`url(#${ID}-vignette)`} />
    {/* Recording light */}
    <circle cx="1520" cy="86" r="12" style={{ fill: 'var(--glitch-red)' }}>
      <animate
        attributeName="opacity"
        dur="1.2s"
        repeatCount="indefinite"
        calcMode="discrete"
        values="1;0.15"
      />
    </circle>
  </svg>
)
