/**
 * Item laid by minutes
 * @typedef {Object} TimedItem
 * @property {number} startMinute - Opening minute
 * @property {number} endMinute - Closing minute
 */

interface TimedItem {
  startMinute: number
  endMinute: number
}

/**
 * Item with its lane
 * @typedef {Object} Placed
 * @property {TItem} item - Placed item
 * @property {number} lane - Its column
 * @property {number} lanes - Cluster width
 */

export interface Placed<TItem> {
  item: TItem
  lane: number
  lanes: number
}

/**
 * Side by side lanes for overlaps
 * @param {TItem[]} items - One day items
 * @return {Placed<TItem>[]} - Items with lanes
 */

export const placeInLanes = <TItem extends TimedItem>(items: TItem[]): Placed<TItem>[] => {
  const sorted = [...items].sort(
    (first, second) => first.startMinute - second.startMinute || first.endMinute - second.endMinute
  )

  const placed: Placed<TItem>[] = []
  let cluster: Placed<TItem>[] = []
  let laneEnds: number[] = []
  let clusterEnd = -1

  // Cluster width once closed
  const closeCluster = () => {
    cluster.forEach((entry) => {
      entry.lanes = laneEnds.length
    })
    cluster = []
    laneEnds = []
  }

  sorted.forEach((item) => {
    if (item.startMinute >= clusterEnd) closeCluster()

    // First free lane
    const free = laneEnds.findIndex((end) => end <= item.startMinute)
    const lane = free === -1 ? laneEnds.length : free
    const entry: Placed<TItem> = { item, lane, lanes: 1 }

    laneEnds[lane] = item.endMinute
    cluster.push(entry)
    placed.push(entry)
    clusterEnd = Math.max(clusterEnd, item.endMinute)
  })

  closeCluster()

  return placed
}
