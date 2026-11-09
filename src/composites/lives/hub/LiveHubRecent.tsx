import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ICONS } from '@/declarations/ui/icons'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { MemberLiveSummary } from '@/types/lives'
import { formatDay } from '@/utils/format/time/dates'
import { roughDuration } from '@/utils/format/time/hours'

/**
 * Latest lives the member moderated for the creator
 * @param {{ lives: MemberLiveSummary[] }} props - Lives
 * @return {JSX.Element}
 */

export const LiveHubRecent = ({ lives }: { lives: MemberLiveSummary[] }) => (
  <section className={LIVE_HUB_STYLES.section}>
    <h2 className={LIVE_HUB_STYLES.sectionTitle}>{LIVE_HUB_COPY.recentTitle}</h2>
    {lives.length === 0 ? (
      <p className={LIVE_HUB_STYLES.empty}>{LIVE_HUB_COPY.recentEmpty}</p>
    ) : (
      <ul className={LIVE_HUB_STYLES.list}>
        {lives.map((live) => {
          const PlatformIcon = ICONS[LIVE_PLATFORM_REGISTRY.get(live.platform).icon]
          const gestures = live.kinds.reduce((sum, entry) => sum + entry.count, 0)

          return (
            <li key={live.liveId} className={LIVE_HUB_STYLES.row}>
              <PlatformIcon className={LIVE_HUB_STYLES.bubbleGlyph} aria-hidden="true" />
              <span className={LIVE_HUB_STYLES.rowBody}>
                <span className={LIVE_HUB_STYLES.rowTitle}>{live.title}</span>
                <span className={LIVE_HUB_STYLES.rowMeta}>
                  {[
                    formatDay(live.startedAt),
                    LIVE_HUB_COPY.recentGestures.replace('{count}', String(gestures)),
                    live.isReinforcement ? LIVE_HUB_COPY.reinforcement : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span className={LIVE_HUB_STYLES.rowAside}>
                {LIVE_HUB_COPY.recentTime.replace('{time}', roughDuration(live.activeSeconds / 60))}
              </span>
            </li>
          )
        })}
      </ul>
    )}
  </section>
)
