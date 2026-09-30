import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import { MeetingAudiences } from '@/utils/constants/workflow'
import type { MeetingAudienceName } from '@/utils/constants/workflow'

/**
 * Meeting audience metadata
 * @typedef {Object} MeetingAudienceOption
 * @property {string} label - Display label
 * @property {string} summary - Who is expected
 * @property {IconName} icon - Glyph shown beside it
 */

interface MeetingAudienceOption {
  label: string
  summary: string
  icon: IconName
  // Trade whose holders are expected, absent for the whole team and the custom list
  functionName?: string
}

const MEETING_AUDIENCE_MAP: Record<MeetingAudienceName, MeetingAudienceOption> = {
  [MeetingAudiences.Everyone]: {
    label: 'Toute l’équipe',
    summary: 'Tout le monde est attendu, la réunion apparaît sur l’Accueil de chacun.',
    icon: 'members',
  },
  [MeetingAudiences.Discord]: {
    label: 'Équipe Discord',
    summary: 'Les modérateurs Discord sont attendus, elle apparaît sur leur Accueil.',
    icon: 'functionDiscord',
    functionName: 'Discord',
  },
  [MeetingAudiences.Twitch]: {
    label: 'Équipe Twitch',
    summary: 'Les modérateurs des lives sont attendus, elle apparaît sur leur Accueil.',
    icon: 'functionLive',
    functionName: 'Lives',
  },
  [MeetingAudiences.Custom]: {
    label: 'Personnalisé',
    summary: 'Seules les personnes nommées sont attendues, elle n’apparaît que chez elles.',
    icon: 'lock',
  },
}

export const MEETING_AUDIENCE_REGISTRY = createRegistry(MEETING_AUDIENCE_MAP)
