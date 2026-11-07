import { contextOf } from '@/core/lib/play/sounds'
import { playLevelOf } from '@/core/store/playSound'
import { useNavalAudioStore } from '@/core/store/navalAudio'
import { NAVAL_SOUND } from '@/declarations/play/naval/sounds'
import { PLAY_VOLUME } from '@/declarations/play/sounds'
import { PlayGames } from '@/utils/constants/play'

/**
 * Shared outputs of the naval sounds
 * @typedef {Object} NavalBus
 */

export interface NavalBus {
  context: AudioContext
  // Dry and wet inputs, both end in the limiter
  dry: GainNode
  wet: ConvolverNode
  noise: AudioBuffer
}

// One bus per context
let bus: NavalBus | null = null

// Voices alive, each counted until its end
let active = 0

/**
 * Seconds of white noise
 * @param {AudioContext} context - Context
 * @param {number} seconds - Length
 * @return {AudioBuffer} - Noise
 */

const noiseBuffer = (context: AudioContext, seconds: number): AudioBuffer => {
  const buffer = context.createBuffer(
    1,
    Math.floor(context.sampleRate * seconds),
    context.sampleRate
  )
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1

  return buffer
}

/**
 * Impulse of a big open sea, decaying noise
 * @param {AudioContext} context - Context
 * @return {AudioBuffer} - Impulse
 */

const impulseOf = (context: AudioContext): AudioBuffer => {
  const length = Math.floor(context.sampleRate * NAVAL_SOUND.reverbSeconds)
  const buffer = context.createBuffer(2, length, context.sampleRate)
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel)
    for (let index = 0; index < length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 3.2
    }
  }

  return buffer
}

/**
 * Bus of the naval sounds, built on first use
 * @return {NavalBus | null} - Bus, none without audio
 */

export const navalBus = (): NavalBus | null => {
  const context = contextOf()
  if (!context) return null
  // Phones hold sound until a gesture reaches here
  if (context.state === 'suspended') void context.resume()
  if (bus?.context === context) return bus

  // Everything ends in a limiter, blasts never clip
  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -16
  limiter.knee.value = 12
  limiter.ratio.value = 10
  limiter.attack.value = 0.003
  limiter.release.value = 0.25
  limiter.connect(context.destination)

  const dry = context.createGain()
  dry.connect(limiter)
  const wet = context.createConvolver()
  wet.buffer = impulseOf(context)
  const send = context.createGain()
  send.gain.value = NAVAL_SOUND.reverbSend
  wet.connect(send).connect(limiter)
  bus = { context, dry, wet, noise: noiseBuffer(context, 3) }

  return bus
}

/**
 * Level of the effects, zero when switched off or muted
 * @return {number} - Zero to one
 */

export const effectsLevel = (): number =>
  useNavalAudioStore.getState().hasEffects
    ? playLevelOf(PlayGames.Naval) * PLAY_VOLUME.output * NAVAL_SOUND.gain
    : 0

/**
 * Level of the sea and the tension drone
 * @return {number} - Zero to one
 */

export const ambienceLevel = (): number =>
  useNavalAudioStore.getState().hasAmbience
    ? playLevelOf(PlayGames.Naval) * PLAY_VOLUME.output * NAVAL_SOUND.gain
    : 0

/**
 * Take a voice slot for some seconds
 * @param {number} seconds - Length of the voice
 * @param {boolean} [isEssential] - Never dropped
 * @return {boolean} - Slot granted
 */

export const takeVoice = (seconds: number, isEssential = false): boolean => {
  if (active >= NAVAL_SOUND.maxVoices && !isEssential) return false
  active += 1
  window.setTimeout(() => {
    active -= 1
  }, seconds * 1000)

  return true
}

/**
 * Gain node wired to the bus
 * @param {NavalBus} target - Bus
 * @param {number} level - Gain
 * @param {number} [reverb] - Share sent to the reverb
 * @param {number} [pan] - Left to right, minus one to one
 * @return {GainNode} - Input
 */

export const outputOf = (target: NavalBus, level: number, reverb = 0.5, pan = 0): GainNode => {
  const { context } = target
  const input = context.createGain()
  input.gain.value = level
  let tail: AudioNode = input
  if (pan) {
    const panner = context.createStereoPanner()
    panner.pan.value = pan
    input.connect(panner)
    tail = panner
  }
  tail.connect(target.dry)
  if (reverb > 0) {
    const send = context.createGain()
    send.gain.value = reverb
    tail.connect(send).connect(target.wet)
  }

  return input
}
