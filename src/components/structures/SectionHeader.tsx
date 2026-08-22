import type { ReactNode } from 'react'
import { SECTION_STYLES } from '@/declarations/ui/variants'

export interface SectionHeaderProps {
  title?: string
  description?: string
  action?: ReactNode
}

/**
 * Section title with an optional right-aligned action, used when the frame is drawn elsewhere
 * @param {string} [title] - Section title
 * @param {string} [description] - Supporting line under the title
 * @param {ReactNode} [action] - Control rendered on the right, e.g. a button
 * @return {JSX.Element}
 */

export const SectionHeader = ({ title, description, action }: SectionHeaderProps) => (
  <div className={SECTION_STYLES.header}>
    <div className={SECTION_STYLES.heading}>
      {title && <h2 className={SECTION_STYLES.title}>{title}</h2>}
      {description && <p className={SECTION_STYLES.description}>{description}</p>}
    </div>
    {action && <div className={SECTION_STYLES.actions}>{action}</div>}
  </div>
)
