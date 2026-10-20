import { instantToWall, wallToInstant } from '@/utils/format/zone'

// Last millisecond of the final minute
const END_OF_MINUTE = 59_999

/**
 * Stretch a span over the whole days it touches
 * @param {Date} startsAt - First moment
 * @param {Date | null} endsAt - Last moment
 * @return {{ startsAt: Date, endsAt: Date }} - Midnight to the end of the last day
 */

export const wholeDays = (
  startsAt: Date,
  endsAt: Date | null
): { startsAt: Date; endsAt: Date } => {
  const first = instantToWall(startsAt).slice(0, 10)
  const last = instantToWall(endsAt ?? startsAt).slice(0, 10)

  return {
    startsAt: wallToInstant(`${first}T00:00`),
    endsAt: new Date(wallToInstant(`${last}T23:59`).getTime() + END_OF_MINUTE),
  }
}
