import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'

/**
 * First visible element carrying a beacon
 * @param {string} beacon - Beacon name
 * @return {HTMLElement | null} - Element or null
 */

export const findVisibleBeacon = (beacon: string): HTMLElement | null =>
  [...document.querySelectorAll<HTMLElement>(`[${BEACON_ATTRIBUTE}="${beacon}"]`)].find((node) => {
    const box = node.getBoundingClientRect()

    return box.width > 0 && box.height > 0
  }) ?? null
