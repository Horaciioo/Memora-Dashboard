import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { AccessConsole } from '@/composites/access/AccessConsole'
import { readAccessConsole } from '@/core/services/auth/AccessConsoleService'
import { readActiveCreator } from '@/core/lib/auth/activeCreator'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { ACCESS_EDITABLE } from '@/declarations/access/editing'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ACCESS_COPY.title }

/**
 * Access console
 * @return {Promise<JSX.Element>} - Access page
 */

export default async function AccessPage() {
  // Decided in code for now
  if (!ACCESS_EDITABLE) notFound()

  const { access } = await requirePermission(Permissions.AccessManage)

  // The console opens on whichever creator the rail is already narrowed to
  const data = await readAccessConsole(access.isAdmin, await readActiveCreator())

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACCESS_COPY.title} lead={ACCESS_COPY.lead} />
      <AccessConsole initial={data} canManageEncadrement={access.isAdmin} />
    </div>
  )
}
