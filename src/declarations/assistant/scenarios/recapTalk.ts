/**
 * Lines Memora says when she tells the recap
 * @type {Record<string, string>}
 */

export const RECAP_TALK_COPY = {
  hello: 'Re, {name}. Voilà ce que tu as manqué.',
  intro:
    'Voilà ce qui a bougé. Choisis le sujet dont tu veux qu’on parle, on le règle avant de passer à un autre.',
  preparing: 'Je te prépare ton récap',
  finish: 'C’est réglé',
  later: 'Plus tard',
  closed: 'C’est noté, je le barre. Choisis la suite quand tu veux.',
  postponed: 'Pas de souci, il reste dans ta liste. Choisis la suite quand tu veux.',
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
