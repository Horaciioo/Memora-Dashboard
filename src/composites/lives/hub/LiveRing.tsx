import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'

/**
 * Steady ring and one slow wave around a portrait on air
 * @return {JSX.Element}
 */

export const LiveRing = () => (
  <span className={LIVE_HUB_STYLES.liveRing} aria-hidden="true">
    <span className={LIVE_HUB_STYLES.liveSpin} />
    <span className={LIVE_HUB_STYLES.liveWave} />
  </span>
)
