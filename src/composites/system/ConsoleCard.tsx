import Link from 'next/link'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { CONSOLE_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { LIST_STYLES } from '@/declarations/ui/variants'
import type { IconName } from '@/declarations/ui/icons'
import type { MaturityName } from '@/declarations/maturity/registries'
import { cn } from '@/utils/classnames'

export interface ConsoleCardProps {
  href: string
  icon: IconName
  label: string
  description: string
  maturity?: MaturityName
}

/**
 * Card opening one console destination, its glyph and title on one line
 * @param {string} href - Destination
 * @param {IconName} icon - Icon key
 * @param {string} label - Card title
 * @param {string} description - What the destination opens
 * @param {MaturityName} [maturity] - Lifecycle stage shown as a tag
 * @return {JSX.Element}
 */

export const ConsoleCard = ({ href, icon, label, description, maturity }: ConsoleCardProps) => {
  const Icon = ICONS[icon]

  return (
    <Link href={href} className={cn(LIST_STYLES.card, LIST_STYLES.cardClickable)}>
      <span className={CONSOLE_BLOCK.cardHead}>
        <Icon className={CONSOLE_BLOCK.cardIcon} aria-hidden="true" />
        <span className={CONSOLE_BLOCK.cardTitle}>{label}</span>
        {maturity && <MaturityTag maturity={maturity} interactive={false} />}
      </span>
      <span className={CONSOLE_BLOCK.cardLead}>{description}</span>
    </Link>
  )
}
