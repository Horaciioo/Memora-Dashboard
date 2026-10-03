import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { ConsoleRow } from '@/composites/system/ConsoleRow'
import { requirePermission } from '@/core/wrappers/requireUser'
import { VIEW_COPY } from '@/declarations/access/copy'
import { ROUTES } from '@/declarations/navigation'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { SYSTEM_SCREENS } from '@/declarations/system/screens'
import { GROUP_STYLES, HOME_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: SYSTEM_COPY.title }

/**
 * Hub of the system screens, read off the same declaration as the rail
 * @return {Promise<JSX.Element>} - System index
 */

export default async function SystemPage() {
  await requirePermission(Permissions.AccessManage)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={SYSTEM_COPY.title} />

      <div className={cn(GROUP_STYLES.spaced, 'mx-auto w-full max-w-3xl')}>
        <Section bare>
          <div className={HOME_STYLES.rows}>
            <ConsoleRow href={ROUTES.administration} icon="console" label={VIEW_COPY.adminTitle} />
            {SYSTEM_SCREENS.map((screen) => (
              <ConsoleRow
                key={screen.route}
                href={ROUTES[screen.route]}
                icon={screen.icon}
                label={screen.label}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
