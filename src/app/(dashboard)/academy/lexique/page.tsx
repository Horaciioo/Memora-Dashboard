import type { Metadata } from 'next'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { AcademyTabs } from '@/composites/academy/AcademyTabs'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GLOSSARY_REGISTRY } from '@/declarations/academy/glossary'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

export const metadata: Metadata = { title: ACADEMY_COPY.glossaryTitle }

/**
 * Academy lexicon, the terms the domain is written in
 * @return {Promise<JSX.Element>} - Glossary page
 */

export default async function GlossaryPage() {
  await requirePermission(Permissions.AcademyRead)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={ACADEMY_COPY.glossaryTitle} lead={ACADEMY_COPY.glossaryLead} />
      <AcademyTabs />
      <Section title={ACADEMY_COPY.title} padded>
        <DetailGrid
          entries={GLOSSARY_REGISTRY.list.map((entry) => ({
            label: entry.label,
            value: entry.definition,
          }))}
        />
      </Section>
    </div>
  )
}
