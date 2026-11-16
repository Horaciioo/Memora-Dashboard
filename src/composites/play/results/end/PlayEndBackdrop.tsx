import { PLAY_END_PAGE } from '@/declarations/ui/variants'

/**
 * Light behind the podium in the tone of the game: halo, turning rays, vignette
 * @return {JSX.Element}
 */

export const PlayEndBackdrop = () => (
  <div className={PLAY_END_PAGE.backdrop} aria-hidden="true">
    <i className={PLAY_END_PAGE.rays} />
    <i className={PLAY_END_PAGE.halo} />
    <i className={PLAY_END_PAGE.vignette} />
  </div>
)
