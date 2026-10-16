import type { ReactNode } from 'react'
import { SECTION_STYLES } from '@/declarations/ui/variants'

export interface SectionHeaderProps {
  title?: string
  // No longer rendered
  description?: string
  action?: ReactNode
}

/**
 * Section title with an optional right-aligned action
 * @param {string} [title] - Section title
 * @param {ReactNode} [action] - Control rendered on the right
 * @return {JSX.Element}
 */

export const SectionHeader = ({ title, action }: SectionHeaderProps) => (
  <div className={SECTION_STYLES.header}>
    <div className={SECTION_STYLES.heading}>
      {title && <h2 className={SECTION_STYLES.title}>{title}</h2>}
    </div>
    {action && <div className={SECTION_STYLES.actions}>{action}</div>}
  </div>
)
