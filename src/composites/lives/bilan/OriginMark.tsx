import { MemoraMark } from '@/components/elements/display/marks/MemoraMark'
import { NetworkLogo } from '@/components/elements/display/marks/NetworkLogo'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_REPORT } from '@/declarations/ui/variants'

export interface OriginMarkProps {
  // Gesture or account is on Memora
  onMemora: boolean
}

/**
 * Where someone moderated: the Memora logo, or Twitch when outside Memora
 * @param {boolean} onMemora - On Memora, else Twitch
 * @return {JSX.Element}
 */

export const OriginMark = ({ onMemora }: OriginMarkProps) => (
  <span
    className={LIVE_REPORT.origin}
    role="img"
    aria-label={onMemora ? LIVE_REPORT_COPY.originMemora : LIVE_REPORT_COPY.outsideMemora}
    title={onMemora ? LIVE_REPORT_COPY.originMemora : LIVE_REPORT_COPY.outsideMemora}
  >
    {onMemora ? (
      <MemoraMark className={LIVE_REPORT.originGlyph} />
    ) : (
      <NetworkLogo network="twitch" className={LIVE_REPORT.originGlyph} />
    )}
  </span>
)
