// Read by the seed on plain node
const MINUTES: Record<string, number> = {
  minute: 1,
  minutes: 1,
  heure: 60,
  heures: 60,
  jour: 1440,
  jours: 1440,
}

/**
 * How hot a sanction is, from the coldest (0, a removal) to the hottest (5, a ban). A note that
 * is not a sanction has no heat
 * @param {string} measure - Name of the measure as the panel writes it
 * @return {number | null} - Heat from 0 to 5, or null
 */

export const heatOf = (measure: string): number | null => {
  if (/^bannissement/i.test(measure)) return 5
  if (/^avertissement/i.test(measure)) return 1
  if (/^(suppression|aucune action)/i.test(measure)) return 0

  const timeout = /^TO : (\d+) (minutes?|heures?|jours?)$/i.exec(measure)
  if (!timeout) return null

  const minutes = Number(timeout[1]) * MINUTES[timeout[2]!.toLowerCase()]!

  // Up to an hour, up to a day, longer
  return minutes <= 60 ? 2 : minutes <= 1440 ? 3 : 4
}
