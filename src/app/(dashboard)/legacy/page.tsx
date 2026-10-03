import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { LegacyBoard } from '@/composites/legacy/LegacyBoard'
import { legacyFields, listTracks } from '@/core/services/academy/LegacyService'
import { requireUser } from '@/core/wrappers/requireUser'
import { LEGACY_COPY } from '@/declarations/academy/legacy/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: LEGACY_COPY.title }

/**
 * Every Legacy track, the running ones and the finished ones behind the page options
 * @return {Promise<JSX.Element>} - Legacy page
 */

export default async function LegacyPage() {
  const { access } = await requireUser()

  // Without the right to read them all, a member only has their own page
  if (!access.isAdmin && !access.can(Permissions.LegacyRead)) redirect(ROUTES.myLegacy)

  const [tracks, fields] = await Promise.all([listTracks(), legacyFields()])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={LEGACY_COPY.title} />
      <LegacyBoard tracks={tracks} fields={fields} canManage={access.isAdmin} />
    </div>
  )
}
