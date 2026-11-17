// Frame drawn on a 240 square, the portrait hexagon at its centre
export const FRAME_GEOMETRY = {
  size: 240,
  centre: 120,
  // Portrait hexagon radius, the share of the box its height takes is 2 * this / size
  face: 54,
  // Hexagon radii, outside in: line ring, metal, bevel, hollow, hollow line, portrait edge
  ringOuter: 87,
  ringLine: 84,
  metal: 74,
  bevel: 70,
  hollow: 63,
  hollowLine: 58,
  // Wing root and crest root from the centre
  wingRoot: { x: 52, y: 38 },
  crestRoot: { x: 10, y: -68 },
  // Level medal sits on the lower frame, above its point
  medal: { radius: 23, inner: 19, y: 62 },
  gem: { y: -92 },
  studRadius: 3.6,
  // Sparkles: x, y from the centre, size, delay
  sparks: [
    [-68, -46, 5, 0],
    [70, -50, 4.5, 0.8],
    [94, 22, 4, 1.5],
    [-94, 16, 4, 0.4],
    [0, -86, 5, 1.1],
    [-58, 58, 4, 1.9],
    [60, 60, 4.5, 0.6],
  ],
  halo: 98,
} as const
