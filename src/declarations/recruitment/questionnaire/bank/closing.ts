import type { QuestionDefinition } from '@/declarations/recruitment/questionnaire/types'

/**
 * Questions closing the interview
 * @type {readonly QuestionDefinition[]}
 */

export const CLOSING_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'closing.speech',
    part: 'closing',
    section: 'wrap',
    kind: 'speech',
    mandatory: true,
    minutes: 2,
    prompt: 'Le discours de fin',
    speech: [
      {
        text: '[|Nous avons donc terminé l’entretien, je me permets donc de te tutoyer si tu es d’accord.]',
      },
      { text: '[|Attends sa réponse.]', aside: true },
      {
        text: 'Très bien, afin de conclure cet entretien, je vais te parler d’un point un petit peu protocolaire : dans quelques instants, je vais t’accorder un rôle « Candidat passé ». Ce rôle te permettra de rejoindre un canal avec les autres candidats qui ont déjà effectué leurs entretiens. Tu peux parler de tout, tu peux enfin décompresser.',
      },
      {
        text: 'Cependant, tout ce qui est dit dans cet entretien, les questions, les réponses, etc., ne doit en aucun cas être communiqué à une personne extérieure à la session.',
      },
      {
        text: 'Si un candidat vient dans tes DM et te pose des questions comme « Alors, comment ça s’est passé ? T’as eu quoi comme type de questions ? », tu dois immédiatement faire une capture d’écran et nous en faire part dans les DM d’un recruteur.',
      },
      {
        text: 'Si malheureusement tu ne nous dis rien, sache qu’on l’a toujours su de toute manière, et que tu seras tout autant en tort. Cela entraînera une disqualification ou une éjection immédiate de l’équipe (dans le cas où ta candidature est acceptée), ainsi qu’un blacklist sur toutes nos candidatures futures.',
      },
      { text: 'Est-ce que tu as compris ?' },
    ],
  },
  {
    key: 'closing.availability',
    part: 'closing',
    section: 'wrap',
    kind: 'open',
    mandatory: true,
    minutes: 2,
    prompt: 'Quelles sont [tes|vos] disponibilités réelles, chaque semaine, pour modérer ?',
    hint: 'Croise avec ce qu’il t’a dit de son travail ou de ses études.',
  },
  {
    key: 'closing.questions',
    part: 'closing',
    section: 'wrap',
    kind: 'open',
    recommended: true,
    minutes: 2,
    prompt: '[As-tu|Avez-vous] des questions pour nous ?',
    hint: 'La qualité de ses questions dit beaucoup de sa motivation.',
  },
]
