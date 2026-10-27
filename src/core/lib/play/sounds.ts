// Gestures that unlock audio
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

// One context per tab
let audio: AudioContext | null = null

// Decoded files by path
const buffers = new Map<string, Promise<AudioBuffer | null>>()

/**
 * Resume on the first gesture
 * @param {AudioContext} context - Context
 * @return {void}
 */

const resumeOnGesture = (context: AudioContext): void => {
  const resume = () => {
    void context.resume()
    for (const name of UNLOCK_EVENTS) window.removeEventListener(name, resume)
  }
  for (const name of UNLOCK_EVENTS) window.addEventListener(name, resume, { once: true })
}

/**
 * Shared audio context
 * @return {AudioContext | null} - Context, none on the server
 */

const contextOf = (): AudioContext | null => {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!audio) {
    audio = new AudioContext()
    // Browsers hold sound until a gesture
    if (audio.state === 'suspended') resumeOnGesture(audio)
  }

  return audio
}

/**
 * Decoded file, fetched once
 * @param {AudioContext} context - Context
 * @param {string} path - Public path
 * @return {Promise<AudioBuffer | null>} - Buffer, none on failure
 */

const bufferOf = (context: AudioContext, path: string): Promise<AudioBuffer | null> => {
  const known = buffers.get(path)
  if (known !== undefined) return known
  const loading = fetch(path)
    .then((response) => response.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .catch(() => null)
  buffers.set(path, loading)

  return loading
}

/**
 * Source wired through a gain
 * @param {AudioContext} context - Context
 * @param {AudioBuffer} buffer - Sound
 * @param {number} volume - Zero to one
 * @return {Object} - Source and gain
 */

const voiceOf = (context: AudioContext, buffer: AudioBuffer, volume: number) => {
  const source = context.createBufferSource()
  const gain = context.createGain()
  source.buffer = buffer
  gain.gain.value = volume
  source.connect(gain)
  gain.connect(context.destination)

  return { source, gain }
}

/**
 * Fetch sounds ahead
 * @param {string[]} paths - Public paths
 * @return {void}
 */

export const preloadSounds = (paths: readonly string[]): void => {
  const context = contextOf()
  if (context) for (const path of paths) void bufferOf(context, path)
}

/**
 * Play a sound once
 * @param {string} path - Public path
 * @param {number} volume - Zero to one
 * @return {void}
 */

export const playSound = (path: string, volume: number): void => {
  const context = volume > 0 ? contextOf() : null
  if (!context) return
  void bufferOf(context, path).then((buffer) => {
    if (buffer) voiceOf(context, buffer, volume).source.start()
  })
}

/**
 * Rising sparkle, no file
 * @param {number[]} notes - Frequencies in Hz
 * @param {number} volume - Zero to one
 * @return {void}
 */

export const playChime = (notes: number[], volume: number): void => {
  const context = contextOf()
  if (!context) return
  notes.forEach((hertz, index) => {
    const start = context.currentTime + index * 0.09
    const tone = context.createOscillator()
    const gain = context.createGain()
    tone.type = 'triangle'
    tone.frequency.value = hertz
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.35 * volume, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5)
    tone.connect(gain).connect(context.destination)
    tone.start(start)
    tone.stop(start + 0.55)
  })
}

/**
 * Rising zip, no file
 * @param {Object} sweep - Pitch and length
 * @param {number} sweep.from - Start Hz
 * @param {number} sweep.to - End Hz
 * @param {number} sweep.seconds - Length
 * @param {number} volume - Zero to one
 * @return {void}
 */

export const playSweep = (
  { from, to, seconds }: { from: number; to: number; seconds: number },
  volume: number
): void => {
  const context = contextOf()
  if (!context) return
  const start = context.currentTime
  const tone = context.createOscillator()
  const gain = context.createGain()
  tone.type = 'sawtooth'
  tone.frequency.setValueAtTime(from, start)
  tone.frequency.exponentialRampToValueAtTime(to, start + seconds)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.18 * volume, start + seconds * 0.3)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds)
  tone.connect(gain).connect(context.destination)
  tone.start(start)
  tone.stop(start + seconds)
}

/**
 * Looping sound driven from outside
 * @typedef {Object} SoundLoop
 * @property {(volume: number, rate: number) => void} set - Level and speed
 * @property {() => void} stop - Cut for good
 */

export interface SoundLoop {
  set: (volume: number, rate: number) => void
  stop: () => void
}

// Glide of a level change, in seconds
const LOOP_GLIDE = 0.08

/**
 * Play a sound in a loop, silent until set
 * @param {string} path - Public path
 * @return {SoundLoop} - Handle
 */

export const loopSound = (path: string): SoundLoop => {
  const context = contextOf()
  let voice: ReturnType<typeof voiceOf> | null = null
  let level = { volume: 0, rate: 1 }
  let isStopped = false
  if (context)
    void bufferOf(context, path).then((buffer) => {
      if (!buffer || isStopped) return
      voice = voiceOf(context, buffer, level.volume)
      voice.source.loop = true
      voice.source.playbackRate.value = level.rate
      voice.source.start()
    })

  return {
    set: (volume, rate) => {
      level = { volume, rate }
      if (!voice || !context) return
      voice.gain.gain.setTargetAtTime(volume, context.currentTime, LOOP_GLIDE)
      voice.source.playbackRate.setTargetAtTime(rate, context.currentTime, LOOP_GLIDE)
    },
    stop: () => {
      isStopped = true
      voice?.source.stop()
    },
  }
}
