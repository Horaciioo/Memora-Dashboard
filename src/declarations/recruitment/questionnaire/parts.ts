import { RecruitmentPlatforms } from '@/utils/constants/recruitment'
import type { RecruitmentPlatformName } from '@/utils/constants/recruitment'
import type { QuestionPartKey } from '@/declarations/recruitment/questionnaire/types'

/**
 * Words that change with the platform
 * @type {Record<RecruitmentPlatformName, Record<string, string>>}
 */

export const PLATFORM_TERMS: Record<RecruitmentPlatformName, Record<string, string>> = {
  [RecruitmentPlatforms.Discord]: {
    space: 'le serveur',
    inSpace: 'sur le serveur',
    chat: 'le salon général',
    inChat: 'dans le général',
    member: 'un membre',
    members: 'les membres',
    modChat: 'le salon réservé aux modérateurs',
    privateTalk: 'un fil privé',
    voice: 'en vocal',
  },
  [RecruitmentPlatforms.Twitch]: {
    space: 'la chaîne',
    inSpace: 'sur la chaîne',
    chat: 'le chat',
    inChat: 'dans le chat',
    member: 'un viewer',
    members: 'les viewers',
    modChat: 'le chat réservé aux modérateurs',
    privateTalk: 'un chuchotement',
    voice: 'en live',
  },
}

/**
 * Part of the interview
 * @typedef {Object} QuestionPartOption
 * @property {string} label - Part name
 * @property {string} lead - What the part is for
 * @property {string} [say] - Line read out loud
 * @property {Record<string, string>} sections - Headings inside the part
 */

export interface QuestionPartOption {
  label: string
  lead: string
  say?: string
  sections: Record<string, string>
}

/**
 * Parts of the interview, in asking order
 * @type {Record<QuestionPartKey, QuestionPartOption>}
 */

export const QUESTION_PARTS: Record<QuestionPartKey, QuestionPartOption> = {
  profile: {
    label: 'Exploration de profil',
    lead: 'Vérifie que les informations collent à la candidature écrite et observe sa présentation spontanée. Tu explores son vécu, ses compétences, sa personnalité, sa gestion du stress.',
    sections: {
      introduction: 'Introduction',
      situation: 'Aspects interpersonnels et professionnels',
      stress: 'Gestion du stress',
    },
  },
  discovery: {
    label: 'Axes de découverte',
    lead: 'Cherche ses motivations implicites et explicites. N’hésite pas à être un peu piquant. Si tu as un doute, l’opportunisme est la priorité.',
    sections: {
      socials: 'Relation avec les réseaux sociaux',
      creator: 'Relation avec le créateur',
      opportunism: 'L’opportunisme',
      moderation: 'La modération',
      theory: 'Les théories',
    },
  },
  situation: {
    label: 'Mise en situation',
    lead: 'Mesure la réactivité, la maîtrise émotionnelle et le raisonnement du candidat sous tension, sa rigueur rédactionnelle et sa façon de gérer des situations typiques de modération.',
    say: 'Je vais te présenter les exercices disponibles, je te lis juste les titres. Tu en choisiras deux. Alors, à chaud, lesquels t’intéressent ?',
    sections: { exercise: 'Les exercices' },
  },
  closing: {
    label: 'Clap de fin',
    lead: 'Laisse-lui la parole, vérifie sa disponibilité et explique la suite du processus.',
    sections: { wrap: 'Pour finir' },
  },
}

/**
 * Parts in asking order
 * @type {QuestionPartKey[]}
 */

export const QUESTION_PART_ORDER: QuestionPartKey[] = [
  'profile',
  'discovery',
  'situation',
  'closing',
]
