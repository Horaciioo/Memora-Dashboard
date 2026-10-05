import type { ReactNode } from 'react'

// GlyphProps
export interface GlyphProps {
  className?: string
}

/**
 * Wraps a stroke drawing in a 24 square
 * @param {Object} props - Sizing class
 * @return {JSX.Element}
 */

const Stroke = ({
  className,
  width = 2,
  children,
}: GlyphProps & { width?: number; children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
)

/**
 * Chevron of the disclosure rows
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const TrailChevron = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.6}>
    <path d="M8 10l4 4 4-4" />
  </Stroke>
)

/**
 * Bolt of the view toggle
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const FlashGlyph = ({ className }: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13 2 5.5 13.5H11L9.5 22l8.5-12.5H13z" />
  </svg>
)

/**
 * Next
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const NextGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M9 5l7 7-7 7" />
  </Stroke>
)

/**
 * Back
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const BackGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Stroke>
)

/**
 * Forward
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const ForwardGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Stroke>
)

/**
 * More
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const MoreGlyph = ({ className }: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="12" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="18" cy="12" r="1.7" />
  </svg>
)

/**
 * Menu
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const MenuGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Stroke>
)

/**
 * Sort
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const SortGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M7 4v16M4 7l3-3 3 3" />
    <path d="M17 20V4M14 17l3 3 3-3" />
  </Stroke>
)

/**
 * Drag
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const DragGlyph = ({ className }: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
)

/**
 * Add
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const AddGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2.2}>
    <path d="M12 5v14M5 12h14" />
  </Stroke>
)

/**
 * Close
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const CloseGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2.2}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Stroke>
)

/**
 * Confirm
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const ConfirmGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2.4}>
    <path d="M5 12.5 9.5 17 19 7" />
  </Stroke>
)

/**
 * Inherit
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const InheritGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2.2}>
    <path d="M5 12h14" />
  </Stroke>
)

/**
 * Division
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const DivisionGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <path d="M6 5l6 7-6 7M13 5l6 7-6 7" />
  </Stroke>
)

/**
 * Checkbox
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const CheckboxGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <rect x="5" y="5" width="14" height="14" rx="3" />
  </Stroke>
)

/**
 * Info
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const InfoGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.5" strokeWidth={2} />
    <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
  </Stroke>
)

/**
 * Warning
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const WarningGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <path d="M12 3.5 21.5 20h-19z" />
    <path d="M12 9.5v5" strokeWidth={2} />
    <circle cx="12" cy="17.3" r="1" fill="currentColor" stroke="none" />
  </Stroke>
)

/**
 * Danger
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const DangerGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5" strokeWidth={2} />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </Stroke>
)

/**
 * Success
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const SuccessGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.3 2.6 2.6L16.3 9" strokeWidth={2} />
  </Stroke>
)

/**
 * Failure
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const FailureGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 9 6 6M15 9l-6 6" strokeWidth={2} />
  </Stroke>
)

/**
 * Pending
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const PendingGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2.2}>
    <path d="M12 3a9 9 0 1 1-6.4 2.6" />
  </Stroke>
)

/**
 * Bold
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const BoldGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M7 4h6a3.5 3.5 0 0 1 0 7H7zM7 11h7a3.7 3.7 0 0 1 0 7H7z" />
  </Stroke>
)

/**
 * Italic
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const ItalicGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M11 4h6M7 20h6M14 4 10 20" />
  </Stroke>
)

/**
 * Underline
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const UnderlineGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M6 4v7a6 6 0 0 0 12 0V4M4 20h16" />
  </Stroke>
)

/**
 * Strike
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const StrikeGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M6 12h12M8 7c0-1.7 1.8-3 4-3s4 1.3 4 2.6M8 17c0 1.7 1.8 3 4 3s4-1.3 4-2.9" />
  </Stroke>
)

/**
 * Heading
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const HeadingGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M6 4v16M18 4v16M6 12h12" />
  </Stroke>
)

/**
 * Quote
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const QuoteGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <path d="M7 8c-1.5 0-2.5 1.2-2.5 3s1 2.8 2.2 2.8c-.2 2-1.4 3.4-3 4.2" />
    <path d="M15 8c-1.5 0-2.5 1.2-2.5 3s1 2.8 2.2 2.8c-.2 2-1.4 3.4-3 4.2" />
  </Stroke>
)

/**
 * Bullet list
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const BulletListGlyph = ({ className }: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="5" cy="6" r="1.4" fill="currentColor" />
    <circle cx="5" cy="12" r="1.4" fill="currentColor" />
    <circle cx="5" cy="18" r="1.4" fill="currentColor" />
    <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/**
 * Ordered list
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const OrderedListGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <path d="M9 6h11M9 12h11M9 18h11M3.5 5.5h2M3.5 11.5h2M3.5 17.5h2" />
  </Stroke>
)

/**
 * Code
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const CodeGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
  </Stroke>
)

/**
 * Code block
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const CodeBlockGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={1.8}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="m10 9-2.5 3L10 15M14 9l2.5 3L14 15" strokeWidth={1.6} />
  </Stroke>
)

/**
 * Link
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const LinkGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4.3l2-2a4.5 4.5 0 0 0-6.4-6.4l-1.3 1.2" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4-.3l-2 2a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2" />
  </Stroke>
)

/**
 * Filter
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const FilterGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M4 6h16M7.5 12h9M11 18h2" />
  </Stroke>
)

/**
 * Shield outline
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const ShieldOutlineGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <path d="M12 3 19 6v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6Z" />
  </Stroke>
)

/**
 * Flame
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const FlameGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <path d="M12 21c-4 0-7-2.7-7-6.3 0-3 1.7-5.2 2.8-7.4.4 1.7 1.2 2.8 2.2 3.3-.4-2.6.6-5.1 3-7.1-.1 2.1.9 3.7 2.4 5.2 1.8 1.8 3.6 3.7 3.6 6 0 3.6-3 6.3-7 6.3Z" />
  </Stroke>
)

/**
 * Crown
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const CrownGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={2}>
    <path d="M5 18h14" />
    <path d="M5 18 4 9l4.5 3.5L12 6l3.5 6.5L20 9l-1 9Z" />
  </Stroke>
)

/**
 * Figure going up
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const ClimbGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M5 18 9 11 12 13.5 18 6" />
    <path d="M12 6h6v6" />
  </Stroke>
)

/**
 * Figure going down
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const DropGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M5 6 9 13 12 10.5 18 18" />
    <path d="M18 12v6h-6" />
  </Stroke>
)

/**
 * Plain text block
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const ParagraphGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M5 7h14M5 12h14M5 17h9" />
  </Stroke>
)

/**
 * Horizontal rule
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const RuleGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className}>
    <path d="M4 12h16" />
    <path d="M8 7h8M8 17h8" strokeOpacity="0.4" />
  </Stroke>
)

/**
 * Bullet
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const BulletGlyph = ({ className }: GlyphProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8" />
  </svg>
)

/**
 * Hollow bullet
 * @param {GlyphProps} props - Sizing and colour class
 * @return {JSX.Element}
 */

export const BulletRingGlyph = ({ className }: GlyphProps) => (
  <Stroke className={className} width={3}>
    <circle cx="12" cy="12" r="7" />
  </Stroke>
)
