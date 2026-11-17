'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { FloatingLayer } from '@/components/structures/overlays/FloatingLayer'
import { AvailabilityMark } from '@/composites/shell/account/AvailabilityMark'
import { AvailabilityPicker } from '@/composites/shell/account/AvailabilityPicker'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { availabilityOf } from '@/declarations/system/availability'
import { AVAILABILITY_PICKER as STYLES } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'
import { FLYOUT_WIDTH, flyoutPosition } from '@/utils/flyout'

// Pause before the side menu leaves, so the pointer can cross the gap
const LEAVE_DELAY_MS = 160

/**
 * Current status on one row with a caret, the choices opening beside it like Discord
 * @param {Object} props - Menu
 * @param {string} [props.rowClassName] - Row style
 * @param {string} [props.optionClassName] - Choice style
 * @return {JSX.Element | null}
 */

export const AvailabilityMenu = ({
  rowClassName,
  optionClassName,
}: {
  rowClassName?: string
  optionClassName?: string
}) => {
  const { session } = useAuthContext()
  const [place, setPlace] = useState<{ left: number; top: number } | null>(null)
  const row = useRef<HTMLButtonElement>(null)
  const timer = useRef(0)
  const Caret = ICONS.next

  const shut = useCallback(() => setPlace(null), [])
  const open = () => {
    window.clearTimeout(timer.current)
    if (row.current) {
      setPlace(
        flyoutPosition(row.current.getBoundingClientRect(), window.innerWidth, window.innerHeight)
      )
    }
  }
  const leave = () => {
    timer.current = window.setTimeout(shut, LEAVE_DELAY_MS)
  }

  useOutsideDismiss(place !== null, row, shut)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!session) return null

  const current = availabilityOf(session.availability)

  return (
    <div className={STYLES.menu}>
      <button
        ref={row}
        type="button"
        aria-haspopup="menu"
        aria-expanded={place !== null}
        onClick={open}
        onMouseEnter={open}
        onMouseLeave={leave}
        className={cn(rowClassName ?? STYLES.option, place && STYLES.optionActive)}
      >
        <AvailabilityMark value={current.value} className={STYLES.mark} />
        <span className={STYLES.rowLabel}>{current.label}</span>
        <Caret className={STYLES.caret} aria-hidden="true" />
      </button>
      {place && (
        <FloatingLayer>
          <div
            role="menu"
            className={STYLES.flyout}
            style={{ ...place, width: FLYOUT_WIDTH }}
            onMouseEnter={() => window.clearTimeout(timer.current)}
            onMouseLeave={leave}
          >
            <AvailabilityPicker optionClassName={optionClassName} onChosen={shut} />
          </div>
        </FloatingLayer>
      )}
    </div>
  )
}
