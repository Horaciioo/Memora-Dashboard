import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { AccessMatrixPanel } from '@/composites/access/AccessMatrixPanel'
import { readFunctionGrants, readRoleGrants } from '@/core/services/auth/GrantsService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACCESS_COPY } from '@/declarations/access/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ACCESS_COPY.title }

/**
 * Permission matrix
 * @return {Promise<JSX.Element>} - Access page
 */

export default async function AccessPage() {
  await requirePermission(Permissions.AccessManage)

  const [roles, functions] = await Promise.all([readRoleGrants(), readFunctionGrants()])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACCESS_COPY.title} lead={ACCESS_COPY.lead} />
      <AccessMatrixPanel initialMatrix={{ roles, functions }} />
    </div>
  )
}
