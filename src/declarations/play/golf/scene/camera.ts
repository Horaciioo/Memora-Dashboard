/**
 * Shots, panorama and map layout, sizes in metres
 * @type {Object}
 */

export const GOLF_SCENE_CAMERA = {
  // Course thumbnails: pixels, frames drawn before the grab, jpeg quality
  shot: { width: 480, height: 480, frames: 4, quality: 0.85 },
  // Hub backdrop: seconds per course, crossfade, pixel ratio, view angles and sway, push-in, fog in multiples of distance
  panorama: {
    seconds: 10,
    fadeMs: 1800,
    dpr: 0.55,
    fov: 34,
    pitch: 0.7,
    yaw: 0.5,
    zoom: 0.36,
    // Share of extra distance at the start, eased out over the seconds a course stays
    push: 0.2,
    swing: 0.18,
    swingSpeed: 0.07,
    far: 6,
    fogNear: 1.1,
    fogFar: 3,
  },
  // End of a hole, seconds then metres: ready sound, framing, hop, flight to the next tee
  transition: {
    prep: 0.3,
    gather: 0.6,
    bounce: 0.5,
    // Delay between two players' hops
    stagger: 0.03,
    fly: 1.1,
    hop: 0.35,
    arc: 2.2,
    // Framing of the balls, spread multiple and floor
    reach: 1.8,
    minReach: 6,
    // Course change in a tournament: the view climbs this many times higher
    climb: 2.5,
  },
  // Holes of a course chained cup to tee, metres, then headings tried in degrees
  map: {
    gap: 3,
    // Slab clearance between chained holes, smaller than the old packing gap
    chainGap: 1.5,
    step: 0.5,
    maxReach: 80,
    turns: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
  },
} as const
