/**
 * Draw a letter not used yet
 * @param {string[]} allowed - Letters picked by the host
 * @param {string[]} used - Letters already drawn
 * @param {() => number} [random] - Random source
 * @return {string} - Letter
 */

export const drawLetter = (
  allowed: string[],
  used: string[],
  random: () => number = Math.random
): string => {
  const fresh = allowed.filter((letter) => !used.includes(letter))
  const pool = fresh.length ? fresh : allowed

  return pool[Math.floor(random() * pool.length)]
}
