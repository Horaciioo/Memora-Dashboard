// Seconds in a minute
const MINUTE = 60

/**
 * Minutes and seconds of a length
 * @param {number} seconds - Length
 * @return {string} - Clock reading
 */

export const clockText = (seconds: number): string => {
  const whole = Math.max(0, Math.ceil(seconds))

  return `${Math.floor(whole / MINUTE)}:${String(whole % MINUTE).padStart(2, '0')}`
}
