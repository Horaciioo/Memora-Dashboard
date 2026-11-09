import Image from 'next/image'

import { NAVAL_SEA } from '@/declarations/play/naval/copy'
import { NAVAL_HUB } from '@/declarations/ui/variants/games/naval'

/**
 * Hub ground of the naval battle: a real sea at dusk
 * @return {JSX.Element}
 */

export const NavalHubPhoto = () => (
  <div className={NAVAL_HUB.scene} aria-hidden="true">
    <Image src={NAVAL_SEA.photo} alt="" fill priority sizes="100vw" className={NAVAL_HUB.photo} />
    <div className={NAVAL_HUB.veil} />
  </div>
)
