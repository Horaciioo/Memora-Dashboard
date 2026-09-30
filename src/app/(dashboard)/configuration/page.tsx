import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { ConsoleCard } from '@/composites/system/ConsoleCard'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import {
  REFERENCE_GROUPS,
  referenceScreensOfGroup,
  referenceSectionsOfGroup,
} from '@/declarations/reference/sections'
import { GROUP_STYLES, LIST_STYLES, PAGE_STYLES, SECTION_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: REFERENCE_COPY.title }

/**
 * Admin console home
 * @return {Promise<JSX.Element>} - Configuration index
 */

export default async function ConfigurationPage() {
  const { access } = await requirePermission(Permissions.ReferenceRead)

  // Non-empty groups, in display order
  const groups = REFERENCE_GROUPS.map((group) => ({
    label: group.label,
    sections: referenceSectionsOfGroup(group.key),
    screens: referenceScreensOfGroup(group.key).filter((screen) => access.can(screen.permission)),
  })).filter((group) => group.sections.length > 0 || group.screens.length > 0)

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
              {group.screens.map((screen) => (
                <ConsoleCard
                  key={screen.href}
                  href={screen.href}
                  icon={screen.icon}
                  label={screen.label}
                  description={screen.description}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
