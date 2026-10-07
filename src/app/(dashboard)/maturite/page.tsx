import type { Metadata } from 'next'

import Link from 'next/link'

import { Button } from '@/components/elements/actions/Button'
import { BackButton } from '@/components/elements/actions/BackButton'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { PageHeader } from '@/components/structures/PageHeader'
import { Section } from '@/components/structures/Section'
import { requireUser } from '@/core/wrappers/requireUser'
import { MATURITY_COPY } from '@/declarations/maturity/copy'
import { MATURITY_REGISTRY } from '@/declarations/maturity/registries'
import { ROUTES } from '@/declarations/navigation'
import { MATURITY_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export const metadata: Metadata = { title: MATURITY_COPY.pageTitle }

/**
 * Explains every feature maturity tag
 * @return {Promise<JSX.Element>} - Maturity page
 */

export default async function MaturityPage() {
  await requireUser()

  return (
    <div className={cn(PAGE_STYLES.wrapper, 'max-w-xl')}>
      <PageHeader title={MATURITY_COPY.pageTitle} />

      <Section title={MATURITY_COPY.typesTitle} padded>
        <ul className={MATURITY_STYLES.list}>
          {MATURITY_REGISTRY.keys.map((key) => (
            <li key={key} className={MATURITY_STYLES.row}>
              <span>
                <MaturityTag maturity={key} interactive={false} />
              </span>
              <span className={MATURITY_STYLES.meaning}>{MATURITY_REGISTRY.get(key).summary}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={MATURITY_COPY.evaluationTitle} padded>
        <p className={MATURITY_STYLES.meaning}>{MATURITY_COPY.evaluationBody}</p>
      </Section>

      <div className={MATURITY_STYLES.actions}>
        <BackButton label={MATURITY_COPY.understood} className="w-full" />
        <div className={MATURITY_STYLES.rule} aria-hidden="true" />
        <Link href={ROUTES.changelog}>
          <Button variant="secondary" icon="news" className="w-full">
            {MATURITY_COPY.lastNote}
          </Button>
        </Link>
      </div>
    </div>
  )
}
