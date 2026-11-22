/**
 * Spiral sketchbook of the Croquis hub, card and tile
 * @type {object}
 */

export const CROQUIS_BANNER = {
  // Rocket drawn live, one pen path around 0 0
  rocket:
    'M0 -120C40 -80 50 -10 40 60H-40C-50 -10 -40 -80 0 -120ZM18 -40A18 18 0 1 1 -18 -40A18 18 0 1 1 18 -40ZM-40 24L-78 82L-40 62M40 24L78 82L40 62M-22 62Q-12 120 0 92Q12 120 22 62',
  // Doodles already on the page
  sun: 'M0 -34A34 34 0 1 1 0 34A34 34 0 1 1 0 -34ZM0 -52V-70M37 -37L50 -50M52 0H70M37 37L50 50M0 52V70M-37 37L-50 50M-52 0H-70M-37 -37L-50 -50',
  star: 'M0 -26L7 -8L26 -8L11 4L17 23L0 12L-17 23L-11 4L-26 -8L-7 -8Z',
  cloud:
    'M-60 10C-80 10 -80 -20 -58 -20C-56 -44 -20 -48 -10 -28C0 -50 40 -46 40 -20C64 -22 70 10 46 10Z',
  // Spiral loop spacing along the top
  loop: 46,
  // Seconds to draw, to admire, then to erase
  cycle: 16,
  drawn: 0.62,
  frames: {
    banner: {
      rocket: { x: 1260, y: 470, scale: 2.2 },
      sun: { x: 250, y: 230, scale: 1.4 },
      star: { x: 1490, y: 170, scale: 1 },
      cloud: { x: 230, y: 700, scale: 1.3 },
    },
    card: {
      rocket: { x: 200, y: 290, scale: 1.2 },
      sun: { x: 80, y: 120, scale: 0.7 },
      star: { x: 300, y: 110, scale: 0.7 },
      cloud: { x: 90, y: 410, scale: 0.6 },
    },
    tile: {
      rocket: { x: 500, y: 180, scale: 0.95 },
      sun: { x: 330, y: 90, scale: 0.6 },
      star: { x: 600, y: 70, scale: 0.5 },
      cloud: { x: 340, y: 250, scale: 0.55 },
    },
  },
} as const
