/**
 * Sunset links of the Golf hub, card and tile
 * Drawn on a 1600 by 900 stage, cropped per frame
 * @type {object}
 */

export const GOLF_BANNER = {
  sun: { x: 1240, y: 560, r: 150 },
  // Dune ridges, far to front, each closed down to the bottom edge
  dunes: [
    {
      token: '--golf-dune-far',
      d: 'M0 560C160 520 300 540 420 515S700 470 860 500 1150 540 1300 505 1520 470 1600 490V900H0Z',
    },
    {
      token: '--golf-dune-mid',
      d: 'M0 620C140 600 260 580 400 600S640 650 820 610 1080 560 1220 600 1480 640 1600 615V900H0Z',
    },
    {
      token: '--golf-dune-near',
      d: 'M0 700C180 690 320 660 520 680S860 730 1040 690 1300 650 1420 672 1560 690 1600 684V900H0Z',
    },
    {
      token: '--golf-dune-front',
      d: 'M0 790C220 770 420 800 620 785S1000 750 1200 780 1480 820 1600 800V900H0Z',
    },
  ],
  // Grass blades on the front ridge
  tufts: [80, 190, 330, 470, 610, 760, 930, 1090, 1260, 1390, 1530],
  flag: { x: 1160, y: 612 },
  // Ball flight from off screen to the green
  flight: 'M120 900Q620 -40 1150 600',
  // Seconds of one shot
  cycle: 9,
  frames: {
    banner: { viewBox: '0 0 1600 900' },
    card: { viewBox: '760 100 600 800' },
    tile: { viewBox: '420 300 1180 590' },
  },
} as const
