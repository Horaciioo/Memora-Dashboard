import type { VoiceChannel } from '@/declarations/academy/curriculum/types'

/**
 * Everyone in the vocal
 * @type {VoiceChannel[]}
 */

export const VOICE_CHANNELS: VoiceChannel[] = [
  { key: 'create', name: 'Créer un vocal', isCreator: true, members: [] },
  {
    key: 'room',
    name: 'Vocal de Léa',
    members: [
      { name: 'Léa', tone: 'brand' },
      { name: 'Echo', tone: 'success' },
      { name: 'Golf', tone: 'caution' },
      { name: 'Hotel', tone: 'danger' },
      { name: 'India', tone: 'info' },
    ],
  },
  { key: 'waiting', name: 'Attente', members: [] },
]
