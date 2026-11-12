import type { GearSpec } from '@/utils/pwa/gearPath'

/**
 * The three broken gears of the offline page
 * @type {GearSpec[]}
 */

export const OFFLINE_GEARS: GearSpec[] = [
  {
    key: 'main',
    x: 160,
    y: 104,
    tilt: -8,
    outer: 74,
    inner: 58,
    hole: 20,
    teeth: 10,
    missing: 2,
    fill: 'var(--color-brand-600, #d9668f)',
    crack: 'M10 -14 L24 -26 L20 -38 L38 -48 L34 -62 L50 -72',
  },
  {
    key: 'left',
    x: 52,
    y: 146,
    tilt: 14,
    outer: 38,
    inner: 29,
    hole: 10,
    teeth: 8,
    missing: 5,
    fill: 'var(--color-ink-subtle, #8a7f84)',
    crack: 'M-6 6 L-14 14 L-10 22 L-22 30',
  },
  {
    key: 'right',
    x: 268,
    y: 62,
    tilt: -20,
    outer: 38,
    inner: 29,
    hole: 10,
    teeth: 8,
    missing: 1,
    fill: 'var(--color-ink-subtle, #8a7f84)',
    crack: 'M6 -6 L14 -14 L10 -22 L22 -30',
  },
]
