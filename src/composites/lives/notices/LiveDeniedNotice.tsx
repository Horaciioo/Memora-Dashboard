import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { PLATFORM_NOTICE_COPY } from '@/declarations/platforms/copy'
import { MODVIEW_PAGE } from '@/declarations/ui/variants'

export interface LiveDeniedNoticeProps {
  notice: string
}

/**
 * Screen of a live the member may not enter: not a moderator of the channel
 * @param {string} notice - Reason
 * @return {JSX.Element}
 */

export const LiveDeniedNotice = ({ notice }: LiveDeniedNoticeProps) => (
  <div className={MODVIEW_PAGE.closed}>
    <h2 className={MODVIEW_PAGE.closedTitle}>{PLATFORM_NOTICE_COPY.deniedTitle}</h2>
    <p className={MODVIEW_PAGE.closedBody}>{notice}</p>
    <AppLink href={ROUTES.lives}>
      <Button variant="primary">{LIVE_PAGE_COPY.backToLives}</Button>
    </AppLink>
  </div>
)
