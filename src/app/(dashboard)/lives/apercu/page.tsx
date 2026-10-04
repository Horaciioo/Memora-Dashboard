import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModViewPreview } from '@/composites/modview/ModViewPreview'
import { readDemoPanel } from '@/core/services/lives/PreviewService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { MODVIEW_PREVIEW_COPY } from '@/declarations/modview/preview'
import { MODVIEW_PAGE, PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: MODVIEW_PREVIEW_COPY.title }

/**
 * Mod View played on a scripted evening, for the administration to validate
 * @return {Promise<JSX.Element>} - Preview page
 */

export default async function ModViewPreviewPage() {
  const { session, access, scope } = await requirePermission(Permissions.LiveRead)
  if (!access.isAdmin) notFound()

  const { panel, levelNames } = await readDemoPanel(await scope())

  return (
    <div className={PAGE_STYLES.wrapper}>
      <h1 className={MODVIEW_PAGE.title}>{MODVIEW_PREVIEW_COPY.title}</h1>
      <ModViewPreview panel={panel} levelNames={levelNames} actorName={session.displayName} />
    </div>
  )
}
