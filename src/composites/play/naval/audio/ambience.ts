import { ambienceLevel, navalBus } from '@/composites/play/naval/audio/bus'
import { NAVAL_SOUND } from '@/declarations/play/naval/sounds'

/**
 * Running sea bed and tension
 * @typedef {Object} NavalAmbience
 * @property {(tension: number) => void} update - Tension, zero to one
 * @property {() => void} stop - Cut for good
 */

export interface NavalAmbience {
  update: (tension: number) => void
  stop: () => void
}

// Glide of a level change, in seconds
const GLIDE = 0.4

/**
 * Sea bed with a tension drone that grows with the danger
 * @return {NavalAmbience | null} - Handle, none without audio
 */

export const startAmbience = (): NavalAmbience | null => {
  const bus = navalBus()
  if (!bus) return null
  const { context } = bus

  // Waves, noise breathing slowly
  const sea = context.createBufferSource()
  sea.buffer = bus.noise
  sea.loop = true
  const murmur = context.createBiquadFilter()
  murmur.type = 'lowpass'
  murmur.frequency.value = 520
  const swell = context.createGain()
  const waves = context.createOscillator()
  waves.frequency.value = 0.11
  const depth = context.createGain()
  depth.gain.value = 0.5
  waves.connect(depth).connect(swell.gain)
  swell.gain.value = 0.5
  const seaOut = context.createGain()
  sea.connect(murmur).connect(swell).connect(seaOut).connect(bus.dry)

  // Drone, two saws beating against each other
  const droneOut = context.createGain()
  droneOut.gain.value = 0
  const dark = context.createBiquadFilter()
  dark.type = 'lowpass'
  dark.frequency.value = 190
  const pulse = context.createGain()
  pulse.gain.value = 0.7
  const heart = context.createOscillator()
  heart.frequency.value = 0.9
  const heartDepth = context.createGain()
  heartDepth.gain.value = 0.3
  heart.connect(heartDepth).connect(pulse.gain)
  const voices = [55, 58.3].map((hertz) => {
    const voice = context.createOscillator()
    voice.type = 'sawtooth'
    voice.frequency.value = hertz
    voice.connect(dark)

    return voice
  })
  dark.connect(pulse).connect(droneOut).connect(bus.dry)

  const sources = [sea, waves, heart, ...voices]
  for (const source of sources) source.start()
  seaOut.gain.value = ambienceLevel() * NAVAL_SOUND.ambience.sea
  let tension = 0

  const apply = () => {
    const level = ambienceLevel()
    seaOut.gain.setTargetAtTime(level * NAVAL_SOUND.ambience.sea, context.currentTime, GLIDE)
    droneOut.gain.setTargetAtTime(
      level * NAVAL_SOUND.ambience.tension * tension,
      context.currentTime,
      GLIDE
    )
  }

  return {
    update: (next) => {
      tension = Math.min(1, Math.max(0, next))
      apply()
    },
    stop: () => {
      seaOut.gain.setTargetAtTime(0, context.currentTime, GLIDE / 2)
      droneOut.gain.setTargetAtTime(0, context.currentTime, GLIDE / 2)
      window.setTimeout(() => {
        for (const source of sources) {
          try {
            source.stop()
          } catch {
            // Already stopped
          }
        }
      }, 800)
    },
  }
}
