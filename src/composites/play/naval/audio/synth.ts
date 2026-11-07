import { outputOf } from '@/composites/play/naval/audio/bus'
import type { NavalBus } from '@/composites/play/naval/audio/bus'
import { NAVAL_SOUND } from '@/declarations/play/naval/sounds'

// Floor of an exponential ramp
const SILENT = 0.0001

/**
 * Voice settings
 * @typedef {Object} VoiceOptions
 * @property {number} level - Gain
 * @property {number} [pan] - Left to right, minus one to one
 */

export interface VoiceOptions {
  level: number
  pan?: number
}

// Soft clipping curve, blasts get their punch
const PUNCH = (() => {
  const curve = new Float32Array(256)
  for (let index = 0; index < curve.length; index += 1) {
    curve[index] = Math.tanh(((index / 255) * 2 - 1) * 3)
  }

  return curve
})()

/**
 * Attack then decay on a gain
 * @param {AudioParam} param - Gain
 * @param {Object} shape - Envelope
 * @param {number} shape.at - Start time
 * @param {number} shape.peak - Top level
 * @param {number} shape.attack - Seconds up
 * @param {number} shape.decay - Seconds down
 * @return {void}
 */

const envelope = (
  param: AudioParam,
  { at, peak, attack, decay }: { at: number; peak: number; attack: number; decay: number }
): void => {
  param.setValueAtTime(SILENT, at)
  param.exponentialRampToValueAtTime(Math.max(SILENT, peak), at + attack)
  param.exponentialRampToValueAtTime(SILENT, at + attack + decay)
}

/**
 * Noise voice
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {number} seconds - Length
 * @return {AudioBufferSourceNode} - Source
 */

const noiseOf = (bus: NavalBus, at: number, seconds: number): AudioBufferSourceNode => {
  const source = bus.context.createBufferSource()
  source.buffer = bus.noise
  source.loop = true
  source.start(at, Math.random() * 1.5)
  source.stop(at + seconds)

  return source
}

/**
 * Tone voice
 * @param {NavalBus} bus - Bus
 * @param {Object} tone - Tone
 * @param {OscillatorType} tone.type - Wave
 * @param {number} tone.at - Start time
 * @param {number} tone.seconds - Length
 * @return {OscillatorNode} - Oscillator
 */

const toneOf = (
  bus: NavalBus,
  { type, at, seconds }: { type: OscillatorType; at: number; seconds: number }
): OscillatorNode => {
  const oscillator = bus.context.createOscillator()
  oscillator.type = type
  oscillator.start(at)
  oscillator.stop(at + seconds)

  return oscillator
}

/**
 * Filter on a voice
 * @param {NavalBus} bus - Bus
 * @param {BiquadFilterType} type - Kind
 * @param {number} frequency - Hz
 * @param {number} [quality] - Q
 * @return {BiquadFilterNode} - Filter
 */

const filterOf = (
  bus: NavalBus,
  type: BiquadFilterType,
  frequency: number,
  quality = 0.7
): BiquadFilterNode => {
  const filter = bus.context.createBiquadFilter()
  filter.type = type
  filter.frequency.value = frequency
  filter.Q.value = quality

  return filter
}

/**
 * Gain with an envelope
 * @param {NavalBus} bus - Bus
 * @param {Parameters<typeof envelope>[1]} shape - Envelope
 * @return {GainNode} - Gain
 */

const shaped = (bus: NavalBus, shape: Parameters<typeof envelope>[1]): GainNode => {
  const gain = bus.context.createGain()
  envelope(gain.gain, shape)

  return gain
}

/**
 * Shell flying in: a whistle that sinks in pitch, swells and swings to the centre
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {Object} flight - Flight
 * @param {number} flight.seconds - Seconds until impact
 * @param {number} flight.level - Gain
 * @param {number} flight.side - Side it comes from, minus one or one
 * @return {void}
 */

export const whistle = (
  bus: NavalBus,
  at: number,
  { seconds, level, side }: { seconds: number; level: number; side: number }
): void => {
  const { context } = bus
  const { from, to } = NAVAL_SOUND.whistle
  const gain = context.createGain()
  const panner = context.createStereoPanner()
  gain.connect(panner)
  panner.connect(bus.dry)
  const send = context.createGain()
  send.gain.value = 0.2
  panner.connect(send).connect(bus.wet)
  panner.pan.setValueAtTime(side * 0.85, at)
  panner.pan.linearRampToValueAtTime(0, at + seconds)

  // Swell to the impact, then cut
  gain.gain.setValueAtTime(SILENT, at)
  gain.gain.exponentialRampToValueAtTime(level, at + seconds * 0.92)
  gain.gain.linearRampToValueAtTime(level * 1.1, at + seconds)
  gain.gain.linearRampToValueAtTime(0, at + seconds + 0.03)

  // Two tones an octave apart, gliding down with a shiver
  const air = filterOf(bus, 'lowpass', 900)
  air.frequency.setValueAtTime(900, at)
  air.frequency.exponentialRampToValueAtTime(7500, at + seconds)
  air.connect(gain)
  for (const [ratio, share] of [
    [1, 0.9],
    [0.5, 0.35],
  ] as const) {
    const tone = toneOf(bus, {
      type: ratio === 1 ? 'sine' : 'triangle',
      at,
      seconds: seconds + 0.05,
    })
    tone.frequency.setValueAtTime(from * ratio, at)
    tone.frequency.exponentialRampToValueAtTime(to * ratio, at + seconds)
    const part = context.createGain()
    part.gain.value = share
    tone.connect(part).connect(air)
    if (ratio === 1) {
      const shiver = toneOf(bus, { type: 'sine', at, seconds: seconds + 0.05 })
      shiver.frequency.value = 7
      const depth = context.createGain()
      depth.gain.value = 22
      shiver.connect(depth).connect(tone.frequency)
    }
  }

  // Air tearing past
  const hiss = noiseOf(bus, at, seconds + 0.05)
  const band = filterOf(bus, 'bandpass', from * 1.3, 5)
  band.frequency.setValueAtTime(from * 1.3, at)
  band.frequency.exponentialRampToValueAtTime(to * 1.3, at + seconds)
  const hissGain = context.createGain()
  hissGain.gain.value = 0.55
  hiss.connect(band).connect(hissGain).connect(air)
}

/**
 * Blast: crack, body, deep thump and a rumble that dies in the reverb
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions & { power: number }} blast - Blast
 * @return {void}
 */

export const explosion = (
  bus: NavalBus,
  at: number,
  { level, pan = 0, power }: VoiceOptions & { power: number }
): void => {
  const out = outputOf(bus, level, 0.7, pan)

  // Body, a noise burst closing down
  const body = noiseOf(bus, at, 2)
  const close = filterOf(bus, 'lowpass', 1400 + 5200 * power)
  close.frequency.setValueAtTime(1400 + 5200 * power, at)
  close.frequency.exponentialRampToValueAtTime(110, at + 1.7)
  body
    .connect(close)
    .connect(shaped(bus, { at, peak: 0.9 * power, attack: 0.006, decay: 1.5 }))
    .connect(out)

  // Thump, a sine falling through a soft clipper
  const thump = toneOf(bus, { type: 'sine', at, seconds: 1 })
  thump.frequency.setValueAtTime(140, at)
  thump.frequency.exponentialRampToValueAtTime(30, at + 0.5)
  const clip = bus.context.createWaveShaper()
  clip.curve = PUNCH
  thump
    .connect(shaped(bus, { at, peak: 1.1 * power, attack: 0.004, decay: 0.85 }))
    .connect(clip)
    .connect(out)

  // Crack on top
  const crack = noiseOf(bus, at, 0.12)
  crack
    .connect(filterOf(bus, 'highpass', 1800))
    .connect(shaped(bus, { at, peak: 0.8 * power, attack: 0.002, decay: 0.09 }))
    .connect(out)

  // Rumble underneath
  const rumble = noiseOf(bus, at, 2.4)
  rumble
    .connect(filterOf(bus, 'lowpass', 90))
    .connect(shaped(bus, { at: at + 0.02, peak: 0.9 * power, attack: 0.08, decay: 2 }))
    .connect(out)
}

/**
 * Shell in the water: a hush, droplets and a bloop
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} splash - Splash
 * @return {void}
 */

export const splash = (bus: NavalBus, at: number, { level, pan = 0 }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.35, pan)
  const water = noiseOf(bus, at, 0.9)
  const sweep = filterOf(bus, 'bandpass', 3200, 0.9)
  sweep.frequency.setValueAtTime(3200, at)
  sweep.frequency.exponentialRampToValueAtTime(700, at + 0.7)
  water
    .connect(sweep)
    .connect(shaped(bus, { at, peak: 0.6, attack: 0.015, decay: 0.7 }))
    .connect(out)

  // Droplets falling back
  for (let drop = 0; drop < 6; drop += 1) {
    const start = at + 0.06 + Math.random() * 0.5
    const blip = toneOf(bus, { type: 'sine', at: start, seconds: 0.12 })
    blip.frequency.value = 600 + Math.random() * 1100
    blip.connect(shaped(bus, { at: start, peak: 0.14, attack: 0.004, decay: 0.07 })).connect(out)
  }

  // Heavy bloop
  const bloop = toneOf(bus, { type: 'sine', at, seconds: 0.4 })
  bloop.frequency.setValueAtTime(340, at)
  bloop.frequency.exponentialRampToValueAtTime(110, at + 0.25)
  bloop.connect(shaped(bus, { at, peak: 0.4, attack: 0.01, decay: 0.25 })).connect(out)
}

/**
 * Metal ringing after a hit
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} clang - Clang
 * @return {void}
 */

export const clang = (bus: NavalBus, at: number, { level, pan = 0 }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.5, pan)
  ;[1, 2.76, 5.4, 8.93].forEach((ratio, index) => {
    const partial = toneOf(bus, { type: 'sine', at, seconds: 1.4 })
    partial.frequency.value = 380 * ratio
    partial
      .connect(
        shaped(bus, { at, peak: 0.5 / (index + 1), attack: 0.002, decay: 0.6 / (index + 1) + 0.12 })
      )
      .connect(out)
  })

  // Fire crackling after it
  for (let spark = 0; spark < 6; spark += 1) {
    const start = at + 0.08 + Math.random() * 0.9
    const burst = noiseOf(bus, start, 0.05)
    burst
      .connect(filterOf(bus, 'highpass', 3000))
      .connect(shaped(bus, { at: start, peak: 0.22, attack: 0.002, decay: 0.03 }))
      .connect(out)
  }
}

/**
 * Hull going down: groan, creak and bubbles
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} groan - Groan
 * @return {void}
 */

export const sinking = (bus: NavalBus, at: number, { level, pan = 0 }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.6, pan)
  const hull = toneOf(bus, { type: 'sawtooth', at, seconds: 2 })
  hull.frequency.setValueAtTime(96, at)
  hull.frequency.exponentialRampToValueAtTime(34, at + 1.8)
  const dark = filterOf(bus, 'lowpass', 320)
  dark.frequency.setValueAtTime(320, at)
  dark.frequency.exponentialRampToValueAtTime(110, at + 1.8)
  hull
    .connect(dark)
    .connect(shaped(bus, { at, peak: 0.6, attack: 0.12, decay: 1.7 }))
    .connect(out)

  const creak = noiseOf(bus, at, 1.5)
  const strain = filterOf(bus, 'bandpass', 520, 14)
  strain.frequency.setValueAtTime(520, at)
  strain.frequency.exponentialRampToValueAtTime(190, at + 1.3)
  creak
    .connect(strain)
    .connect(shaped(bus, { at, peak: 0.28, attack: 0.15, decay: 1.2 }))
    .connect(out)

  // Bubbles rising
  for (let bubble = 0; bubble < 9; bubble += 1) {
    const start = at + 0.3 + bubble * 0.14
    const blip = toneOf(bus, { type: 'sine', at: start, seconds: 0.12 })
    blip.frequency.setValueAtTime(400 + Math.random() * 300, start)
    blip.frequency.exponentialRampToValueAtTime(900, start + 0.07)
    blip.connect(shaped(bus, { at: start, peak: 0.2, attack: 0.005, decay: 0.08 })).connect(out)
  }
}

/**
 * Cannon at the muzzle: a thump and a roar going away
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} shot - Shot
 * @return {void}
 */

export const cannon = (bus: NavalBus, at: number, { level, pan = 0 }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.5, pan)
  const roar = noiseOf(bus, at, 0.7)
  const muffle = filterOf(bus, 'lowpass', 1500)
  muffle.frequency.setValueAtTime(1500, at)
  muffle.frequency.exponentialRampToValueAtTime(200, at + 0.5)
  roar
    .connect(muffle)
    .connect(shaped(bus, { at, peak: 0.7, attack: 0.004, decay: 0.45 }))
    .connect(out)
  const thump = toneOf(bus, { type: 'sine', at, seconds: 0.5 })
  thump.frequency.setValueAtTime(95, at)
  thump.frequency.exponentialRampToValueAtTime(38, at + 0.3)
  thump.connect(shaped(bus, { at, peak: 0.9, attack: 0.003, decay: 0.3 })).connect(out)
}

/**
 * Ship's bell tolling, then a low drone
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} bell - Bell
 * @return {void}
 */

export const bell = (bus: NavalBus, at: number, { level, pan = 0 }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.8, pan)
  for (let toll = 0; toll < 3; toll += 1) {
    const start = at + toll * 0.95
    ;[1, 2, 2.76, 5.4].forEach((ratio, index) => {
      const partial = toneOf(bus, { type: 'sine', at: start, seconds: 2.4 })
      partial.frequency.value = 196 * ratio
      partial
        .connect(
          shaped(bus, {
            at: start,
            peak: (0.55 - toll * 0.12) / (index + 1),
            attack: 0.004,
            decay: 1.9 / (index * 0.7 + 1),
          })
        )
        .connect(out)
    })
  }
  const drone = toneOf(bus, { type: 'sawtooth', at, seconds: 3.4 })
  drone.frequency.value = 55
  drone
    .connect(filterOf(bus, 'lowpass', 140))
    .connect(shaped(bus, { at, peak: 0.3, attack: 0.4, decay: 2.8 }))
    .connect(out)
}

/**
 * One brass note
 * @param {NavalBus} bus - Bus
 * @param {AudioNode} out - Output
 * @param {Object} note - Note
 * @param {number} note.at - Start time
 * @param {number} note.hertz - Pitch
 * @param {number} note.seconds - Length
 * @param {number} note.peak - Level
 * @return {void}
 */

const brass = (
  bus: NavalBus,
  out: AudioNode,
  { at, hertz, seconds, peak }: { at: number; hertz: number; seconds: number; peak: number }
): void => {
  const open = filterOf(bus, 'lowpass', 400)
  open.frequency.setValueAtTime(400, at)
  open.frequency.exponentialRampToValueAtTime(3200, at + 0.09)
  open.frequency.exponentialRampToValueAtTime(1500, at + seconds)
  const swell = bus.context.createGain()
  swell.gain.setValueAtTime(SILENT, at)
  swell.gain.exponentialRampToValueAtTime(peak, at + 0.04)
  swell.gain.setValueAtTime(peak, at + seconds * 0.7)
  swell.gain.exponentialRampToValueAtTime(SILENT, at + seconds)
  open.connect(swell).connect(out)
  for (const [type, ratio, detune] of [
    ['sawtooth', 1, -7],
    ['sawtooth', 1, 7],
    ['square', 0.5, 0],
  ] as const) {
    const voice = toneOf(bus, { type, at, seconds: seconds + 0.05 })
    voice.frequency.value = hertz * ratio
    voice.detune.value = detune
    const share = bus.context.createGain()
    share.gain.value = ratio === 1 ? 0.5 : 0.25
    voice.connect(share).connect(open)
  }
}

/**
 * Victory: a snare roll, a brass fanfare and a cymbal
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} fanfare - Fanfare
 * @return {void}
 */

export const fanfare = (bus: NavalBus, at: number, { level }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.55)
  for (let hit = 0; hit < 9; hit += 1) {
    const start = at + hit * 0.06
    const snare = noiseOf(bus, start, 0.08)
    snare
      .connect(filterOf(bus, 'bandpass', 1800, 0.8))
      .connect(shaped(bus, { at: start, peak: 0.12 + hit * 0.04, attack: 0.002, decay: 0.05 }))
      .connect(out)
  }
  const times = [0.56, 0.74, 0.92, 1.16]
  NAVAL_SOUND.fanfare.forEach((hertz, index) => {
    const isLast = index === NAVAL_SOUND.fanfare.length - 1
    const seconds = isLast ? 1.7 : 0.2
    brass(bus, out, { at: at + times[index], hertz, seconds, peak: 0.34 })
    if (isLast) {
      for (const ratio of [1.26, 1.5]) {
        brass(bus, out, { at: at + times[index], hertz: hertz * ratio, seconds, peak: 0.2 })
      }
    }
  })
  const cymbal = noiseOf(bus, at + 1.16, 1.8)
  cymbal
    .connect(filterOf(bus, 'highpass', 6000))
    .connect(shaped(bus, { at: at + 1.16, peak: 0.3, attack: 0.004, decay: 1.5 }))
    .connect(out)
}

/**
 * Defeat: a falling minor motif over a low drone
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} lament - Lament
 * @return {void}
 */

export const lament = (bus: NavalBus, at: number, { level }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.8)
  const times = [0, 0.55, 1.1, 1.75]
  NAVAL_SOUND.lament.forEach((hertz, index) => {
    const note = toneOf(bus, { type: 'triangle', at: at + times[index], seconds: 2.6 })
    note.frequency.value = hertz
    const soft = filterOf(bus, 'lowpass', 900)
    note
      .connect(soft)
      .connect(
        shaped(bus, {
          at: at + times[index],
          peak: 0.5,
          attack: 0.03,
          decay: index === 3 ? 2.2 : 0.7,
        })
      )
      .connect(out)
  })
  const drone = toneOf(bus, { type: 'sine', at, seconds: 3.6 })
  drone.frequency.value = 82
  drone.connect(shaped(bus, { at, peak: 0.4, attack: 0.5, decay: 3 })).connect(out)
}

/**
 * Sonar ping and its echo
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} ping - Ping
 * @return {void}
 */

export const sonar = (bus: NavalBus, at: number, { level }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.9)
  for (const [delay, share] of [
    [0, 1],
    [0.46, 0.4],
  ] as const) {
    const ping = toneOf(bus, { type: 'sine', at: at + delay, seconds: 1.6 })
    ping.frequency.value = 1180
    ping
      .connect(shaped(bus, { at: at + delay, peak: 0.34 * share, attack: 0.004, decay: 1.2 }))
      .connect(out)
  }
}

/**
 * Small click of an interface gesture
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions & { hertz: number }} click - Click
 * @return {void}
 */

export const click = (
  bus: NavalBus,
  at: number,
  { level, hertz }: VoiceOptions & { hertz: number }
): void => {
  const out = outputOf(bus, level, 0.1)
  const tone = toneOf(bus, { type: 'sine', at, seconds: 0.12 })
  tone.frequency.setValueAtTime(hertz, at)
  tone.frequency.exponentialRampToValueAtTime(hertz * 0.55, at + 0.08)
  tone.connect(shaped(bus, { at, peak: 0.3, attack: 0.003, decay: 0.07 })).connect(out)
}

/**
 * Low two-tone horn, ready to sail
 * @param {NavalBus} bus - Bus
 * @param {number} at - Start time
 * @param {VoiceOptions} horn - Horn
 * @return {void}
 */

export const horn = (bus: NavalBus, at: number, { level }: VoiceOptions): void => {
  const out = outputOf(bus, level, 0.7)
  ;[98, 130.8].forEach((hertz, index) => {
    const note = toneOf(bus, { type: 'sawtooth', at: at + index * 0.22, seconds: 0.8 })
    note.frequency.value = hertz
    note
      .connect(filterOf(bus, 'lowpass', 520))
      .connect(shaped(bus, { at: at + index * 0.22, peak: 0.3, attack: 0.05, decay: 0.55 }))
      .connect(out)
  })
}
