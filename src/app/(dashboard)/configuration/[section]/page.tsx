import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { ReferenceManager } from '@/composites/reference/ReferenceManager'
import { referenceResource } from '@/core/services/reference/ReferenceService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { REFERENCE_COPY } from '@/declarations/reference/copy'
import { isReferenceKey, referenceSection } from '@/declarations/reference/sections'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the collection
 * @param {Object} context - Route context
 * @param {Promise<{ section: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>
}): Promise<Metadata> {
  const { section } = await params

  return { title: referenceSection(section)?.label ?? REFERENCE_COPY.title }
}

/**
 * Editor of one reference collection
 * @param {Object} context - Route context
 * @param {Promise<{ section: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Collection editor
 */

export default async function ReferenceSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  const { section } = await params
  if (!isReferenceKey(section)) notFound()

  const { access } = await requirePermission(Permissions.ReferenceRead)
  const meta = referenceSection(section)!
  const resource = referenceResource(section)
  const [fields, rows] = await Promise.all([resource.fields(), resource.list()])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={meta.label} lead={meta.description} />
      <ReferenceManager
        section={meta}
        fields={fields}
        initialRows={rows}
        canManage={access.can(Permissions.ReferenceManage)}
      />
    </div>
  )
}
