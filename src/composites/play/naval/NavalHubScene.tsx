import { NAVAL_HUB } from '@/declarations/ui/variants/naval'

// Warship profile, bow to the right, drawn once and reused
const WARSHIP = (
  <g id="naval-warship">
    <path d="M0 40h230l-26 20H28z" />
    <path d="M18 40V30h40v10zM70 40V22h30v18zM108 40V10h14v30zM132 40V24h54v16z" />
    <path d="M150 24V12h22v12zM194 40v-9h22v9z" />
    <rect x="40" y="26" width="30" height="4" />
    <rect x="46" y="22" width="22" height="4" />
    <rect x="114" y="0" width="3" height="12" />
    <rect x="158" y="2" width="3" height="10" />
  </g>
)

// Waves across two screens, repeated so the drift loops
const WAVES =
  'M0 0q50 -16 100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0t100 0v400H0z'

/**
 * Hub ground of the naval battle: a fleet exchanging fire at dusk, smoke and flames on the sea
 * @return {JSX.Element}
 */

export const NavalHubScene = () => (
  <div className={NAVAL_HUB.scene} aria-hidden="true">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="naval-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030b16" />
          <stop offset="0.45" stopColor="#0c2a45" />
          <stop offset="0.72" stopColor="#7a3b34" />
          <stop offset="0.86" stopColor="#f08a3c" />
          <stop offset="1" stopColor="#ffd08a" />
        </linearGradient>
        <linearGradient id="naval-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3a45" />
          <stop offset="0.25" stopColor="#0f3555" />
          <stop offset="1" stopColor="#03111f" />
        </linearGradient>
        <radialGradient id="naval-flame">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.3" stopColor="#ffb02e" />
          <stop offset="0.65" stopColor="#ff5a36" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ff5a36" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="naval-smoke">
          <stop offset="0" stopColor="#1a1c21" stopOpacity="0.95" />
          <stop offset="1" stopColor="#1a1c21" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="naval-beam" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d8ecff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#d8ecff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="naval-veil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020912" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#020912" stopOpacity="0.1" />
          <stop offset="1" stopColor="#020912" stopOpacity="0.7" />
        </linearGradient>
        <filter id="naval-soft">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        {WARSHIP}
      </defs>

      <rect width="1600" height="900" fill="url(#naval-sky)" />

      {/* Clouds of smoke lit from below */}
      <g filter="url(#naval-soft)" opacity="0.8">
        <ellipse cx="300" cy="380" rx="330" ry="60" fill="#2a2630" />
        <ellipse cx="1180" cy="330" rx="420" ry="70" fill="#241f2a" />
        <ellipse cx="760" cy="460" rx="300" ry="40" fill="#5b3434" />
      </g>

      {/* Searchlights sweeping the dusk */}
      <g>
        <path className="naval-beam" d="M260 560L120 60L360 60z" fill="url(#naval-beam)" />
        <path
          className="naval-beam"
          style={{ animationDelay: '-5s' }}
          d="M1350 560L1230 80L1470 80z"
          fill="url(#naval-beam)"
        />
      </g>

      {/* Burning horizon */}
      <ellipse
        cx="800"
        cy="610"
        rx="700"
        ry="60"
        fill="#ff7a2e"
        opacity="0.35"
        filter="url(#naval-soft)"
      />

      {/* Far fleet in the haze */}
      <g fill="#1d2d44" opacity="0.7">
        <use href="#naval-warship" x="140" y="548" transform="scale(0.55)" />
        <use href="#naval-warship" x="1300" y="548" transform="scale(0.5)" />
        <use href="#naval-warship" x="2300" y="552" transform="scale(0.45)" />
      </g>

      {/* Burning wrecks far off */}
      <g>
        <circle className="naval-fire" cx="520" cy="596" r="46" fill="url(#naval-flame)" />
        <circle
          className="naval-fire naval-fire-b"
          cx="1130"
          cy="590"
          r="38"
          fill="url(#naval-flame)"
        />
        <ellipse
          className="naval-plume"
          cx="520"
          cy="560"
          rx="38"
          ry="90"
          fill="url(#naval-smoke)"
        />
        <ellipse
          className="naval-plume naval-plume-b"
          cx="1130"
          cy="552"
          rx="34"
          ry="84"
          fill="url(#naval-smoke)"
        />
      </g>

      {/* Mid water */}
      <rect y="600" width="1600" height="300" fill="url(#naval-water)" />
      <g opacity="0.55">
        <rect
          x="490"
          y="610"
          width="60"
          height="180"
          fill="#ff8a3c"
          filter="url(#naval-soft)"
          className="naval-fire"
        />
        <rect
          x="1100"
          y="610"
          width="60"
          height="160"
          fill="#ff8a3c"
          filter="url(#naval-soft)"
          className="naval-fire naval-fire-b"
        />
      </g>

      {/* The big ships, shelling each other */}
      <g className="naval-bob" fill="#0a1626">
        <use href="#naval-warship" x="170" y="560" transform="scale(1.7)" />
        <circle className="naval-muzzle" cx="470" cy="637" r="22" fill="url(#naval-flame)" />
      </g>
      <g className="naval-bob naval-bob-slow" fill="#08121f">
        <use href="#naval-warship" x="-30" y="470" transform="translate(1280 0) scale(-1.5 1.5)" />
        <circle
          className="naval-muzzle naval-muzzle-b"
          cx="1130"
          cy="602"
          r="20"
          fill="url(#naval-flame)"
        />
      </g>

      {/* Tracers crossing over the water */}
      <g fill="none" stroke="#ffd9a0" strokeWidth="4" strokeLinecap="round">
        <path className="naval-tracer" d="M470 640Q800 320 1120 610" pathLength="900" />
        <path
          className="naval-tracer naval-tracer-b"
          d="M1130 600Q820 300 480 640"
          pathLength="900"
        />
      </g>

      {/* Shell geysers */}
      <g fill="#e8f7ff">
        <path className="naval-hub-geyser" d="M700 700l-18 70h46z" />
        <path className="naval-hub-geyser naval-hub-geyser-b" d="M980 740l-22 80h54z" />
        <path className="naval-hub-geyser naval-hub-geyser-c" d="M300 760l-20 70h50z" />
      </g>

      {/* Swell in three layers */}
      <g className="naval-wave-a" opacity="0.5" fill="#0a2d4a">
        <path transform="translate(0 720)" d={WAVES} />
      </g>
      <g className="naval-wave-b" opacity="0.6" fill="#071f36">
        <path transform="translate(-200 790)" d={WAVES} />
      </g>
      <g className="naval-wave-c" fill="#030f1c">
        <path transform="translate(-400 850)" d={WAVES} />
      </g>

      {/* Veil keeps the buttons readable */}
      <rect width="1600" height="900" fill="url(#naval-veil)" />
    </svg>
  </div>
)
