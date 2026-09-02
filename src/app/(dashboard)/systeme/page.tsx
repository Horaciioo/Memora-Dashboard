import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { ConsoleCard } from '@/composites/system/ConsoleCard'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { SYSTEM_COPY } from '@/declarations/system/copy'
import { SYSTEM_SCREENS } from '@/declarations/system/screens'
import { LIST_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
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
      <PageHeader title={SYSTEM_COPY.title} lead={SYSTEM_COPY.lead} />

      <div className={LIST_STYLES.grid}>
        {SYSTEM_SCREENS.map((screen) => (
          <ConsoleCard
            key={screen.route}
            href={ROUTES[screen.route]}
            icon={screen.icon}
            label={screen.label}
            description={screen.description}
            maturity={screen.maturity}
          />
        ))}
      </div>
    </div>
  )
}
