import { CroquisDoodle, CroquisPage } from '@/composites/play/croquis/art/croquisPage'
import { GAME_ART_FRAMES } from '@/declarations/play/artFrames'
import type { GameArtFrame } from '@/declarations/play/artFrames'
import { CROQUIS_BANNER } from '@/declarations/play/croquis/banner'

/**
 * Game card of Croquis, the sketchbook page with its finished rocket
 * @param {object} props - Frame
 * @return {JSX.Element}
 */

export const CroquisCardArt = ({ frame }: { frame: GameArtFrame }) => {
  const size = GAME_ART_FRAMES[frame]
  const page = CROQUIS_BANNER.frames[frame]

  return (
    <>
      <CroquisPage id={`croquis-${frame}`} {...size} />
      <CroquisDoodle d={CROQUIS_BANNER.sun} place={page.sun} />
      <CroquisDoodle d={CROQUIS_BANNER.star} place={page.star} />
      <CroquisDoodle d={CROQUIS_BANNER.cloud} place={page.cloud} />
      <CroquisDoodle d={CROQUIS_BANNER.rocket} place={page.rocket} weight={3} />
    </>
  )
}
