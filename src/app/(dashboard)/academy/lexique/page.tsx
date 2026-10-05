import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { GlossaryBoard } from '@/composites/academy/GlossaryBoard'
import { AcademyTabs } from '@/composites/academy/AcademyTabs'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ACADEMY_COPY.glossaryTitle }

/**
 * Academy lexicon
 * @return {Promise<JSX.Element>} - Glossary page
 */

export default async function GlossaryPage() {
  await requirePermission(Permissions.AcademyRead)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.glossaryTitle} />
      <AcademyTabs />
      <GlossaryBoard />
    </div>
  )
}
