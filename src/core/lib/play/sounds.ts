/**
 * One synthesised tone of a game sound
 * @typedef {Object} PlayTone
 */

export interface PlayTone {
  wave: OscillatorType | 'noise'
  // Hertz at the start, then at the end
  from: number
  to?: number
  seconds: number
  delay?: number
  gain: number
  // Low pass cut, hertz
  filter?: number
}

// Shortest audible ramp
const ATTACK_SECONDS = 0.005

// Silence floor of a ramp
const SILENCE = 0.0001

// One context and one noise buffer per tab
let audio: AudioContext | null = null
let noise: AudioBuffer | null = null

/**
 * Shared audio context, woken after a gesture
 * @return {AudioContext | null} - Context, none on the server
 */

const contextOf = (): AudioContext | null => {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()

  return audio
}

/**
 * Second of white noise
 * @param {AudioContext} context - Context
 * @return {AudioBuffer} - Buffer
 */

const noiseOf = (context: AudioContext): AudioBuffer => {
  if (noise) return noise
  noise = context.createBuffer(1, context.sampleRate, context.sampleRate)
  const data = noise.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1

  return noise
}

/**
 * Source of one tone
 * @param {AudioContext} context - Context
 * @param {PlayTone} tone - Tone
 * @param {number} start - Context seconds
 * @return {AudioScheduledSourceNode} - Source
 */

const sourceOf = (context: AudioContext, tone: PlayTone, start: number) => {
  if (tone.wave === 'noise') {
    const source = context.createBufferSource()
    source.buffer = noiseOf(context)

    return source
  }
  const source = context.createOscillator()
  source.type = tone.wave
  source.frequency.setValueAtTime(tone.from, start)
  if (tone.to) source.frequency.exponentialRampToValueAtTime(tone.to, start + tone.seconds)

  return source
}

/**
 * Play a sound made of tones
 * @param {PlayTone[]} tones - Sound
 * @param {number} volume - Zero to one
 * @return {void}
 */

export const playTones = (tones: readonly PlayTone[], volume: number): void => {
  const context = volume > 0 ? contextOf() : null
  if (!context) return

  for (const tone of tones) {
    const start = context.currentTime + (tone.delay ?? 0)
    const source = sourceOf(context, tone, start)
    const gain = context.createGain()
    // Quick attack, exponential fade
    gain.gain.setValueAtTime(SILENCE, start)
    gain.gain.exponentialRampToValueAtTime(
      Math.max(SILENCE, tone.gain * volume),
      start + ATTACK_SECONDS
    )
    gain.gain.exponentialRampToValueAtTime(SILENCE, start + tone.seconds)
    const filter = tone.filter ? context.createBiquadFilter() : null
    if (filter) filter.frequency.value = tone.filter ?? 0
    source.connect(filter ?? gain)
    filter?.connect(gain)
    gain.connect(context.destination)
    source.start(start)
    source.stop(start + tone.seconds + ATTACK_SECONDS)
  }
}
