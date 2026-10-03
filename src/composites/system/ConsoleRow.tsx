import Link from 'next/link'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { HOME_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ConsoleRowProps {
  href: string
  icon: IconName
  label: string
}

/**
 * Row opening one console destination: its glyph, its name, nothing else
 * @param {string} href - Destination
 * @param {IconName} icon - Icon key
 * @param {string} label - Row title
 * @return {JSX.Element}
 */

export const ConsoleRow = ({ href, icon, label }: ConsoleRowProps) => {
  const Icon = ICONS[icon]
  const Chevron = ICONS.next

  return (
    <Link href={href} className={cn(HOME_STYLES.line, HOME_STYLES.lineLink)}>
      <Icon className={HOME_STYLES.consoleIcon} aria-hidden="true" />
      <span className={HOME_STYLES.rowBody}>
        <span className={HOME_STYLES.rowTitle}>{label}</span>
      </span>
      <Chevron className={HOME_STYLES.chevron} aria-hidden="true" />
    </Link>
  )
}
