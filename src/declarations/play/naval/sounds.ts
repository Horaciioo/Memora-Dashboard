/**
 * Tuning of the naval sound design, every sound is synthesized
 * @type {Object}
 */

export const NAVAL_SOUND = {
  // Voices playing at once, UI ticks give way first
  maxVoices: 12,
  // Master gain over the Play level
  gain: 1.7,
  // Share of the master heard in the reverb
  reverbSend: 0.22,
  // Seconds of the reverb tail
  reverbSeconds: 2.4,
  // Whistle of a shell, in Hz at launch and at impact
  whistle: { from: 2300, to: 520, ownShare: 0.4 },
  // Sea bed and tension drone levels
  ambience: { sea: 0.16, tension: 0.34 },
  // Notes of the victory fanfare, in Hz
  fanfare: [261.6, 329.6, 392, 523.3],
  // Notes of the defeat motif, in Hz
  lament: [220, 196, 174.6, 164.8],
} as const

/**
 * Sound cue names, for the tests and the switches
 * @type {readonly string[]}
 */

export const NAVAL_CUES = [
  'whistle',
  'explosion',
  'splash',
  'hit',
  'sunk',
  'eliminated',
  'victory',
  'defeat',
  'sonar',
  'tick',
  'place',
  'ready',
] as const
