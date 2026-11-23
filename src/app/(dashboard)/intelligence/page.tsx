import type { Metadata } from 'next'

import { IntelligenceHero } from '@/composites/intelligence/IntelligenceHero'
import { IntelligenceRecap } from '@/composites/intelligence/IntelligenceRecap'
import { greetingOf } from '@/core/lib/intelligence/greeting'
import { requireUser } from '@/core/wrappers/requireUser'
import { INTELLIGENCE_COPY } from '@/declarations/intelligence/copy'
import { INTELLIGENCE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: INTELLIGENCE_COPY.pageTitle }

/**
 * Memora Intelligence, her chat on top and the recap below
 * @return {Promise<JSX.Element>} - Page
 */

export default async function IntelligencePage() {
  const { session } = await requireUser()
  const title = greetingOf(session.displayName.split(' ')[0])

  return (
    <div className={INTELLIGENCE_STYLES.page}>
      <IntelligenceHero title={title} />
      <IntelligenceRecap />
    </div>
  )
}
