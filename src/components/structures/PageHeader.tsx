import type { ReactNode } from 'react'
import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export interface PageHeaderProps {
  // Line sitting above the title, e.g. the identifier of the record on screen
  eyebrow?: string
  title: string
  // Read from the info icon
  lead?: string
  actions?: ReactNode
}

/**
 * Top of a route, the only place a page level h1 is written. Past md the title hangs from the
 * frame in a tab whose shoulders slope into the rim
 * @param {string} [eyebrow] - Line rendered above the title
 * @param {string} title - Page title
 * @param {string} [lead] - Info icon text
 * @param {ReactNode} [actions] - Controls aligned to the right
 * @return {JSX.Element}
 */

export const PageHeader = ({ eyebrow, title, lead, actions }: PageHeaderProps) => (
  <header className={PAGE_STYLES.header}>
    <div className={PAGE_STYLES.titleRail}>
      <span className={PAGE_STYLES.titleSlopeStart} aria-hidden="true" />
      <h1 className={PAGE_STYLES.titleTab} title={title}>
        <span className={PAGE_STYLES.titleTabText}>{title}</span>
        {lead && (
          <InfoHint
            text={lead}
            className={PAGE_STYLES.titleInfo}
            triggerClassName={PAGE_STYLES.titleInfoTrigger}
          />
        )}
      </h1>
      <span className={PAGE_STYLES.titleSlopeEnd} aria-hidden="true" />
    </div>
    {(eyebrow || actions) && (
      <div className={PAGE_STYLES.headerRow}>
        {eyebrow ? <p className={PAGE_STYLES.eyebrow}>{eyebrow}</p> : <span />}
        {actions && <div className={PAGE_STYLES.toolbar}>{actions}</div>}
      </div>
    )}
  </header>
)
