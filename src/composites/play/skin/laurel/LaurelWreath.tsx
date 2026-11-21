import { LaurelLeaf } from '@/composites/play/skin/laurel/LaurelLeaf'
import { shadeUrl } from '@/composites/play/skin/laurel/LaurelDefs'
import { sparklePath, wreathOf } from '@/core/lib/play/laurel'
import type { LeafPair } from '@/core/lib/play/laurel'
import { LAUREL } from '@/declarations/play/laurel'

export interface LaurelWreathProps {
  stage: number
  id: string
  rich: boolean
  // Silhouette only, for the light sweep
  flat?: boolean
}

interface PairProps extends LaurelWreathProps {
  pair: LeafPair
}

/**
 * Two leaves, berry and glint of one slot
 * @param {PairProps} props - Slot and paint
 * @return {JSX.Element}
 */

const LaurelPair = ({ pair, stage, id, rich, flat }: PairProps) => {
  const moving = rich && stage >= LAUREL.from.sway
  const delay = (extra: number) => (moving ? pair.slot * LAUREL.stagger + extra : undefined)
  const place = { x: pair.x, y: pair.y, rich, flat }

  return (
    <>
      <LaurelLeaf
        {...place}
        rotation={pair.direction + LAUREL.spread}
        length={pair.length * LAUREL.innerRatio}
        fill={shadeUrl(id, pair.inner)}
        delay={delay(0.2)}
      />
      <LaurelLeaf
        {...place}
        rotation={pair.direction - LAUREL.spread}
        length={pair.length}
        fill={shadeUrl(id, pair.outer)}
        delay={delay(0)}
      />
      {!flat && pair.berry && (
        <circle
          cx={pair.berry[0]}
          cy={pair.berry[1]}
          r={LAUREL.berry.radius}
          className="laurel-berry"
        />
      )}
      {!flat && rich && pair.glint && (
        <path
          d={sparklePath(pair.glint[0], pair.glint[1], LAUREL.glint.size)}
          className="laurel-twinkle"
          style={{ animationDelay: `${(pair.slot * LAUREL.stagger) % 2.4}s` }}
        />
      )}
    </>
  )
}

/**
 * Both branches of the laurel
 * @param {LaurelWreathProps} props - Stage and paint
 * @return {JSX.Element | null}
 */

export const LaurelWreath = (props: LaurelWreathProps) => {
  const wreath = wreathOf(props.stage)

  if (!wreath) return null

  const half = (
    <>
      {!props.flat && <path d={wreath.stem} className="laurel-stem" />}
      {wreath.pairs.map((pair) => (
        <LaurelPair key={pair.slot} pair={pair} {...props} />
      ))}
      <LaurelLeaf
        {...wreath.tip}
        fill={shadeUrl(props.id, 'new')}
        rich={props.rich}
        flat={props.flat}
        delay={props.rich && props.stage >= LAUREL.from.sway ? 0 : undefined}
      />
    </>
  )

  return (
    <>
      <g>{half}</g>
      <g transform={`translate(${LAUREL.view} 0) scale(-1 1)`}>{half}</g>
    </>
  )
}
