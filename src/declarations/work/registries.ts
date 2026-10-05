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
  // Trade whose holders are expected
  functionName?: string
}

const MEETING_AUDIENCE_MAP: Record<MeetingAudienceName, MeetingAudienceOption> = {
  [MeetingAudiences.Everyone]: {
    label: 'Toute l’équipe',
    summary:
      "La totalité de l'équipe est convoquée. Elle reçoit la notification dans leur page d’accueil.",
    icon: 'members',
  },
  [MeetingAudiences.Discord]: {
    label: 'Équipe Discord',
    summary:
      "Seule l'équipe Discord sera concernée et notifiée dans leur page d'Accueil respective.",
    icon: 'functionDiscord',
    functionName: 'Discord',
  },
  [MeetingAudiences.Twitch]: {
    label: 'Équipe Twitch',
    summary:
      "Seule l'équipe Twitch sera concernée et notifiée dans leur page d'Accueil respective.",
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
