/**
 * Lines Memora says when she tells the recap
 * @type {Record<string, string>}
 */

export const RECAP_TALK_COPY = {
  hello: 'Re, {name}. Voilà ce que tu as manqué.',
  intro:
    'Voilà ce qui a bougé. Choisis le sujet dont tu veux qu’on parle, on le règle avant de passer à un autre.',
  preparing: 'Je te prépare ton récap',
  nextPick: 'Choisis la suite quand tu veux.',
  allDone: 'Tu es à jour, il ne reste plus rien à regarder.',
  skip: 'Pas maintenant',
  thisOne: 'ce point',
  askTask: 'Il te reste «{subject}» à faire. Tu veux que je la marque faite ?',
  askCalendar: 'On attend ta réponse pour «{subject}». Tu seras là ?',
  askUnban: 'La demande «{subject}» attend quelqu’un. Je la prends pour toi ?',
  didTask: 'C’est fait, «{subject}» est marquée faite.',
  didCalendar: 'C’est noté, j’ai transmis ta réponse pour «{subject}».',
  didUnban: 'C’est pris, la demande «{subject}» est à toi.',
  kept: 'D’accord, je la laisse dans ta liste.',
  eventReplies: 'Tu as reçu en tout {count} réponses.',
  eventReply: 'Tu as reçu en tout 1 réponse.',
  eventNoReply: 'Tu n’as encore reçu aucune réponse.',
  present: 'Les présents :',
  absent: 'Les absents :',
  pending: 'Ceux qui n’ont pas répondu :',
  remind: 'Tu veux qu’on relance ceux qui n’ont pas répondu ?',
  everyone: 'Tout le monde a répondu.',
  nothing: 'Rien à rattraper pour le moment.',
} as const
