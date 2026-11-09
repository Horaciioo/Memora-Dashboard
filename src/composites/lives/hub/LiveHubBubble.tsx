import Link from '@/components/elements/navigation/AppLink'
import { LIVE_COPY } from '@/declarations/lives/copy'
import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { LiveHubCreator } from '@/types/lives'
import { formatClock } from '@/utils/format/time/dates'

/**
 * Bubble where the creator says its live: frosted when planned, plain on air
 * @param {{ creator: LiveHubCreator }} props - Creator
 * @return {JSX.Element}
 */

export const LiveHubBubble = ({ creator }: { creator: LiveHubCreator }) => {
  const { live } = creator
  const PlatformIcon = live ? ICONS[LIVE_PLATFORM_REGISTRY.get(live.platform).icon] : null

  return (
    <div className={LIVE_HUB_STYLES.speech}>
      <span className={LIVE_HUB_STYLES.dotLarge} aria-hidden="true" />
      <span className={LIVE_HUB_STYLES.dotSmall} aria-hidden="true" />
      <div className={LIVE_HUB_STYLES.bubble}>
        <div className={LIVE_HUB_STYLES.bubbleBody}>
          <h2 className={LIVE_HUB_STYLES.bubbleTitle}>
            {PlatformIcon && live && (
              <PlatformIcon
                className={LIVE_HUB_STYLES.bubbleGlyph}
                aria-label={LIVE_PLATFORM_REGISTRY.label(live.platform)}
              />
            )}
            {live ? live.title : LIVE_HUB_COPY.nothingPlanned}
          </h2>
          {live && (
            <p className={LIVE_HUB_STYLES.bubbleSub}>
              {live.isOnAir
                ? LIVE_HUB_COPY.onAir
                : live.plannedEndAt
                  ? LIVE_COPY.plannedRange
                      .replace('{from}', formatClock(live.plannedStartAt))
                      .replace('{to}', formatClock(live.plannedEndAt))
                  : `${LIVE_COPY.plannedAt} ${formatClock(live.plannedStartAt)}`}
            </p>
          )}
        </div>
        {live && (
          <Link href={ROUTES.live(live.id)} className={LIVE_HUB_STYLES.moderate}>
            {LIVE_HUB_COPY.moderate}
          </Link>
        )}
      </div>
    </div>
  )
}
