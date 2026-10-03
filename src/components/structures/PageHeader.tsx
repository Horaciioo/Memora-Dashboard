import type { ReactNode } from 'react'
import { PageBanner } from '@/components/structures/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageHeaderProps {
  // Line sitting above the title, e.g. the identifier of the record on screen
  eyebrow?: string
  title: string
  actions?: ReactNode
}

/**
 * Top of a route, the only place a page level h1 is written. A banner of the area runs across
 * the top of the page, its bottom edge cut by a notch the title sits in
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
