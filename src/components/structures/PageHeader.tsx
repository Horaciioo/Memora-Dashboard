import type { ReactNode } from 'react'
import { PageBanner } from '@/components/structures/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageHeaderProps {
  // Line sitting above the title
  eyebrow?: string
  title: string
  // Carried under the title divider inside the notch
  note?: ReactNode
  actions?: ReactNode
}

/**
 * Top of a route
 * @param {string} [eyebrow] - Line rendered above the title
 * @param {string} title - Page title
 * @param {ReactNode} [note] - Line under the title divider
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const PageHeader = ({ eyebrow, title, note, actions }: PageHeaderProps) => (
  <header className={PAGE_STYLES.header}>
    <BreadcrumbLabel label={title} />
    <PageBanner title={title} hasNote={Boolean(note)}>
      {note && <div className={PAGE_STYLES.notchNote}>{note}</div>}
    </PageBanner>
    {(eyebrow || actions) && (
      <div className={PAGE_STYLES.headerRow}>
        {eyebrow ? <p className={PAGE_STYLES.eyebrow}>{eyebrow}</p> : <span />}
        {actions && <div className={PAGE_STYLES.toolbar}>{actions}</div>}
      </div>
    )}
  </header>
)
