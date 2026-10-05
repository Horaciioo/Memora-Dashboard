import type {
  DiscordReplicaState,
  DiscordScene,
  DiscordSceneEvent,
  DiscordSceneStep,
} from '@/types/replicas'

/**
 * Apply one Discord scene event
 * @param {DiscordReplicaState} state - Played state
 * @param {DiscordSceneEvent} event - Event
 * @return {DiscordReplicaState} - Next state
 */

export const applyDiscordEvent = (
  state: DiscordReplicaState,
  event: DiscordSceneEvent
): DiscordReplicaState => {
  switch (event.kind) {
    case 'open': {
      // The channel joins its category once
      const categories = state.categories.map((category) =>
        category.name !== event.category ||
        category.channels.some((channel) => channel.name === event.channel.name)
          ? category
          : { ...category, channels: [...category.channels, event.channel] }
      )

      return { ...state, categories, channel: event.channel.name, messages: [], typing: [] }
    }
    case 'message':
      return {
        ...state,
        messages: [...state.messages, event.message],
        // Whoever posts stops typing
        typing: state.typing.filter((author) => author.id !== event.message.author.id),
        draft: '',
      }
    case 'typing': {
      const others = state.typing.filter((author) => author.id !== event.author.id)

      return { ...state, typing: event.on ? [...others, event.author] : others }
    }
    case 'draft':
      return { ...state, draft: event.text }
    case 'guide':
      return { ...state, guideStep: event.step }
  }
}

/**
 * Play a scene to its end
 * @param {DiscordScene} scene - Scene
 * @return {DiscordReplicaState} - Final state
 */

export const playDiscordScene = (scene: DiscordScene): DiscordReplicaState =>
  scene.steps.reduce((state, step) => applyDiscordEvent(state, step.event), scene.initial)

/**
 * Chain steps after a scene
 * @param {DiscordSceneStep[]} base - Steps already played
 * @param {DiscordSceneStep[]} next - Steps to append
 * @param {number} [gap] - Pause between the two
 * @return {DiscordSceneStep[]} - Steps in time order
 */

export const chainSteps = (
  base: DiscordSceneStep[],
  next: DiscordSceneStep[],
  gap: number = 0
): DiscordSceneStep[] => {
  const offset = (base.at(-1)?.at ?? 0) + gap

  return [...base, ...next.map((step) => ({ ...step, at: step.at + offset }))]
}
