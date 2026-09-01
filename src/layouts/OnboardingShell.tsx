import Image from 'next/image'
import type { ReactNode } from 'react'

import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { ONBOARDING_STYLES } from '@/declarations/ui/variants'
import type { IntegrationCreator } from '@/types/onboarding'

export interface OnboardingShellProps {
  title: string
  subtitle?: string
  creator: IntegrationCreator | null
  children: ReactNode
}

/**
 * Public integration chrome — the creator's banner standing the full height on the left,
 * carrying the heading, the form itself sitting bare on the page beside it
 * @param {string} title - Page title
 * @param {string} [subtitle] - Supporting line under the title
 * @param {IntegrationCreator | null} creator - Creator the banner comes from
 * @param {ReactNode} children - Form content
 * @return {JSX.Element}
 */

export const OnboardingShell = ({ title, subtitle, creator, children }: OnboardingShellProps) => (
  <main className={ONBOARDING_STYLES.page}>
    <aside className={ONBOARDING_STYLES.banner}>
      {creator?.bannerUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={creator.bannerUrl} alt="" className={ONBOARDING_STYLES.bannerImage} />
      )}
      <span className={ONBOARDING_STYLES.bannerScrim} aria-hidden="true" />

      <Image
        src={APP_ASSETS.wordmark}
        alt={`${APP_COMPANY} ${APP_NAME}`}
        width={168}
        height={59}
        className={ONBOARDING_STYLES.bannerMark}
        priority
      />

      <div className={ONBOARDING_STYLES.bannerFoot}>
        {creator && <p className={ONBOARDING_STYLES.bannerEyebrow}>{creator.name}</p>}
        <h1 className={ONBOARDING_STYLES.bannerTitle}>{title}</h1>
        {subtitle && <p className={ONBOARDING_STYLES.bannerLead}>{subtitle}</p>}
      </div>
    </aside>

    <section className={ONBOARDING_STYLES.panel}>
      <div className={ONBOARDING_STYLES.form}>{children}</div>
    </section>
  </main>
)
