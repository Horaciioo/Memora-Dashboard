import { CONCORDAT_SIZE_DOTS, concordatRegionArt } from '@/declarations/play/concordat/world'
import { CONCORDAT_SETUP_ART } from '@/declarations/ui/variants'
import { CONCORDAT_SETUP_COPY } from '@/declarations/play/concordat/copy'
import { cn } from '@/utils/classnames'
import { CONCORDAT_RANDOM_STYLE, ConcordatStyles } from '@/utils/constants/concordat'
import type { ConcordatSizeName, ConcordatStyleChoice } from '@/utils/constants/concordat'

/**
 * Silhouette of a map region
 * @param {Object} props - Region
 * @param {ConcordatStyleName} props.style - Style
 * @return {JSX.Element}
 */

export const ConcordatRegionArt = ({ style }: { style: ConcordatStyleChoice }) => {
  const isRandom = style === CONCORDAT_RANDOM_STYLE
  const url = `url(${concordatRegionArt(isRandom ? ConcordatStyles.World : style)})`
  const region = (
    <span
      aria-hidden="true"
      className={cn(CONCORDAT_SETUP_ART.region, isRandom && CONCORDAT_SETUP_ART.blurred)}
      style={{ maskImage: url, WebkitMaskImage: url }}
    />
  )

  if (!isRandom) return region

  return (
    <span aria-hidden="true" className={CONCORDAT_SETUP_ART.random}>
      {region}
      <span className={CONCORDAT_SETUP_ART.mark}>{CONCORDAT_SETUP_COPY.randomMark}</span>
    </span>
  )
}

/**
 * Grid of dots, denser on a bigger map
 * @param {Object} props - Size
 * @param {ConcordatSizeName} props.size - Size
 * @return {JSX.Element}
 */

export const ConcordatSizeArt = ({ size }: { size: ConcordatSizeName }) => {
  const side = CONCORDAT_SIZE_DOTS[size]

  return (
    <span
      aria-hidden="true"
      className={CONCORDAT_SETUP_ART.dots}
      style={{ gridTemplateColumns: `repeat(${side}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: side * side }, (_, index) => (
        <span key={index} className={CONCORDAT_SETUP_ART.dot} />
      ))}
    </span>
  )
}
