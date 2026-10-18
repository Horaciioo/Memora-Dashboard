/**
 * Round a maximum up to a readable ceiling
 * @param {number} value - Largest value
 * @return {number} - Ceiling
 */

export const niceCeiling = (value: number): number => {
  if (value <= 4) return Math.max(1, Math.ceil(value))

  const step = 10 ** Math.floor(Math.log10(value))
  const unit = [1, 2, 5, 10].find((candidate) => candidate * step >= value) ?? 10

  return unit * step
}

/**
 * Line path through values spread across the width
 * @param {number[]} values - Y values
 * @param {number} ceiling - Y maximum
 * @param {number} width - Viewbox width
 * @param {number} height - Viewbox height
 * @return {string} - Path data
 */

export const linePath = (
  values: number[],
  ceiling: number,
  width: number,
  height: number
): string =>
  values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width
      const y = height - (value / ceiling) * height

      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
