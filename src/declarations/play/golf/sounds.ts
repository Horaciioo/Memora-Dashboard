import type { GolfEventKind } from '@/core/lib/play/golf/types'
import type { PlayTone } from '@/core/lib/play/sounds'

/**
 * Synthesised sounds of the golf course, made here and free of rights
 * @type {Record<GolfEventKind | 'power' | 'start', PlayTone[]>}
 */

export const GOLF_SOUNDS: Record<GolfEventKind | 'power' | 'start', PlayTone[]> = {
  hit: [
    { wave: 'noise', from: 0, seconds: 0.05, gain: 0.5, filter: 2400 },
    { wave: 'sine', from: 900, to: 380, seconds: 0.08, gain: 0.55 },
  ],
  wall: [{ wave: 'triangle', from: 320, to: 170, seconds: 0.08, gain: 0.45 }],
  ball: [{ wave: 'sine', from: 1300, to: 760, seconds: 0.06, gain: 0.5 }],
  bumper: [
    { wave: 'square', from: 420, to: 900, seconds: 0.14, gain: 0.18 },
    { wave: 'sine', from: 260, to: 620, seconds: 0.16, gain: 0.4 },
  ],
  spinner: [{ wave: 'triangle', from: 240, to: 150, seconds: 0.1, gain: 0.4 }],
  cup: [
    { wave: 'noise', from: 0, seconds: 0.06, gain: 0.25, filter: 1200 },
    { wave: 'sine', from: 660, seconds: 0.1, delay: 0.08, gain: 0.4 },
    { wave: 'sine', from: 880, seconds: 0.12, delay: 0.18, gain: 0.4 },
    { wave: 'sine', from: 1320, seconds: 0.3, delay: 0.3, gain: 0.35 },
  ],
  lip: [{ wave: 'sine', from: 520, to: 300, seconds: 0.12, gain: 0.4 }],
  fall: [{ wave: 'sine', from: 700, to: 110, seconds: 0.6, gain: 0.35 }],
  splash: [
    { wave: 'noise', from: 0, seconds: 0.45, gain: 0.45, filter: 900 },
    { wave: 'sine', from: 300, to: 120, seconds: 0.2, gain: 0.3 },
  ],
  orb: [
    { wave: 'sine', from: 880, to: 1760, seconds: 0.16, gain: 0.35 },
    { wave: 'triangle', from: 1320, seconds: 0.14, delay: 0.09, gain: 0.3 },
  ],
  power: [
    { wave: 'square', from: 440, to: 660, seconds: 0.1, gain: 0.15 },
    { wave: 'sine', from: 880, seconds: 0.18, delay: 0.1, gain: 0.35 },
  ],
  start: [
    { wave: 'sine', from: 523, seconds: 0.12, gain: 0.35 },
    { wave: 'sine', from: 784, seconds: 0.22, delay: 0.12, gain: 0.35 },
  ],
}
