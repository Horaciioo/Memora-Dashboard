import type { ReactNode } from 'react'
import { PageBanner } from '@/components/structures/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageHeaderProps {
  // Line sitting above the title
  eyebrow?: string
  title: string
  actions?: ReactNode
}

/**
 * Top of a route
 * @param {string} [eyebrow] - Line rendered above the title
 * @param {string} title - Page title
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const PageHeader = ({ eyebrow, title, actions }: PageHeaderProps) => (
  <header className={PAGE_STYLES.header}>
    <BreadcrumbLabel label={title} />
    <PageBanner title={title} />
    {(eyebrow || actions) && (
      <div className={PAGE_STYLES.headerRow}>
        {eyebrow ? <p className={PAGE_STYLES.eyebrow}>{eyebrow}</p> : <span />}
        {actions && <div className={PAGE_STYLES.toolbar}>{actions}</div>}
      </div>
    )}
  </header>
)
