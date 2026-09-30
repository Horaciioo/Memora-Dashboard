import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Professional writing course, about reasons, notes and messages the team leaves behind
 * @type {Course}
 */

export const PROFESSIONAL_WRITING: Course = {
  key: 'redaction-pro',
  name: 'Parfaire sa rédaction professionnelle',
  summary:
    'Écrire des raisons, des notes et des messages clairs que toute l’équipe comprend six mois plus tard.',
  track: 'secondary',
  surface: 'general',
  functions: [],
  minutes: 25,
  chapters: [
    {
      key: 'raison',
      title: 'Écrire une raison lisible',
      blocks: [
        {
          kind: 'text',
          key: 'raison-text',
          body: 'La raison d’une sanction est lue **par quelqu’un d’autre, plus tard** : un Responsable qui traite un appel, un collègue qui applique le palier suivant. Elle doit donc se comprendre **sans avoir vu le chat**.\n\nUne bonne raison dit **quoi**, **où** et, si utile, **combien de fois**.',
        },
        {
          kind: 'keypoints',
          key: 'raison-points',
          title: 'Les trois questions d’une bonne raison',
          points: [
            {
              glyph: 'note',
              title: 'Quoi',
              body: 'Le comportement, nommé sans jugement.',
              tone: 'brand',
            },
            {
              glyph: 'platform',
              title: 'Où',
              body: 'Le salon, ou le live, où cela s’est passé.',
              tone: 'info',
            },
            {
              glyph: 'history',
              title: 'Combien',
              body: 'Combien de fois, si c’est une récidive.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'compare',
          key: 'raison-compare',
          title: 'Une raison qui se comprend seule',
          good: {
            title: 'Lisible',
            items: [
              '« Spam du même lien dans #général, 3 messages en 1 minute »',
              '« Insulte envers un viewer, 1re récidive »',
            ],
          },
          bad: {
            title: 'À reformuler',
            items: [
              '« Pénible », un jugement',
              '« Comme d’hab », le lecteur ne connaît pas l’histoire',
            ],
          },
        },
        {
          kind: 'sort',
          key: 'raison-sort',
          title: 'Bonne raison ou à reformuler ?',
          prompt: 'Classe ces raisons telles qu’elles seraient saisies dans l’historique.',
          buckets: [
            { key: 'good', label: 'Lisible' },
            { key: 'bad', label: 'À reformuler' },
          ],
          items: [
            {
              key: 'g1',
              label: 'Spam du même lien dans #général, 3 messages en 1 minute',
              bucket: 'good',
            },
            { key: 'g2', label: 'Insulte envers un viewer, 1re récidive', bucket: 'good' },
            { key: 'g3', label: 'Demande de dédicace pendant le live du 12', bucket: 'good' },
            { key: 'b1', label: 'Pénible', bucket: 'bad' },
            { key: 'b2', label: 'Comme d’hab', bucket: 'bad' },
            { key: 'b3', label: 'Il sait pourquoi', bucket: 'bad' },
          ],
          explanation:
            'Une bonne raison nomme le comportement et son contexte. « Pénible » est un jugement, « Comme d’hab » suppose que le lecteur connaît l’histoire.',
        },
        {
          kind: 'fill',
          key: 'raison-fill',
          title: 'Les trois questions',
          text: 'Une raison lisible répond à trois questions : [[quoi]] (le comportement), [[où]] (le salon ou le live) et [[combien]] de fois (récidive).',
          bank: ['quoi', 'où', 'combien', 'pourquoi', 'qui'],
          explanation:
            'Ce sont ces trois éléments qui permettent à un collègue de comprendre sans chercher.',
        },
      ],
    },
    {
      key: 'notes',
      title: 'Notes et messages',
      blocks: [
        {
          kind: 'diagram',
          key: 'notes-diagram',
          title: 'Dans le doute, une note d’abord',
          nodes: [
            {
              glyph: 'note',
              label: 'Une note',
              note: 'Documente sans sanctionner',
              tone: 'neutral',
            },
            {
              glyph: 'sanctions',
              label: 'Une infraction',
              note: 'Sanctionne et prévient le membre',
              tone: 'danger',
            },
          ],
        },
        {
          kind: 'callout',
          key: 'notes-tip',
          tone: 'tip',
          title: 'Note ou sanction ?',
          body: 'Une **note** documente sans sanctionner : comportement à surveiller, contexte pour les autres. Une **infraction** sanctionne et prévient le membre. Dans le doute, une note d’abord.',
        },
        {
          kind: 'quiz',
          key: 'notes-quiz',
          title: 'Écrire court et net',
          questions: [
            {
              key: 'q1',
              prompt: 'Quelle note aide le mieux un collègue ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'Signalé par 3 membres pour un comportement suspect en vocal, à surveiller ce week-end.',
                  correct: true,
                },
                { key: 'b', label: 'Bizarre ce type.', correct: false },
                { key: 'c', label: 'Voir avec les autres.', correct: false },
              ],
              explanation:
                'La première dit qui a signalé, quoi, où et quoi faire. Les autres ne servent à rien à celui qui les lit.',
            },
            {
              key: 'q2',
              prompt: 'Qu’évite-t-on dans un message écrit à un viewer ?',
              choices: [
                { key: 'a', label: 'Les jugements sur la personne', correct: true },
                { key: 'b', label: 'Les phrases courtes', correct: false },
                { key: 'c', label: 'Le tutoiement', correct: false },
              ],
              explanation:
                'On parle du comportement et de la règle. Les phrases courtes et le tutoiement de l’équipe sont au contraire les bienvenus.',
            },
          ],
        },
        {
          kind: 'case',
          key: 'notes-case',
          title: 'Réécrire une raison',
          context:
            'Tu as posé un timeout à un viewer qui a répété cinq fois « qui veut rejoindre mon serveur ? » avec un lien, dans le chat du live. Dans l’historique, tu avais écrit seulement : « pub ».',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Que manque-t-il à cette raison ?',
              choices: [
                {
                  key: 'a',
                  label: 'Le contexte : le lien, la répétition et le lieu',
                  correct: true,
                },
                { key: 'b', label: 'Un adjectif plus fort', correct: false },
                { key: 'c', label: 'Rien, « pub » suffit', correct: false },
              ],
              explanation:
                'Un collègue qui lit « pub » ne sait ni combien de fois ni où. Le contexte évite les malentendus en cas d’appel.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Réécris la raison en une phrase.',
              expert:
                'Publicité pour un serveur Discord avec lien, postée 5 fois dans le chat du live, après l’avertissement.',
            },
          ],
        },
      ],
    },
  ],
}
