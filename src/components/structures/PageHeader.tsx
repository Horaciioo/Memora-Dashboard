import type { ReactNode } from 'react'
import { PageBanner } from '@/components/structures/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageHeaderProps {
  // Line sitting above the title
  eyebrow?: string
  title: string
  // Two to six words under the title
  heroDescription?: string
  // Picture replacing the area's own
  image?: string | null
  // Small line under the title
  note?: ReactNode
  actions?: ReactNode
}

/**
 * Top of a route
 * @param {string} [eyebrow] - Line rendered above the title
 * @param {string} title - Page title
 * @param {string} [heroDescription] - Faint line under the title
 * @param {string | null} [image] - Picture replacing the area's own
 * @param {ReactNode} [note] - Line under the title
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const PageHeader = ({
  eyebrow,
  title,
  heroDescription,
  image,
  note,
  actions,
}: PageHeaderProps) => (
  <header className={PAGE_STYLES.header}>
    <BreadcrumbLabel label={title} />
    <PageBanner title={title} heroDescription={heroDescription} image={image}>
      {note && <div className={PAGE_STYLES.bannerNote}>{note}</div>}
    </PageBanner>
    {(eyebrow || actions) && (
      <div className={PAGE_STYLES.headerRow}>
        {eyebrow ? <p className={PAGE_STYLES.eyebrow}>{eyebrow}</p> : <span />}
        {actions && <div className={PAGE_STYLES.toolbar}>{actions}</div>}
      </div>
    )}
  </header>
)
