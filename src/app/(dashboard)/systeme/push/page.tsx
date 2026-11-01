import type { Metadata } from 'next'

import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { PushCatalogue } from '@/composites/system/push/PushCatalogue'
import { PushJournal } from '@/composites/system/push/PushJournal'
import { pushCatalogue } from '@/core/lib/push'
import { readPushJournal, readPushSettings } from '@/core/services/push'
import { requireSystem } from '@/core/wrappers/requireUser'
import { PUSH_CONSOLE_COPY } from '@/declarations/pwa/copy'
import { GROUP_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PUSH_CONSOLE_COPY.title }

/**
 * Every push as it lands on a phone, and the journal of those sent
 * @return {Promise<JSX.Element>} - Push console
 */

export default async function PushConsolePage() {
  const { session } = await requireSystem()

  const [journal, settings] = await Promise.all([readPushJournal(), readPushSettings(session.id)])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PUSH_CONSOLE_COPY.title} />

      <div className={GROUP_STYLES.spaced}>
        <Section
          title={PUSH_CONSOLE_COPY.catalogueTitle}
          description={PUSH_CONSOLE_COPY.catalogueLead}
          padded
        >
          <PushCatalogue
            entries={pushCatalogue(session.displayName)}
            hasDevice={settings.devices.length > 0}
          />
        </Section>
        <Section
          title={PUSH_CONSOLE_COPY.journalTitle}
          description={PUSH_CONSOLE_COPY.journalLead}
          padded
        >
          <PushJournal initial={journal} />
        </Section>
      </div>
    </div>
  )
}
