export interface RampStopsProps {
  colours: (string | undefined)[]
}

/**
 * Evenly spaced gradient stops, the middle one optional
 * @param {RampStopsProps} props - Colours from start to end
 * @return {JSX.Element[]}
 */

export const RampStops = ({ colours }: RampStopsProps) => {
  const stops = colours.filter((colour): colour is string => Boolean(colour))

  return stops.map((colour, index) => (
    <stop key={colour} offset={index / (stops.length - 1)} stopColor={colour} />
  ))
}
