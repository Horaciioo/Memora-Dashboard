// Frame drawn on a 200 square, the portrait hexagon at its centre
export const FRAME_GEOMETRY = {
  size: 200,
  centre: 100,
  // Portrait hexagon radius, the share of the box its height takes is 2 * this / size
  face: 54,
  // Metal ring around it
  ring: 58,
  ringWidth: 8,
  // Where leaves sit and how they open
  leafRadius: 73,
  leafFrom: 112,
  leafStep: 20,
  leafTilt: 28,
  leafScale: 0.95,
  // Pointed leaf from its stem, 24 long, with its veins
  leaf: 'M0 0 C4 -3.6 14 -5 24 0 C14 5 4 3.6 0 0Z',
  vein: 'M1 0 L21 0 M5 0 L9.5 -2.8 M5 0 L9.5 2.8 M10 0 L14.5 -3 M10 0 L14.5 3 M14.5 0 L18.5 -2.4 M14.5 0 L18.5 2.4',
  // Piece under the bottom point
  chin: 'M85 159 L115 159 L107 175 L93 175 Z',
  // Light arch over the top
  archRadius: 67,
  archWidth: 3,
  // Stars under the frame
  starY: 186,
  starGap: 17,
  starRadius: 7,
} as const
