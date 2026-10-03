import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { ConsoleRow } from '@/composites/system/ConsoleRow'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import {
  REFERENCE_GROUPS,
  referenceScreensOfGroup,
  referenceSectionsOfGroup,
} from '@/declarations/reference/sections'
import { GROUP_STYLES, HOME_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
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
      <PageHeader title={REFERENCE_COPY.title} />
      <div className={cn(GROUP_STYLES.spaced, 'mx-auto w-full max-w-3xl')}>
        {groups.map((group) => (
          <Section key={group.label} title={group.label} bare>
            <div className={HOME_STYLES.rows}>
              {group.sections.map((section) => (
                <ConsoleRow
                  key={section.key}
                  href={ROUTES.settingsSection(section.key)}
                  icon={section.icon}
                  label={section.label}
                />
              ))}
              {group.screens.map((screen) => (
                <ConsoleRow
                  key={screen.href}
                  href={screen.href}
                  icon={screen.icon}
                  label={screen.label}
                />
              ))}
            </div>
          </Section>
        ))}
      </div>
    </div>
  )
}
