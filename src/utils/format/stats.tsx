import React, { JSX } from 'react'

/**
 * Format stats value
 * @param {number} value - Numeric value
 * @return {JSX.Element} - Styled value element
 */

export function formatStatsValue(value: number): JSX.Element {
  // Format value
  const formattedValue = value.toLocaleString().replace(/,/g, '')

  // Negative value
  if (value < 0) {
    return <h1 className="font-medium text-[#FC4D4D]">↓ {formattedValue}</h1>
  }

  // Zero value
  if (value === 0) {
    return <h1 className="font-medium text-[#958FB8]">~ {formattedValue}</h1>
  }

  // Positive value
  return <h1 className="font-medium text-[#27BD6C]">↑ {formattedValue}</h1>
}
