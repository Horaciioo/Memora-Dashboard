import { PlayHubScenery } from '@/composites/play/hub/scenery/PlayHubScenery'
import { PLAY_HUB } from '@/declarations/ui/variants'

/**
 * Day circuit behind the hub: grass, a tight bend with a car, bunting and a sign
 * @return {JSX.Element}
 */

export const PlayStopGoRoad = () => (
  <div className={PLAY_HUB.embers} aria-hidden="true">
    <PlayHubScenery set="stopgo" />
  </div>
)
