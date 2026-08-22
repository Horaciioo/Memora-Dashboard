import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { ProjectFileTabs } from '@/composites/work/ProjectFileTabs'
import { communicationFields, readProject } from '@/core/services/work/ProjectService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { PROJECT_COPY } from '@/declarations/work/copy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the project
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  try {
    const project = await readProject(id)

    return { title: project.summary.title }
  } catch {
    return { title: PROJECT_COPY.title }
  }
}

/**
 * Project file
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Detail page
 */

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access } = await requirePermission(Permissions.ProjectRead)

  const detail = await readProject(id).catch(() => null)
  if (!detail) notFound()

  const fields = await communicationFields()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={detail.summary.title}
        lead={detail.summary.description ?? PROJECT_COPY.lead}
      />
      <ProjectFileTabs
        detail={detail}
        communicationFields={fields}
        canReadCommunications={access.can(Permissions.CommunicationRead)}
        canWriteCommunications={access.can(Permissions.CommunicationWrite)}
      />
    </div>
  )
}
