import { PixelArt } from '@/components/elements/display/PixelArt'
import { PlayPixelBrain } from '@/composites/play/brand/PlayPixelBrain'
import { pixelWordRows } from '@/core/lib/play/pixelWord'
import { PLAY_HOME_COPY } from '@/declarations/play'
import { PLAY_TOPBAR } from '@/declarations/ui/variants'

// Wordmark rows, built once
const WORD = pixelWordRows(PLAY_HOME_COPY.brand.toUpperCase())

/**
 * Memora Play brand: pixel brain and pixel wordmark
 * @return {JSX.Element}
 */

export const PlayBrand = () => (
  <>
    <PlayPixelBrain className={PLAY_TOPBAR.brandMark} />
    <PixelArt rows={WORD} className={PLAY_TOPBAR.brandName} />
    <span className="sr-only">{PLAY_HOME_COPY.brand}</span>
  </>
)
