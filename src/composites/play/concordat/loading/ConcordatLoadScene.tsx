import { CONCORDAT_LAND } from '@/composites/play/brand/logo/concordatLand'

/**
 * Concordat loading scene: the logo globe spinning on its axis
 * @return {JSX.Element}
 */

export const ConcordatLoadScene = () => (
  <svg viewBox="0 0 64 64" className="h-40 w-40" aria-hidden="true">
    <defs>
      <radialGradient id="concordat-load-sea" cx="0.32" cy="0.28" r="0.9">
        <stop offset="0" style={{ stopColor: 'var(--play-concordat-sea-light)' }} />
        <stop offset="0.5" style={{ stopColor: 'var(--play-concordat-sea)' }} />
        <stop offset="1" style={{ stopColor: 'var(--play-concordat-deep)' }} />
      </radialGradient>
      <radialGradient id="concordat-load-air" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0.8" style={{ stopColor: 'var(--play-concordat-glow)', stopOpacity: 0 }} />
        <stop offset="1" style={{ stopColor: 'var(--play-concordat-glow)', stopOpacity: 0.3 }} />
      </radialGradient>
      <linearGradient id="concordat-load-land" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--play-concordat-land-light)' }} />
        <stop offset="0.55" style={{ stopColor: 'var(--play-concordat-land)' }} />
        <stop offset="1" style={{ stopColor: 'var(--play-concordat-sand)' }} />
      </linearGradient>
      <radialGradient id="concordat-load-shade" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0.4" stopColor="black" stopOpacity="0" />
        <stop offset="1" stopColor="black" stopOpacity="0.55" />
      </radialGradient>
      <clipPath id="concordat-load-clip">
        <circle cx="32" cy="32" r="23" />
      </clipPath>
    </defs>
    <circle cx="32" cy="32" r="26" fill="url(#concordat-load-air)" />
    <circle cx="32" cy="32" r="23" fill="url(#concordat-load-sea)" />
    <g clipPath="url(#concordat-load-clip)">
      <g className="concordat-load-spin">
        {[0, 1].map((copy) => (
          <g key={copy} transform={`translate(${copy * 56} 8) scale(0.8)`}>
            <path d={CONCORDAT_LAND} fill="url(#concordat-load-land)" />
          </g>
        ))}
      </g>
      <circle cx="32" cy="32" r="23" fill="url(#concordat-load-shade)" />
    </g>
    <ellipse
      cx="22"
      cy="18"
      rx="7"
      ry="3.2"
      transform="rotate(-35 22 18)"
      fill="white"
      opacity="0.45"
    />
  </svg>
)
