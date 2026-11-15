import type { Metadata } from 'next'

import { PageHeader } from '@/components/structures/page/PageHeader'
import { Section } from '@/components/structures/page/Section'
import { MailCatalogue } from '@/composites/system/mail/MailCatalogue'
import { MailJournal } from '@/composites/system/mail/MailJournal'
import { mailCatalogue } from '@/core/lib/mail/catalogue'
import { readMailJournal } from '@/core/services/mail/JournalService'
import { requireSystem } from '@/core/wrappers/requireUser'
import { isMailConfigured, MAIL_CONFIG } from '@/declarations/mail/config'
import { MAIL_CONSOLE_COPY } from '@/declarations/mail/copy'
import { GROUP_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: MAIL_CONSOLE_COPY.title }

/**
 * Every mail as a person reads it, and the journal of those sent
 * @return {Promise<JSX.Element>} - Mail console
 */

export default async function MailConsolePage() {
  await requireSystem()
  const journal = await readMailJournal()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MAIL_CONSOLE_COPY.title} />

      <div className={GROUP_STYLES.spaced}>
        <Section
          title={MAIL_CONSOLE_COPY.catalogueTitle}
          description={MAIL_CONSOLE_COPY.catalogueLead}
          padded
        >
          <MailCatalogue
            entries={mailCatalogue(MAIL_CONFIG.origin)}
            isConfigured={isMailConfigured()}
          />
        </Section>
        <Section
          title={MAIL_CONSOLE_COPY.journalTitle}
          description={MAIL_CONSOLE_COPY.journalLead}
          padded
        >
          <MailJournal entries={journal} />
        </Section>
      </div>
    </div>
  )
}
