import type { ReactNode } from 'react'
import { SECTION_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SectionProps {
  // Omitted when the route header already carries the heading
  title?: string
  description?: string
  action?: ReactNode
  // Drops the framed panel and renders children bare
  bare?: boolean
  padded?: boolean
  className?: string
  children: ReactNode
}

/**
 * Titled block, its heading sitting above the frame rather than inside it
 * @param {string} [title] - Heading shown above the frame
 * @param {string} [description] - Supporting line under the heading
 * @param {ReactNode} [action] - Control aligned to the right of the heading
 * @param {boolean} [bare] - Renders children without the framed panel
 * @param {boolean} [padded] - Adds inner padding to the panel
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @param {ReactNode} children - Block content
 * @return {JSX.Element}
 */

export const Section = ({
  title,
  description,
  action,
  bare,
  padded,
  className,
  children,
}: SectionProps) => (
  <section className={cn(SECTION_STYLES.wrapper, className)}>
    {(title || action) && (
      <div className={SECTION_STYLES.header}>
        <div className={SECTION_STYLES.heading}>
          {title && <h2 className={SECTION_STYLES.title}>{title}</h2>}
          {description && <p className={SECTION_STYLES.description}>{description}</p>}
        </div>
        {action && <div className={SECTION_STYLES.actions}>{action}</div>}
      </div>
    )}
    {bare ? (
      children
    ) : (
      <div className={cn(SECTION_STYLES.panel, padded && SECTION_STYLES.panelPadded)}>
        {children}
      </div>
    )}
  </section>
)
