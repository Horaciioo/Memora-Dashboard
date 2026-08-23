import { WIP_COPY } from '@/declarations/ui/copy'
import { BETA_STYLES } from '@/declarations/ui/variants'

export interface BetaBannerProps {
  // Replaces the generic line stating the surface is still moving
  description?: string
}

/**
 * Amber strip flagging a surface that is not finished, so nothing on screen pretends to be
 * @param {string} [description] - Line replacing the generic one
 * @return {JSX.Element}
 */

export const BetaBanner = ({ description }: BetaBannerProps) => (
  <p className={BETA_STYLES.frame}>
    <span className={BETA_STYLES.tag}>{WIP_COPY.beta}</span>
    {description ?? WIP_COPY.betaNotice}
  </p>
)
