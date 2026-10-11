import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_DECK } from '@/declarations/ui/variants'

/**
 * Red card telling the answer stays inside the Administration
 * @return {JSX.Element}
 */

export const PrivacyNote = () => (
  <div className={TOUR_DECK.privacy} role="note">
    <span className={TOUR_DECK.privacySheen} aria-hidden="true" />
    <span className={TOUR_DECK.privacyBody}>
      <span className={TOUR_DECK.privacyKicker}>{TOUR_COPY.privacyKicker}</span>
      <span className={TOUR_DECK.privacyText}>{TOUR_COPY.privacy}</span>
    </span>
  </div>
)
