import type { Metadata } from 'next'

import { BackButton } from '@/components/elements/actions/BackButton'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { requireUser } from '@/core/wrappers/requireUser'
import { MATURITY_COPY } from '@/declarations/maturity/copy'
import { MATURITY_REGISTRY } from '@/declarations/maturity/registries'
import { MATURITY_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: MATURITY_COPY.pageTitle }

/**
 * Explains every feature maturity tag, one row per stage
 * @return {Promise<JSX.Element>} - Maturity page
 */

export default async function MaturityPage() {
  await requireUser()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MATURITY_COPY.pageTitle} lead={MATURITY_COPY.pageLead} />

      <Section padded>
        <ul className="flex flex-col gap-4">
          {MATURITY_REGISTRY.keys.map((key) => (
            <li key={key} className={MATURITY_STYLES.row}>
              <MaturityTag maturity={key} interactive={false} />
              <span className={MATURITY_STYLES.meaning}>{MATURITY_REGISTRY.get(key).summary}</span>
            </li>
          ))}
        </ul>
      </Section>

      <div className="flex justify-end">
        <BackButton label={MATURITY_COPY.understood} />
      </div>
    </div>
  )
}
