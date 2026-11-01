import type { FC } from 'react'

import {
  Scene,
  Sparks,
  type EmptyStateIllustrationProps,
} from '@/components/elements/feedback/EmptyStateIllustration'

// Paper tone drawn over the gradient bodies
const PAPER = 'var(--color-surface-raised)'

// Round stroke of a drawn line
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/**
 * Shield closed on a padlock
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const ShieldLockFigure: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <path d="M100 22 156 42v50c0 38-26 62-56 76-30-14-56-38-56-76V42Z" fill={fill} />
        <path d="M100 22 156 42v50c0 38-26 62-56 76Z" fill={deep} opacity="0.35" />
        <rect x="76" y="84" width="48" height="40" rx="10" fill={PAPER} />
        <path d="M86 84V72a14 14 0 0 1 28 0v12" stroke={PAPER} strokeWidth="8" {...LINE} />
        <circle cx="100" cy="102" r="5" fill={deep} />
        <Sparks
          paint={lift}
          items={[
            { x: 28, y: 70, size: 8 },
            { x: 176, y: 140, size: 6 },
          ]}
        />
      </>
    )}
  />
)

/**
 * Laptop and phone side by side
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const DevicesFigure: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <rect x="26" y="50" width="108" height="74" rx="12" fill={fill} />
        <rect x="34" y="58" width="92" height="58" rx="7" fill={PAPER} />
        <rect x="16" y="124" width="128" height="12" rx="6" fill={deep} />
        <rect x="116" y="78" width="52" height="88" rx="12" fill={deep} stroke="none" />
        <rect x="123" y="88" width="38" height="64" rx="6" fill={PAPER} />
        <circle cx="142" cy="159" r="3" fill={lift} />
        <path d="M44 88h52M44 100h34" stroke={lift} strokeWidth="6" {...LINE} />
      </>
    )}
  />
)

/**
 * Safe with its dial
 * @param {string} [className] - Classes merged onto the svg
 * @return {JSX.Element}
 */

export const VaultFigure: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <Scene
    className={className}
    render={({ fill, lift, deep }) => (
      <>
        <rect x="36" y="38" width="128" height="120" rx="22" fill={fill} />
        <circle cx="100" cy="98" r="36" fill={PAPER} />
        <circle cx="100" cy="98" r="22" fill={deep} />
        <path d="M100 82v32M84 98h32" stroke={PAPER} strokeWidth="5" {...LINE} />
        <rect x="52" y="158" width="14" height="12" rx="4" fill={deep} />
        <rect x="134" y="158" width="14" height="12" rx="4" fill={deep} />
        <Sparks
          paint={lift}
          items={[
            { x: 22, y: 60, size: 7 },
            { x: 180, y: 52, size: 8 },
          ]}
        />
      </>
    )}
  />
)
