'use client'

import { Button } from '@/components/elements/actions/Button'
import { TourBubble } from '@/composites/tour/TourBubble'
import { TourSpotlight } from '@/composites/tour/TourSpotlight'
import { useBeaconRect } from '@/core/hooks/interaction/useBeaconRect'
import { HOME_BEACON, routeBeacon } from '@/declarations/ui/beacons'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { useTour } from '@/managers/front-end/TourManager'

export interface RailPointerProps {
  route: string
  // Name of the page in the rail
  label: string
}

/**
 * Lights the next page in the menu and waits for the click
 * @param {RailPointerProps} props - Page waiting
 * @return {JSX.Element}
 */

export const RailPointer = ({ route, label }: RailPointerProps) => {
  const { skip } = useTour()
  const target = useBeaconRect(routeBeacon(route))
  // A page that took the menu over leaves only its way back to the home
  const back = useBeaconRect(target.isAbsent ? HOME_BEACON : null)
  const rect = target.rect ?? back.rect
  const body = target.isAbsent && back.rect ? TOUR_COPY.pointerBackBody : TOUR_COPY.pointerBody

  return (
    <>
      {rect && <TourSpotlight rect={rect} isInteractive />}
      <TourBubble
        rect={rect}
        title={TOUR_COPY.pointerTitle.replace('{label}', label)}
        body={body.replace('{label}', label)}
      >
        <Button variant="ghost" onClick={skip}>
          {TOUR_COPY.skipTour}
        </Button>
      </TourBubble>
    </>
  )
}
