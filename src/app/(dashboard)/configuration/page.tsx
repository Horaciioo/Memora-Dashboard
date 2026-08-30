import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/structures/PageHeader'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ROUTES } from '@/declarations/navigation'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import { REFERENCE_GROUPS, referenceSectionsOfGroup } from '@/declarations/reference/sections'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { GROUP_STYLES, LIST_STYLES, PAGE_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { cn } from '@/utils/classnames'

export const metadata: Metadata = { title: REFERENCE_COPY.title }

// Console link card
const ConsoleCard = ({
  href,
  icon,
  label,
  description,
}: {
  href: string
  icon: IconName
  label: string
  description: string
}) => {
  const Icon = ICONS[icon]

  return (
    <Link href={href} className={cn(LIST_STYLES.card, LIST_STYLES.cardClickable)}>
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--color-brand-600)]" aria-hidden="true" />
        <span className="font-bold">{label}</span>
      </span>
      <span className="text-sm text-[var(--color-ink-subtle)]">{description}</span>
    </Link>
  )
}

/**
 * Admin console home, collections bucketed by group
 * @return {Promise<JSX.Element>} - Configuration index
 */

export default async function ConfigurationPage() {
  const { access } = await requirePermission(Permissions.ReferenceRead)

  // Non-empty groups, in display order
  const groups = REFERENCE_GROUPS.map((group) => ({
    label: group.label,
    sections: referenceSectionsOfGroup(group.key),
  })).filter((group) => group.sections.length > 0)

  const canManageAccess = access.can(Permissions.AccessManage)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={REFERENCE_COPY.title} lead={REFERENCE_COPY.lead} />
      <div className={GROUP_STYLES.ruledStack}>
        {groups.map((group) => (
          <section key={group.label} className={GROUP_STYLES.ruledSection}>
            <h2 className={SECTION_STYLES.title}>{group.label}</h2>
            <div className={LIST_STYLES.grid}>
              {group.sections.map((section) => (
                <ConsoleCard
                  key={section.key}
                  href={ROUTES.settingsSection(section.key)}
                  icon={section.icon}
                  label={section.label}
                  description={section.description}
                />
              ))}
            </div>
          </section>
        ))}

        {canManageAccess && (
          <section className={GROUP_STYLES.ruledSection}>
            <h2 className={SECTION_STYLES.title}>{REFERENCE_COPY.administration}</h2>
            <div className={LIST_STYLES.grid}>
              <ConsoleCard
                href={ROUTES.settingsSection('acces')}
                icon="shield"
                label={ACCESS_COPY.title}
                description={ACCESS_COPY.lead}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
