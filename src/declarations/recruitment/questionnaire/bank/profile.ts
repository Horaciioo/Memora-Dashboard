import type { QuestionDefinition } from '@/declarations/recruitment/questionnaire/types'

/**
 * Questions of the profile exploration
 * @type {readonly QuestionDefinition[]}
 */

export const PROFILE_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'profile.contacted',
    part: 'profile',
    section: 'introduction',
    kind: 'open',
    mandatory: true,
    minutes: 1,
    prompt: 'En premier lieu, [as-tu|avez-vous] déjà été contacté(e) par un candidat ?',
  },
  {
    key: 'profile.introduction',
    part: 'profile',
    section: 'introduction',
    kind: 'open',
    mandatory: true,
    minutes: 4,
    prompt:
      '[Que peux-tu m’apprendre de plus à ton|Que pouvez-vous m’apprendre de plus à votre] sujet ?',
    say: 'Je m’appelle <ton pseudo>, je suis <ton rôle> et je prends en charge cet entretien. D’autres interlocuteurs peuvent être présents et prendre la parole. C’est bon pour [toi|vous] ?',
    hint: 'Reprends sa candidature : « De ce que j’ai pu lire, tu t’appelles [X] et tu as [X] ans… ». L’énumérer montre que tu l’as étudiée et l’empêche de se répéter. Présente aussi l’équipe.',
  },
  {
    key: 'profile.employee',
    part: 'profile',
    section: 'situation',
    family: 'situation',
    display: 'fold',
    kind: 'open',
    when: 'Si le candidat est salarié',
    minutes: 3,
    prompt:
      'Quels atouts développés par [ton|votre] travail [utilises-tu|utilisez-vous] au quotidien ?',
    mandatory: true,
    say: '[Tu dis|Vous dites] être salarié(e)… Mais du coup :',
    digs: [
      { key: 'tachesQuotidiennes', text: 'Quelles sont [tes|vos] tâches quotidiennes ?' },
      { key: 'geresPlanning', text: 'Comment [gères-tu ton|gérez-vous votre] planning ?' },
      {
        key: 'competencesAcquises',
        text: 'Quelles compétences [as-tu|avez-vous] acquises grâce à [ton|votre] métier ?',
      },
    ],
  },
  {
    key: 'profile.jobless',
    part: 'profile',
    section: 'situation',
    family: 'situation',
    display: 'fold',
    kind: 'open',
    when: 'Si le candidat est au chômage',
    minutes: 3,
    prompt:
      'Sans indiscrétion, [peux-tu|pouvez-vous] me donner la raison de [ta|votre] situation ?',
    say: '[Tu disais|Vous disiez] être au chômage… Mais du coup :',
    digs: [
      {
        key: 'tiresBenefique',
        text: 'Qu’en [tires-tu|tirez-vous] de bénéfique ? [Observes-tu|Observez-vous] des aspects négatifs ?',
      },
      {
        key: 'manqueActivite',
        text: 'Ce manque d’activité professionnelle ne pourrait-il pas créer une certaine procrastination avec le temps ?',
      },
      {
        key: 'demainTrouves',
        text: 'Si demain [tu trouves|vous trouvez] une activité, [penses-tu|pensez-vous] que [ta|votre] gestion du temps de modération pourrait se détériorer ?',
      },
    ],
  },
  {
    key: 'profile.student',
    part: 'profile',
    section: 'situation',
    family: 'situation',
    display: 'fold',
    kind: 'open',
    when: 'Si le candidat est étudiant',
    minutes: 3,
    prompt: 'Quelles sont les matières que [tu étudies|vous étudiez] ?',
    say: '[Tu dis|Vous dites] être étudiant(e)… Mais du coup :',
    hint: 'S’il travaille à côté, creuse : « Tu penses avoir du temps à consacrer à {creator} ? » Question piège pour voir sa réaction : « Si demain tu trouves du travail, tu prioriseras quoi ? »',
    digs: [
      {
        key: 'leursContenus',
        text: 'Quels sont leurs contenus, [as-tu|avez-vous] un petit exemple en tête ?',
      },
      {
        key: 'matierePreferee',
        text: '[As-tu|Avez-vous] une matière préférée ? Et une que [tu apprécies|vous appréciez] moins ? Pourquoi ?',
      },
      {
        key: 'futurEnvisages',
        text: 'Quel futur [envisages-tu|envisagez-vous] ? Un métier de prédilection peut-être ?',
      },
      { key: 'travaillesCote', text: '[Tu travailles|Vous travaillez] à côté ?' },
    ],
  },
  {
    key: 'profile.stress',
    part: 'profile',
    section: 'stress',
    kind: 'open',
    mandatory: true,
    minutes: 3,
    prompt:
      'Sur une échelle de 1 à 35, comment [noterais-tu ton|noteriez-vous votre] stress actuellement ?',
    say: 'Maintenant que j’en connais un peu plus sur [toi|vous], passons au cœur du sujet.',
    hint: 'Évalue s’il est à l’aise, stressé ou s’il gère efficacement. En cas de stress excessif, demande aux observateurs de partir.',
    digs: [
      {
        key: 'prepareEntretien',
        text: '[As-tu|Avez-vous] préparé cet entretien (préparation quelconque, prise d’informations) ?',
      },
    ],
    branches: [
      {
        key: 'dessus20',
        when: 'Au-dessus de 20',
        asks: [
          { key: 'stresser', text: 'Qu’est-ce qui [te|vous] fait stresser ?' },
          {
            key: 'habitudeChez',
            text: 'Est-ce une habitude chez [toi|vous] ? Ne [penses-tu|pensez-vous] pas que le stress pourrait entacher [ton|votre] efficacité en tant que modérateur ?',
          },
        ],
      },
      {
        key: 'dessous20',
        when: 'En dessous de 20',
        asks: [
          { key: 'typeContexte', text: 'Ce type de contexte [t’est-il|vous est-il] familier ?' },
          {
            key: 'calmeLie',
            text: 'Ce calme est-il lié à [ta|votre] capacité à gérer [ton|votre] stress, ou cet entretien n’est-il pas si important pour [toi|vous] ?',
          },
        ],
      },
    ],
  },
  {
    key: 'profile.imagery.sign',
    part: 'profile',
    section: 'stress',
    kind: 'choice',
    family: 'imagery',
    recommended: true,
    minutes: 2,
    prompt:
      'Si [tu devais|vous deviez] être un panneau de signalisation, lequel [serais-tu|seriez-vous] ? Pourquoi ?',
    hint: 'Question au choix : une seule suffit, passe les autres de la même famille.',
  },
  {
    key: 'profile.imagery.animal',
    part: 'profile',
    section: 'stress',
    kind: 'choice',
    family: 'imagery',
    minutes: 2,
    prompt:
      'Si [tu devais|vous deviez] être un animal, lequel [serais-tu|seriez-vous] ? Pourquoi ?',
    hint: 'Question au choix : une seule suffit, passe les autres de la même famille.',
  },
  {
    key: 'profile.imagery.planet',
    part: 'profile',
    section: 'stress',
    kind: 'choice',
    family: 'imagery',
    minutes: 2,
    prompt:
      'Si [tu devais|vous deviez] être une planète, laquelle [serais-tu|seriez-vous] ? Pourquoi ?',
    hint: 'Question au choix : une seule suffit, passe les autres de la même famille.',
  },
  {
    key: 'profile.imagery.fruit',
    part: 'profile',
    section: 'stress',
    kind: 'choice',
    family: 'imagery',
    minutes: 2,
    prompt: 'Si [tu devais|vous deviez] être un fruit, lequel [serais-tu|seriez-vous] ? Pourquoi ?',
    hint: 'Question au choix : une seule suffit, passe les autres de la même famille.',
  },
  {
    key: 'profile.imagery.drink',
    part: 'profile',
    section: 'stress',
    kind: 'choice',
    family: 'imagery',
    minutes: 2,
    prompt:
      'Si [tu devais|vous deviez] être une boisson, laquelle [serais-tu|seriez-vous] ? Pourquoi ?',
    hint: 'Question au choix : une seule suffit, passe les autres de la même famille.',
  },
]
