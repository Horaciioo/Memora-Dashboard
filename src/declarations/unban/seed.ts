import { UnbanQuestionTypes } from '@/utils/constants/unban'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'

/**
 * Form of version 1
 * @type {UnbanFormSnapshot}
 */

export const UNBAN_SEED_FORM: UnbanFormSnapshot = {
  intro:
    'Cette demande est lue par l’équipe de modération de {creator}. Répondez avec honnêteté, chaque réponse est relue.',
  outro: 'Vous pourrez suivre l’avancement de votre demande depuis ce même lien.',
  questions: [
    {
      id: 'context',
      type: UnbanQuestionTypes.LongText,
      label: 'Que s’est-il passé avant votre bannissement ?',
      required: true,
    },
    {
      id: 'reason',
      type: UnbanQuestionTypes.ShortText,
      label: 'Quel motif vous a-t-on donné ?',
      hint: 'Laissez vide si vous ne le connaissez pas.',
      required: false,
    },
    {
      id: 'explanation',
      type: UnbanQuestionTypes.LongText,
      label: 'Pourquoi devrions-nous lever votre bannissement ?',
      required: true,
    },
    {
      id: 'commitment',
      type: UnbanQuestionTypes.SingleChoice,
      label: 'Vous engagez-vous à respecter le règlement du serveur ?',
      required: true,
      options: [
        { id: 'yes', label: 'Oui, je m’y engage' },
        { id: 'no', label: 'Non' },
      ],
    },
  ],
}
