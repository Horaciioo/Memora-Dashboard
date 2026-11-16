import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'
import { useAnimatedKm } from '@/composites/play/stopgo/board/useAnimatedKm'
import type { StopGoMark } from '@/composites/play/stopgo/fx/useStopGoFx'
import { useStopGoAimStore } from '@/core/store/play/stopgoAim'
import { pointAt } from '@/core/lib/play/stopgo'
import type { StopGoTrackPlan } from '@/core/lib/play/stopgo'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'
import { STOPGO_BOARD_COPY } from '@/declarations/play/stopgo/track'
import { initialsOf } from '@/utils/format/initials'

export interface StopGoCarProps {
  accountId: string
  plan: StopGoTrackPlan
  lane: number
  km: number
  color: StopGoCarColor
  name: string
  avatarUrl: string | null
  hasLeft: boolean
  // Moment the car is living
  mark?: StopGoMark
}

// Car and portrait scale
const SCALE = 1.6
const PORTRAIT = 13
const RING = 34

/**
 * Car on its road, glides along the track and wears the portrait of its driver
 * @param {StopGoCarProps} props - Car
 * @return {JSX.Element}
 */

export const StopGoCar = ({
  accountId,
  plan,
  lane,
  km,
  color,
  name,
  avatarUrl,
  hasLeft,
  mark,
}: StopGoCarProps) => {
  const { x, y, heading } = pointAt(plan, useAnimatedKm(km), lane)
  const clip = `stopgo-portrait-${lane}`
  const tap = useStopGoAimStore((state) => state.tap)
  const isAimable = useStopGoAimStore((state) => state.aimable.includes(accountId))
  const isPicked = useStopGoAimStore((state) => state.picked.includes(accountId))

  return (
    <g
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
      style={hasLeft ? { opacity: 0.45, filter: 'grayscale(1)' } : undefined}
      data-stopgo-car={accountId}
    >
      <title>{hasLeft ? `${name} · ${STOPGO_BOARD_COPY.left}` : name}</title>
      {mark && (
        <circle
          key={`ring-${mark.key}`}
          r={RING}
          className={`stopgo-fx-ring stopgo-fx-${mark.kind}`}
          style={{ animationDelay: `${mark.delayMs}ms` }}
        />
      )}
      <g
        key={mark?.kind === 'hit' ? `shake-${mark.key}` : 'still'}
        className={mark?.kind === 'hit' ? 'stopgo-fx-shake' : undefined}
        style={mark?.kind === 'hit' ? { animationDelay: `${mark.delayMs}ms` } : undefined}
      >
        <g transform={`rotate(${heading.toFixed(1)}) scale(${SCALE})`}>
          <StopGoCarShape color={color} />
        </g>
      </g>
      <clipPath id={clip}>
        <circle r={PORTRAIT} />
      </clipPath>
      <circle r={PORTRAIT + 3} fill="white" />
      {avatarUrl ? (
        <image
          href={avatarUrl}
          x={-PORTRAIT}
          y={-PORTRAIT}
          width={PORTRAIT * 2}
          height={PORTRAIT * 2}
          clipPath={`url(#${clip})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <>
          <circle r={PORTRAIT} style={{ fill: `var(--stopgo-car-${color})` }} />
          <text textAnchor="middle" y="6" fontSize="16" fontWeight="900" fill="white">
            {initialsOf(name)}
          </text>
        </>
      )}
      {isAimable && tap && (
        <circle
          r={RING + 8}
          role="button"
          tabIndex={0}
          aria-label={name}
          aria-pressed={isPicked}
          className={isPicked ? 'stopgo-car-aim stopgo-car-aim-on' : 'stopgo-car-aim'}
          onClick={() => tap(accountId)}
          onKeyDown={(event) => event.key === 'Enter' && tap(accountId)}
        />
      )}
    </g>
  )
}
