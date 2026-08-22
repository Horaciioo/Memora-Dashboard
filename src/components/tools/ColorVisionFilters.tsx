/**
 * Hidden SVG filters consumed by the color vision preference
 * @return {JSX.Element}
 */

export const ColorVisionFilters = () => (
  <svg aria-hidden="true" focusable="false" className="absolute h-0 w-0 overflow-hidden">
    <defs>
      <filter id="protanopia-filter">
        <feColorMatrix
          type="matrix"
          values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"
        />
      </filter>
      <filter id="deuteranopia-filter">
        <feColorMatrix
          type="matrix"
          values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"
        />
      </filter>
      <filter id="tritanopia-filter">
        <feColorMatrix
          type="matrix"
          values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"
        />
      </filter>
    </defs>
  </svg>
)
