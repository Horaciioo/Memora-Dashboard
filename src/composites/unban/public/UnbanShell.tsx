import Image from 'next/image'
import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { PAGE_BANNER, PAGE_STYLES, UNBAN_SHELL_STYLES } from '@/declarations/ui/variants'
import type { IntegrationCreator } from '@/types/onboarding'

export interface UnbanShellProps {
  title: string
  creator: IntegrationCreator | null
  // Drawn inside a page of the dashboard rather than as the page itself
  isPreview?: boolean
  children: ReactNode
}

/**
 * Frame of the public Deban. pages, built like the dashboard pages: photograph with the title over its foot, creator portrait on its lower edge
 * @param {string} title - Page title
 * @param {IntegrationCreator | null} creator - Creator the banner and portrait come from
 * @param {boolean} [isPreview] - Drawn inside the dashboard
 * @param {ReactNode} children - Content under the heading
 * @return {JSX.Element}
 */

export const UnbanShell = ({ title, creator, isPreview, children }: UnbanShellProps) => {
  const Root = isPreview ? 'div' : 'main'

  return (
    <Root className={isPreview ? UNBAN_SHELL_STYLES.preview : UNBAN_SHELL_STYLES.page}>
      <header className={UNBAN_SHELL_STYLES.banner}>
        <div className={PAGE_BANNER.art} aria-hidden="true">
          {creator?.bannerUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={creator.bannerUrl} alt="" className={PAGE_BANNER.image} />
          )}
        </div>
        <Image
          src={APP_ASSETS.wordmark}
          alt={`${APP_COMPANY} ${APP_NAME}`}
          width={168}
          height={59}
          className={UNBAN_SHELL_STYLES.mark}
          priority={!isPreview}
        />
        <div className={UNBAN_SHELL_STYLES.bannerFoot}>
          <h1 className={PAGE_STYLES.bannerTitle}>
            <span className={PAGE_STYLES.bannerTitleText}>{title}</span>
          </h1>
        </div>
      </header>

      {creator && (
        <div className={UNBAN_SHELL_STYLES.identityRow}>
          <div className={UNBAN_SHELL_STYLES.portraitWrap}>
            <Avatar
              name={creator.name}
              src={creator.avatarUrl}
              size="hero"
              className={UNBAN_SHELL_STYLES.portrait}
            />
          </div>
          <p className={UNBAN_SHELL_STYLES.name}>{creator.name}</p>
        </div>
      )}

      <div className={UNBAN_SHELL_STYLES.body}>{children}</div>
    </Root>
  )
}
