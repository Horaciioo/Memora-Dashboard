// Gradient stops by shade, light to dark
const SHADES = {
  old: ['--laurel-b', '--laurel-c'],
  mid: ['--laurel-a', '--laurel-b'],
  new: ['--laurel-hi', '--laurel-a'],
} as const

export interface LaurelDefsProps {
  id: string
}

/**
 * Gradient of a leaf shade
 * @param {string} id - Frame id
 * @param {keyof typeof SHADES} shade - Leaf shade
 * @return {string} - Paint url
 */

export const shadeUrl = (id: string, shade: keyof typeof SHADES): string => `url(#${id}-${shade})`

/**
 * Laurel gradients
 * @param {LaurelDefsProps} props - Frame id
 * @return {JSX.Element}
 */

export const LaurelDefs = ({ id }: LaurelDefsProps) => (
  <defs>
    {(Object.keys(SHADES) as (keyof typeof SHADES)[]).map((shade) => (
      <linearGradient key={shade} id={`${id}-${shade}`} x1="0" y1="0" x2="0.25" y2="1">
        <stop offset="0" style={{ stopColor: `var(${SHADES[shade][0]})` }} />
        <stop offset="1" style={{ stopColor: `var(${SHADES[shade][1]})` }} />
      </linearGradient>
    ))}
    <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" style={{ stopColor: 'var(--laurel-band)', stopOpacity: 0 }} />
      <stop offset="0.5" style={{ stopColor: 'var(--laurel-band)', stopOpacity: 0.95 }} />
      <stop offset="1" style={{ stopColor: 'var(--laurel-band)', stopOpacity: 0 }} />
    </linearGradient>
    <radialGradient id={`${id}-aura`}>
      <stop offset="0.5" style={{ stopColor: 'var(--laurel-gem)', stopOpacity: 0 }} />
      <stop offset="0.62" style={{ stopColor: 'var(--laurel-gem)', stopOpacity: 0.75 }} />
      <stop offset="1" style={{ stopColor: 'var(--laurel-gem)', stopOpacity: 0 }} />
    </radialGradient>
  </defs>
)
