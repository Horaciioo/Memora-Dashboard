import type { FC } from 'react'

export interface EmptyStateIllustrationProps {
  className?: string
}

/**
 * Open, empty box — default illustration for the "start" variant
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const EmptyBoxIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse
      cx="24"
      cy="18"
      rx="14"
      ry="4"
      fill="none"
      stroke="var(--color-brand-600)"
      strokeWidth="1.6"
    />
    <path
      d="M10 18 34 18 30.5 40 13.5 40Z"
      fill="none"
      stroke="var(--color-brand-600)"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M17 27h10"
      stroke="var(--color-border)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
    <circle cx="36" cy="36" r="8" fill="var(--color-brand-600)" />
    <path d="M36 32.5v7M32.5 36h7" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

/**
 * Magnifying glass over an empty line — default illustration for the "filter" variant
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const NoResultsIllustration: FC<EmptyStateIllustrationProps> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    className={className}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="20" cy="20" r="13" fill="none" stroke="var(--color-brand-600)" strokeWidth="1.6" />
    <path
      d="M29.5 29.5 41 41"
      stroke="var(--color-brand-600)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15 20h10"
      stroke="var(--color-border)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeDasharray="1 4"
    />
  </svg>
)
