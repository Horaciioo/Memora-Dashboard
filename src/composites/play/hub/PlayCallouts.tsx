import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_HUB } from '@/declarations/ui/variants'

/**
 * Ban notice, the game to resume lives in the dock feed
 * @param {Object} props - Player state
 * @param {boolean} props.isBanned - Kept out of Play
 * @return {JSX.Element | null}
 */

export const PlayCallouts = ({ isBanned }: { isBanned: boolean }) =>
  isBanned ? <p className={PLAY_HUB.callout}>{PLAY_HUB_COPY.banned}</p> : null
