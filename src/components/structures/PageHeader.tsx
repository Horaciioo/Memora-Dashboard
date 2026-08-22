import type { ReactNode } from 'react'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageHeaderProps {
  // Line sitting above the title, e.g. the identifier of the record on screen
  eyebrow?: string
  title: string
  lead?: string
  actions?: ReactNode
}

/**
 * Top of a route, the only place a page level h1 is written
 * @param {string} [eyebrow] - Line rendered above the title
 * @param {string} title - Page title
 * @param {string} [lead] - Supporting line under the title
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const PageHeader = ({ eyebrow, title, lead, actions }: PageHeaderProps) => (
  <header className={PAGE_STYLES.header}>
    <div className="flex flex-col gap-1.5">
      {eyebrow && <p className={PAGE_STYLES.eyebrow}>{eyebrow}</p>}
      <h1 className={PAGE_STYLES.title}>{title}</h1>
      {lead && <p className={PAGE_STYLES.lead}>{lead}</p>}
    </div>
    {actions && <div className={PAGE_STYLES.toolbar}>{actions}</div>}
  </header>
)
