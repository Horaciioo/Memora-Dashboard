import { useId } from 'react'

import { GRADIENT_STOPS, platformLogoOf } from '@/declarations/platforms/logos'
import { ICONS } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface NetworkLogoProps {
  // Platform as declared in the reference list
  network: string
  className?: string
}

/**
 * Whether a platform has a logo
 * @param {string} network - Declared platform name
 * @return {boolean} - Logo available
 */

export const hasNetworkLogo = (network: string): boolean => platformLogoOf(network) !== null

/**
 * Official logo of a platform, drawn from the platform configuration
 * @param {string} network - Declared platform name
 * @param {string} [className] - Sizing classes
 * @return {JSX.Element | null} - Nothing for an unknown platform
 */

export const NetworkLogo = ({ network, className }: NetworkLogoProps) => {
  const scope = useId()
  const logo = platformLogoOf(network)

  if (!logo) return null

  // Missing mark falls back to its glyph
  if (!logo.path) {
    const Glyph = logo.glyph ? ICONS[logo.glyph] : null

    return Glyph ? <Glyph className={cn('shrink-0', className)} /> : null
  }

  const gradientId = `${scope}-gradient`
  const paint =
    logo.paint === 'gradient'
      ? `url(#${gradientId})`
      : logo.paint === 'ink'
        ? 'var(--color-ink)'
        : logo.paint

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {logo.paint === 'gradient' && (
        <defs>
          <linearGradient
            id={gradientId}
            x1="2"
            y1="22"
            x2="22"
            y2="2"
            gradientUnits="userSpaceOnUse"
          >
            {GRADIENT_STOPS.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.colour} />
            ))}
          </linearGradient>
        </defs>
      )}
      <path d={logo.path} fill={paint} />
    </svg>
  )
}
